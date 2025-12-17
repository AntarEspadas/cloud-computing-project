"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress,
} from "@mui/material";
import { generateClient } from "aws-amplify/api";

import Toolbar from "../../components/Toolbar";
import { Tool } from "../../types/tool";
import { BoardHandle } from "../../types/board";
import { BoardUpstreamSyncClient } from "@/app/lib/board/BoardUpstreamSyncClient";
import { BoardDownstreamSyncClient } from "@/app/lib/board/BoardDownstreamSyncClient";
import { useAuth } from "@/app/lib/auth-context";
import { start } from "repl";

// Dynamic Import for Board
const Board = dynamic(() => import("../../components/Board"), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <CircularProgress />
    </Box>
  ),
});

// GraphQL Definitions
const BROADCAST_ACTION = `
  mutation BroadcastAction($roomId: String!, $actionData: String!) {
    broadcastAction(roomId: $roomId, actionData: $actionData) {
      roomId
      actionData
    }
  }
`;

const ON_ACTION_RECEIVED = `
  subscription OnActionReceived($roomId: String!) {
    onActionReceived(roomId: $roomId) {
      roomId
      actionData
    }
  }
`;

const client = generateClient();

interface RoomClientProps {
  roomId: string;
}

export default function RoomClient({ roomId }: RoomClientProps) {
  const [activeTool, setActiveTool] = useState<Tool>("SELECT");
  const [color, setColor] = useState<string>("#000000");
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [openClearDialog, setOpenClearDialog] = useState(false);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const boardRef = useRef<BoardHandle>(null);

  const { loading, user } = useAuth();

  const boardUpstreamSyncClient = useMemo(
    () => new BoardUpstreamSyncClient(roomId),
    [roomId]
  );

  const boardDownstreamSyncClient = useMemo(
    () => new BoardDownstreamSyncClient(roomId, canvas),
    [roomId, canvas]
  );

  useEffect(() => {
    if (loading || !user) return;

    console.log(boardDownstreamSyncClient, loading, user);
    boardDownstreamSyncClient.start(user.userId);

    return () => {
      boardDownstreamSyncClient.stop();
    };
  }, [boardDownstreamSyncClient, loading, user]);

  const handleBoardAction = async (data: string) => {
    // try {
    //   await client.graphql({
    //     query: BROADCAST_ACTION,
    //     variables: {
    //       roomId: roomId,
    //       actionData: data
    //     }
    //   });
    // } catch (e) {
    //   console.error("Failed to broadcast:", e);
    // }
  };

  useEffect(() => {
    // const observable = client.graphql({
    //   query: ON_ACTION_RECEIVED,
    //   variables: { roomId: roomId }
    // }) as any;

    // const subscription = observable.subscribe({
    //   next: ({ data }: any) => {
    //     const incomingData = data.onActionReceived.actionData;

    //     if (incomingData === 'REQUEST_SYNC') {
    //        const currentState = boardRef.current?.getJson();
    //        if (currentState && currentState.length > 20) {
    //          handleBoardAction(currentState);
    //        }
    //        return;
    //     }

    //     boardRef.current?.applyRemoteAction(incomingData);
    //   },
    //   error: (error: any) => console.error("Subscription error:", error)
    // });

    // Request sync slightly after mounting
    const syncTimeout = setTimeout(() => {
      // handleBoardAction('REQUEST_SYNC');
    }, 1000);

    return () => {
      // subscription.unsubscribe();
      clearTimeout(syncTimeout);
    };
  }, [roomId]);

  // Handlers
  const handleUndo = () => boardRef.current?.undo();
  const handleRedo = () => boardRef.current?.redo();
  const handleClearClick = () => setOpenClearDialog(true);
  const handleConfirmClear = () => {
    boardRef.current?.clear();
    setOpenClearDialog(false);
  };
  const handleCancelClear = () => setOpenClearDialog(false);
  const handleDelete = () => boardRef.current?.deleteSelected();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Toolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        color={color}
        onColorChange={setColor}
        strokeWidth={strokeWidth}
        onStrokeWidthChange={setStrokeWidth}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClearClick}
        onDelete={handleDelete}
      />

      <Box sx={{ flexGrow: 1, position: "relative", bgcolor: "#f5f5f5" }}>
        <Board
          ref={boardRef}
          activeTool={activeTool}
          color={color}
          strokeWidth={strokeWidth}
          onAction={boardUpstreamSyncClient.handleBoardAction}
          onCanvasChanged={setCanvas}
        />
      </Box>

      <Dialog open={openClearDialog} onClose={handleCancelClear}>
        <DialogTitle>Clear Board?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will delete everything for everyone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClear}>Cancel</Button>
          <Button
            onClick={handleConfirmClear}
            color="error"
            variant="contained"
          >
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
