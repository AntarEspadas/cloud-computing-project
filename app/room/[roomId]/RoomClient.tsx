'use client';

import React, { useState } from 'react';
import { Box } from '@mui/material';
import Toolbar from '../../components/Toolbar';
import Board from '../../components/Board';
import { Tool } from '../../types/tool';

interface RoomClientProps {
  roomId: string;
}

export default function RoomClient({ roomId }: RoomClientProps) {
  // 1. Central State Management
  const [activeTool, setActiveTool] = useState<Tool>('SELECT');
  const [color, setColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);

  // 2. Mock History Handlers (Phase 3 will implement these)
  const handleUndo = () => console.log('Undo');
  const handleRedo = () => console.log('Redo');
  const handleClear = () => console.log('Clear');

  return (
    // MUI Box replacing the old div for layout
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      
      {/* 3. The Toolbar (Controls) */}
      <Toolbar 
        activeTool={activeTool} 
        onToolChange={setActiveTool}
        color={color}
        onColorChange={setColor}
        strokeWidth={strokeWidth}
        onStrokeWidthChange={setStrokeWidth}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
      />
      
      {/* 4. The Board (Canvas) */}
      <Box sx={{ flexGrow: 1, position: 'relative', bgcolor: '#f5f5f5' }}>
        <Board 
          activeTool={activeTool} 
          color={color} 
          strokeWidth={strokeWidth} 
        />
      </Box>

    </Box>
  );
}