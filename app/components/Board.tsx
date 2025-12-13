'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { fabric } from 'fabric';
import { Tool } from '../types/tool';
import { BoardHandle } from '../types/board';

interface BoardProps {
  activeTool: Tool;
  color: string;
  strokeWidth: number;
  onAction?: (data: string) => void; // <--- NEW: Callback for broadcasting
}

const Board = forwardRef<BoardHandle, BoardProps>(({ activeTool, color, strokeWidth, onAction }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const activeToolRef = useRef<Tool>(activeTool);

  // Flag to prevent infinite loops (Server -> Client -> Server -> Client...)
  const isReceiving = useRef(false);

  // Keep activeToolRef in sync
  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  // --- HISTORY STATE ---
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isLocked = useRef(false);

  // --- HELPER: BROADCAST CHANGES ---
  const emitChange = () => {
    // Only emit if the change was made by US, not by the server (isReceiving)
    if (!isReceiving.current && onAction && fabricRef.current) {
        const json = JSON.stringify(fabricRef.current.toJSON());
        onAction(json);
    }
  };

  // --- EXPOSED METHODS (via Ref) ---
  useImperativeHandle(ref, () => ({
    undo: () => {
      if (historyIndexRef.current > 0) {
        isLocked.current = true;
        historyIndexRef.current -= 1;
        const prevState = historyRef.current[historyIndexRef.current];
        
        fabricRef.current?.loadFromJSON(prevState, () => {
          fabricRef.current?.renderAll();
          isLocked.current = false;
          emitChange(); // Broadcast the undo result
        });
      }
    },
    redo: () => {
      if (historyIndexRef.current < historyRef.current.length - 1) {
        isLocked.current = true;
        historyIndexRef.current += 1;
        const nextState = historyRef.current[historyIndexRef.current];
        
        fabricRef.current?.loadFromJSON(nextState, () => {
          fabricRef.current?.renderAll();
          isLocked.current = false;
          emitChange(); // Broadcast the redo result
        });
      }
    },
    clear: () => {
      const canvas = fabricRef.current;
      if (canvas) {
        isLocked.current = true; 
        canvas.clear();
        canvas.setBackgroundColor('#f3f4f6', () => {
          canvas.renderAll();
          isLocked.current = false;
          saveHistory(); 
          emitChange(); // Broadcast the clear
        });
      }
    },
    deleteSelected: () => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const activeObjects = canvas.getActiveObjects();
      
      if (activeObjects.length) {
        isLocked.current = true;
        canvas.discardActiveObject();
        canvas.remove(...activeObjects);
        canvas.requestRenderAll();
        isLocked.current = false;
        saveHistory(); 
        emitChange(); // Broadcast the delete
      }
    },
    // NEW: Handle Incoming Data from AppSync
    applyRemoteAction: (json: string) => {
        if (!fabricRef.current) return;
        
        // Optimization: Don't re-render if state hasn't changed
        const currentJson = JSON.stringify(fabricRef.current.toJSON());
        if (currentJson === json) return;

        isReceiving.current = true; // Lock broadcast
        fabricRef.current.loadFromJSON(json, () => {
            fabricRef.current?.renderAll();
            saveHistory(); // Update local history
            isReceiving.current = false; // Unlock
        });
    },
    // NEW: Get current state (useful for syncing new users)
    getJson: () => {
        return fabricRef.current?.toJSON();
    }
  }));

  // --- HELPER: SAVE HISTORY ---
  const saveHistory = () => {
    if (isLocked.current || !fabricRef.current) return;

    const json = JSON.stringify(
      fabricRef.current.toJSON(['globalCompositeOperation', 'selectable', 'evented'])
    );

    if (historyRef.current.length > 0) {
        const lastState = historyRef.current[historyIndexRef.current];
        if (lastState === json) return;
    }

    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(json);

    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
  };

  // --- EFFECT 1: INITIALIZATION & GLOBAL LISTENERS ---
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      height: window.innerHeight,
      width: window.innerWidth,
      backgroundColor: '#f3f4f6',
      isDrawingMode: false,
      selection: true,
    });
    
    fabricRef.current = canvas;
    
    saveHistory(); 

    // --- EVENT LISTENERS ---
    // Modified to call emitChange() after saving history

    canvas.on('object:modified', () => {
        saveHistory();
        emitChange();
    });
    
    canvas.on('object:added', (e) => {
      if (!e.target?.name?.includes('temp') && e.target?.type !== 'path') {
         saveHistory();
         emitChange(); 
      }
    });

    canvas.on('object:removed', () => {
        saveHistory();
        emitChange();
    });
    
    canvas.on('path:created', (e: any) => {
      const path = e.path;
      if (activeToolRef.current === 'ERASER') {
        path.globalCompositeOperation = 'destination-out';
        path.selectable = false;
        path.evented = false;
      }
      saveHistory();
      emitChange();
    });

    const handleResize = () => {
      canvas.setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObj = canvas.getActiveObject();
        if (activeObj instanceof fabric.IText && activeObj.isEditing) return;
        
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length) {
            isLocked.current = true;
            canvas.discardActiveObject();
            canvas.remove(...activeObjects);
            canvas.requestRenderAll();
            isLocked.current = false;
            saveHistory();
            emitChange();
        }
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      canvas.dispose();
    };
  }, []);

  // --- EFFECT 2: TOOL LOGIC ---
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');

    // Reset Defaults
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.skipTargetFind = false;
    canvas.defaultCursor = 'default';
    
    canvas.forEachObject(obj => {
        if (obj.globalCompositeOperation !== 'destination-out') {
            obj.selectable = true;
            obj.evented = true;
        }
    });

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
        canvas.freeDrawingBrush.color = 'rgba(0,0,0,1)'; 
        canvas.freeDrawingBrush.width = strokeWidth * 5;
        
        canvas.selection = false;
        canvas.forEachObject(obj => obj.selectable = false);
        canvas.defaultCursor = 'not-allowed';
        break;

      case 'SELECT':
        canvas.selection = true;
        break;

      case 'TEXT':
        canvas.defaultCursor = 'text';
        canvas.on('mouse:down', (opt) => {
          if (opt.target) return;
          const pointer = canvas.getPointer(opt.e);
          const text = new fabric.IText('Type here...', {
            left: pointer.x,
            top: pointer.y,
            fill: color,
            fontSize: Math.max(20, strokeWidth * 2),
            fontFamily: 'Arial',
          });
          canvas.add(text);
          canvas.setActiveObject(text);
          text.enterEditing();
          text.selectAll();
          saveHistory();
          emitChange(); // Broadcast text creation
        });
        break;

      case 'RECTANGLE':
      case 'CIRCLE':
      case 'LINE':
        canvas.defaultCursor = 'crosshair';
        canvas.selection = false;
        canvas.skipTargetFind = true; 
        
        let isDown = false;
        let origX = 0;
        let origY = 0;
        let activeShape: fabric.Object | null = null;

        canvas.on('mouse:down', (o) => {
          isDown = true;
          const pointer = canvas.getPointer(o.e);
          origX = pointer.x;
          origY = pointer.y;

          if (activeTool === 'RECTANGLE') {
            activeShape = new fabric.Rect({
              left: origX, top: origY, width: 0, height: 0, 
              fill: 'transparent', stroke: color, strokeWidth: strokeWidth
            });
          } else if (activeTool === 'CIRCLE') {
            activeShape = new fabric.Ellipse({
              left: origX, top: origY, rx: 0, ry: 0, 
              fill: 'transparent', stroke: color, strokeWidth: strokeWidth
            });
          } else if (activeTool === 'LINE') {
            activeShape = new fabric.Line([origX, origY, origX, origY], {
               stroke: color, strokeWidth: strokeWidth
            });
          }
          
          if (activeShape) {
            activeShape.name = 'temp_drawing_shape'; 
            canvas.add(activeShape);
          }
        });

        canvas.on('mouse:move', (o) => {
          if (!isDown || !activeShape) return;
          const pointer = canvas.getPointer(o.e);

          if (activeTool === 'RECTANGLE') {
            const rect = activeShape as fabric.Rect;
            if (origX > pointer.x) rect.set({ left: Math.abs(pointer.x) });
            if (origY > pointer.y) rect.set({ top: Math.abs(pointer.y) });
            rect.set({ width: Math.abs(origX - pointer.x), height: Math.abs(origY - pointer.y) });
          } 
          else if (activeTool === 'CIRCLE') {
            const ell = activeShape as fabric.Ellipse;
            if (origX > pointer.x) ell.set({ left: Math.abs(pointer.x) });
            if (origY > pointer.y) ell.set({ top: Math.abs(pointer.y) });
            ell.set({ rx: Math.abs(origX - pointer.x) / 2, ry: Math.abs(origY - pointer.y) / 2 });
          } 
          else if (activeTool === 'LINE') {
            const line = activeShape as fabric.Line;
            line.set({ x2: pointer.x, y2: pointer.y });
          }
          
          canvas.renderAll();
        });

        canvas.on('mouse:up', () => {
          isDown = false;
          if (activeShape) {
            activeShape.setCoords();
            activeShape.name = '';   
            saveHistory();
            emitChange(); // Broadcast finished shape
          }
          activeShape = null;
        });
        break;
    }
  }, [activeTool, color, strokeWidth]);

  return (
    <div className="absolute inset-0 z-10 overflow-hidden">
      <canvas ref={canvasRef} />
    </div>
  );
});

Board.displayName = "Board";
export default Board;