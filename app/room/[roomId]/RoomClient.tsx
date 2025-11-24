'use client';

import React, { useState, useRef } from 'react';
import { 
  Box, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  Button 
} from '@mui/material';
import Toolbar from '../../components/Toolbar';
import Board from '../../components/Board';
import { Tool } from '../../types/tool';
import { BoardHandle } from '../../types/board';

interface RoomClientProps {
  roomId: string;
}

export default function RoomClient({ roomId }: RoomClientProps) {
  const [activeTool, setActiveTool] = useState<Tool>('SELECT');
  const [color, setColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  
  // State to control the visibility of the custom Alert Dialog
  const [openClearDialog, setOpenClearDialog] = useState(false);

  const boardRef = useRef<BoardHandle>(null);

  const handleUndo = () => boardRef.current?.undo();
  const handleRedo = () => boardRef.current?.redo();
  
  // 1. When user clicks "Clear", just open the popup
  const handleClearClick = () => {
    setOpenClearDialog(true);
  };

  // 2. The actual action when they confirm inside the popup
  const handleConfirmClear = () => {
    boardRef.current?.clear();
    setOpenClearDialog(false);
  };

  // 3. Close popup without clearing
  const handleCancelClear = () => {
    setOpenClearDialog(false);
  };

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
        onClear={handleClearClick} // Call the popup opener
        onDelete={handleDelete}
      />
      
      <Box sx={{ flexGrow: 1, position: 'relative', bgcolor: '#f5f5f5' }}>
        <Board 
          ref={boardRef}
          activeTool={activeTool} 
          color={color} 
          strokeWidth={strokeWidth} 
        />
      </Box>

      {/* --- CUSTOM ALERT DIALOG --- */}
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