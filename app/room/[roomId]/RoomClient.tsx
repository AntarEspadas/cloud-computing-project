'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  Box, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  Button,
  CircularProgress 
} from '@mui/material';
import { generateClient } from 'aws-amplify/api';

import Toolbar from '../../components/Toolbar';
import { Tool } from '../../types/tool';
import { BoardHandle } from '../../types/board';

// Dynamic Import for Board
const Board = dynamic(() => import('../../components/Board'), { 
  ssr: false,
  loading: () => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <CircularProgress />
    </Box>
  )
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
  // --- 1. MOUNTED CHECK (Fixes Hydration Error) ---
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [activeTool, setActiveTool] = useState<Tool>('SELECT');
  const [color, setColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [openClearDialog, setOpenClearDialog] = useState(false);
  const boardRef = useRef<BoardHandle>(null);

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
      console.error("Failed to broadcast:", e);
    }
  };

  useEffect(() => {
    if (!isMounted) return; // Don't subscribe until mounted

    console.log(`Subscribing to Yjs room: ${roomId}`);
    
    const observable = client.graphql({
      query: ON_ACTION_RECEIVED,
      variables: { roomId: roomId }
    }) as any;

    const subscription = observable.subscribe({
      next: ({ data }: any) => {
        const incomingData = data.onActionReceived.actionData;

        if (incomingData === 'REQUEST_SYNC') {
           const currentState = boardRef.current?.getJson();
           if (currentState && currentState.length > 20) {
             handleBoardAction(currentState);
           }
           return;
        }
        
        boardRef.current?.applyRemoteAction(incomingData);
      },
      error: (error: any) => console.error("Subscription error:", error)
    });

    // Request sync slightly after mounting
    const syncTimeout = setTimeout(() => {
        handleBoardAction('REQUEST_SYNC');
    }, 1000);

    return () => {
        subscription.unsubscribe();
        clearTimeout(syncTimeout);
    };
  }, [roomId, isMounted]); // Added isMounted to dependencies

  // Handlers
  const handleUndo = () => boardRef.current?.undo();
  const handleRedo = () => boardRef.current?.redo();
  const handleClearClick = () => setOpenClearDialog(true);
  const handleConfirmClear = () => { boardRef.current?.clear(); setOpenClearDialog(false); };
  const handleCancelClear = () => setOpenClearDialog(false);
  const handleDelete = () => boardRef.current?.deleteSelected();

  // --- 2. PREVENT SERVER RENDERING ---
  // If not mounted yet, render nothing (or a spinner). 
  // This ensures the server HTML matches the client HTML (which is empty initially).
  if (!isMounted) {
    return (
        <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
        </Box>
    );
  }

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
          onAction={handleBoardAction} 
        />
      </Box>

      <Dialog
        open={openClearDialog}
        onClose={handleCancelClear}
      >
        <DialogTitle>Clear Board?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will delete everything for everyone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClear}>Cancel</Button>
          <Button onClick={handleConfirmClear} color="error" variant="contained">Clear All</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}