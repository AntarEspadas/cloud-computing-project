"use client";

import { useState, useRef, useEffect, useMemo } from "react";
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

import Toolbar from "../../components/Toolbar";
import { Tool } from "../../types/tool";
import { BoardHandle } from "../../types/board";
import { BoardUpstreamSyncClient } from "@/app/lib/board/BoardUpstreamSyncClient";
import { BoardDownstreamSyncClient } from "@/app/lib/board/BoardDownstreamSyncClient";
import { useAuth } from "@/app/lib/auth-context";
import { actionHistory } from "@/app/lib/board/ActionHistory";
import { actionResolver } from "@/app/lib/board/ActionResolver";

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
    () => new BoardDownstreamSyncClient(roomId, canvas, actionHistory),
    [roomId, canvas]
  );

  useEffect(() => {
    actionHistory.setUpstreamSyncClient(boardUpstreamSyncClient);
  }, [boardUpstreamSyncClient]);

  useEffect(() => {
    actionResolver.setCanvas(canvas);
  }, [canvas]);

  useEffect(() => {
    if (loading || !user) return;

    boardDownstreamSyncClient.start(user.userId);

    return () => {
      boardDownstreamSyncClient.stop();
    };
  }, [boardDownstreamSyncClient, loading, user]);

  // Handlers
  const handleUndo = () => actionHistory.undo();
  const handleRedo = () => actionHistory.redo();
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
          onHistoryAction={actionHistory.addEvent}
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
