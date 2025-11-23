'use client';

import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { Tool } from '../types/tool';

interface BoardProps {
  activeTool: Tool;
  color: string;
  strokeWidth: number;
}

const Board: React.FC<BoardProps> = ({ activeTool, color, strokeWidth }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new fabric.Canvas(canvasRef.current, {
      height: window.innerHeight,
      width: window.innerWidth,
      backgroundColor: '#f3f4f6',
      isDrawingMode: false,
    });
    fabricRef.current = canvas;

    const handleResize = () => {
      canvas.setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = false;
    canvas.selection = true;

    switch (activeTool) {
      case 'PEN':
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = color;
        canvas.freeDrawingBrush.width = strokeWidth;
        break;
      case 'ERASER':
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = '#f3f4f6'; // Match background color
        canvas.freeDrawingBrush.width = strokeWidth * 2; // Eraser usually bigger
        break;
      case 'SELECT':
        canvas.selection = true;
        break;
      // Shape logic to be expanded in Phase 3
      case 'RECTANGLE':
      case 'CIRCLE':
      case 'LINE':
      case 'TEXT':
         // For now, just select
         break;
    }
  }, [activeTool, color, strokeWidth]);

  return (
    <div className="absolute inset-0 z-10 overflow-hidden">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Board;