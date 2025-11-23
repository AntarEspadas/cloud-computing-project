'use client';

import React, { useState } from 'react';
import { Tool } from '../types/tool';

// MUI Imports
import { 
  AppBar, 
  Toolbar as MuiToolbar, 
  Typography, 
  ToggleButton, 
  ToggleButtonGroup,
  Box,
  Tooltip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  Slider,
  Stack,
  Button
} from '@mui/material';

// MUI Icons
import MouseIcon from '@mui/icons-material/Mouse';
import BrushIcon from '@mui/icons-material/Brush'; // Pens group
import CreateIcon from '@mui/icons-material/Create'; // Pen tool
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal'; // Eraser
import categoryIcon from '@mui/icons-material/Category'; // Shapes group
import CropSquareIcon from '@mui/icons-material/CropSquare';
import CircleIcon from '@mui/icons-material/Circle';
import ShowChartIcon from '@mui/icons-material/ShowChart'; // Line
import TextFieldsIcon from '@mui/icons-material/TextFields'; // Text
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface ToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  color: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  activeTool, 
  onToolChange, 
  color, 
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onUndo,
  onRedo,
  onClear
}) => {
  
  // --- State for Dropdowns ---
  const [shapesAnchor, setShapesAnchor] = useState<null | HTMLElement>(null);
  const [pensAnchor, setPensAnchor] = useState<null | HTMLElement>(null);

  // --- Handlers ---
  
  const handleToolSelect = (event: React.MouseEvent<HTMLElement>, newTool: Tool | null) => {
    if (newTool) onToolChange(newTool);
  };

  // Shapes Menu Handlers
  const openShapesMenu = (event: React.MouseEvent<HTMLElement>) => setShapesAnchor(event.currentTarget);
  const closeShapesMenu = () => setShapesAnchor(null);
  const selectShape = (tool: Tool) => {
    onToolChange(tool);
    closeShapesMenu();
  };

  // Pens Popover Handlers
  const openPensMenu = (event: React.MouseEvent<HTMLElement>) => setPensAnchor(event.currentTarget);
  const closePensMenu = () => setPensAnchor(null);

  // Determine if a "Shape" tool is currently active to highlight the dropdown button
  const isShapeActive = ['RECTANGLE', 'CIRCLE', 'LINE'].includes(activeTool);
  // Determine if a "Pen" tool is active
  const isPenActive = ['PEN', 'ERASER'].includes(activeTool);

  return (
    <AppBar position="static" color="default" elevation={1} sx={{ zIndex: 20 }}>
      <MuiToolbar variant="dense">
        <Typography variant="h6" sx={{ mr: 3, fontWeight: 'bold', color: '#333' }}>
          Whiteboard
        </Typography>

        <Divider orientation="vertical" flexItem sx={{ mr: 2 }} />

        {/* --- Main Tools --- */}
        <ToggleButtonGroup
          value={activeTool}
          exclusive
          onChange={handleToolSelect}
          size="small"
          sx={{ mr: 2 }}
        >
          {/* 1. Select */}
          <ToggleButton value="SELECT">
            <Tooltip title="Select">
              <MouseIcon />
            </Tooltip>
          </ToggleButton>

          {/* 2. Text */}
          <ToggleButton value="TEXT">
             <Tooltip title="Text Box">
              <TextFieldsIcon />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        {/* 3. Shapes Dropdown */}
        <Box sx={{ mr: 2 }}>
          <Button
            variant={isShapeActive ? "contained" : "outlined"}
            color={isShapeActive ? "primary" : "inherit"}
            onClick={openShapesMenu}
            endIcon={<ArrowDropDownIcon />}
            sx={{ height: 40, px: 2, minWidth: 110 }}
          >
            {activeTool === 'CIRCLE' ? 'Circle' : activeTool === 'LINE' ? 'Line' : 'Shapes'}
          </Button>
          <Menu
            anchorEl={shapesAnchor}
            open={Boolean(shapesAnchor)}
            onClose={closeShapesMenu}
          >
            <MenuItem onClick={() => selectShape('RECTANGLE')}>
              <CropSquareIcon sx={{ mr: 1 }} /> Rectangle
            </MenuItem>
            <MenuItem onClick={() => selectShape('CIRCLE')}>
              <CircleIcon sx={{ mr: 1 }} /> Circle
            </MenuItem>
            <MenuItem onClick={() => selectShape('LINE')}>
              <ShowChartIcon sx={{ mr: 1 }} /> Line
            </MenuItem>
          </Menu>
        </Box>

        {/* 4. Pens Dropdown (Popover for complex content) */}
        <Box sx={{ mr: 2 }}>
          <Button
            variant={isPenActive ? "contained" : "outlined"}
            color={isPenActive ? "primary" : "inherit"}
            onClick={openPensMenu}
            endIcon={<ArrowDropDownIcon />}
            sx={{ height: 40, px: 2, minWidth: 100 }}
          >
            {activeTool === 'ERASER' ? 'Eraser' : 'Pen'}
          </Button>

          <Popover
            open={Boolean(pensAnchor)}
            anchorEl={pensAnchor}
            onClose={closePensMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            <Box sx={{ p: 2, width: 250 }}>
              {/* Pen vs Eraser Toggle */}
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>Tool Type</Typography>
              <ToggleButtonGroup
                value={activeTool}
                exclusive
                onChange={handleToolSelect}
                size="small"
                fullWidth
                sx={{ mb: 2 }}
              >
                <ToggleButton value="PEN"><CreateIcon sx={{ mr: 1 }} /> Pen</ToggleButton>
                <ToggleButton value="ERASER"><AutoFixNormalIcon sx={{ mr: 1 }} /> Eraser</ToggleButton>
              </ToggleButtonGroup>

              {/* Stroke Width Slider */}
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Size: {strokeWidth}px
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'grey.500' }} />
                <Slider 
                  value={strokeWidth} 
                  min={1} 
                  max={50} 
                  onChange={(_, val) => onStrokeWidthChange(val as number)} 
                  size="small"
                />
                <Box sx={{ width: 15, height: 15, borderRadius: '50%', bgcolor: 'grey.500' }} />
              </Stack>

              {/* Color Picker (Only if Pen is active) */}
              {activeTool !== 'ERASER' && (
                <>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>Color</Typography>
                  <Stack direction="row" spacing={1}>
                    {/* Quick Colors */}
                    {['#000000', '#ff0000', '#0000ff', '#008000'].map(c => (
                      <Box 
                        key={c}
                        onClick={() => onColorChange(c)}
                        sx={{ 
                          width: 24, height: 24, borderRadius: '50%', bgcolor: c, cursor: 'pointer',
                          border: color === c ? '2px solid #666' : '1px solid #ddd'
                        }} 
                      />
                    ))}
                    {/* Custom Picker */}
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => onColorChange(e.target.value)}
                      style={{ width: 24, height: 24, padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                    />
                  </Stack>
                </>
              )}
            </Box>
          </Popover>
        </Box>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* 5. History Actions */}
        <Stack direction="row" spacing={1}>
          <Tooltip title="Undo">
            <IconButton onClick={onUndo} size="small">
              <UndoIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Redo">
            <IconButton onClick={onRedo} size="small">
              <RedoIcon />
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <Tooltip title="Clear Page">
            <IconButton onClick={onClear} color="error" size="small">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>

      </MuiToolbar>
    </AppBar>
  );
};

export default Toolbar;