'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic'; // 1. Import Dynamic
import { 
  Box, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  Button,
  CircularProgress // 2. Import Loader
} from '@mui/material';

// 3. AWS Imports
import { generateClient } from 'aws-amplify/api';

import Toolbar from '../../components/Toolbar';
// DELETE: import Board from '../../components/Board'; <--- Removed static import
import { Tool } from '../../types/tool';
import { BoardHandle } from '../../types/board';

// 4. Dynamic Import (Fixes SSR Error)
const Board = dynamic(() => import('../../components/Board'), { 
  ssr: false,
  loading: () => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <CircularProgress />
    </Box>
  )
});

// 5. GraphQL Definitions
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
  const [activeTool, setActiveTool] = useState<Tool>('SELECT');
  const [color, setColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  
  const [openClearDialog, setOpenClearDialog] = useState(false);

  const boardRef = useRef<BoardHandle>(null);

  // --- 6. REAL-TIME SUBSCRIPTION ---
  useEffect(() => {
    console.log(`Subscribing to room: ${roomId}`);
    
    // Cast to 'any' to avoid TypeScript complaining that .subscribe doesn't exist on Promise
    const observable = client.graphql({
      query: ON_ACTION_RECEIVED,
      variables: { roomId: roomId }
    }) as any;

    const subscription = observable.subscribe({
      next: ({ data }: any) => {
        const incomingData = data.onActionReceived.actionData;
        // Pass data to the Board component
        boardRef.current?.applyRemoteAction(incomingData);
      },
      error: (error: any) => console.error("Subscription error:", error)
    });

    return () => subscription.unsubscribe();
  }, [roomId]);

  // --- 7. BROADCAST HANDLER ---
  const handleBoardAction = async (data: string) => {
    try {
      await client.graphql({
        query: BROADCAST_ACTION,
        variables: {
          roomId: roomId,
          actionData: data
        }
      });
    } catch (e) {
      console.error("Failed to broadcast action", e);
    }
  };

  const handleUndo = () => boardRef.current?.undo();
  const handleRedo = () => boardRef.current?.redo();
  
  const handleClearClick = () => setOpenClearDialog(true);
  
  const handleConfirmClear = () => {
    boardRef.current?.clear();
    setOpenClearDialog(false);
  };

  const handleCancelClear = () => setOpenClearDialog(false);

  const handleDelete = () => {
    boardRef.current?.deleteSelected();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      
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
      
      <Box sx={{ flexGrow: 1, position: 'relative', bgcolor: '#f5f5f5' }}>
        <Board 
          ref={boardRef}
          activeTool={activeTool} 
          color={color} 
          strokeWidth={strokeWidth}
          onAction={handleBoardAction} // <--- 8. Connect the broadcaster
        />
      </Box>

      <Dialog
        open={openClearDialog}
        onClose={handleCancelClear}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Clear Board?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This will delete everything on the canvas and reset your undo history. This action cannot be fully undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClear} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmClear} color="error" variant="contained" autoFocus>
            Clear All
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}