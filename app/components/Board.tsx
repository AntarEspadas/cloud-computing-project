"use client";

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { fabric } from "fabric";
import { Tool } from "../types/tool";
import { BoardAction, BoardHandle } from "../types/board";
import { on } from "events";

interface BoardProps {
  activeTool: Tool;
  color: string;
  strokeWidth: number;
  onAction?: (data: BoardAction) => void;
  onCanvasChanged?: (canvas: fabric.Canvas | null) => void;
}

const Board = forwardRef<BoardHandle, BoardProps>(
  ({ activeTool, color, strokeWidth, onAction, onCanvasChanged }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);
    const activeToolRef = useRef<Tool>(activeTool);

    const isReceiving = useRef(false);

    useEffect(() => {
      activeToolRef.current = activeTool;
    }, [activeTool]);

    // --- HISTORY STATE ---
    const historyRef = useRef<string[]>([]);
    const historyIndexRef = useRef<number>(-1);
    const isLocked = useRef(false);

    // // --- HELPER: BROADCAST CHANGES ---
    // const emitChange = () => {
    //   if (
    //     !isReceiving.current &&
    //     !isLocked.current &&
    //     onAction &&
    //     fabricRef.current
    //   ) {
    //     const json = JSON.stringify(fabricRef.current.toJSON());
    //     onAction(json);
    //   }
    // };

    // --- EXPOSED METHODS (via Ref) ---
    useImperativeHandle(ref, () => ({
      undo: () => {
        // TODO: Implement redo functionality
        if (historyIndexRef.current > 0) {
          isLocked.current = true;
          historyIndexRef.current -= 1;
          const prevState = historyRef.current[historyIndexRef.current];

          fabricRef.current?.loadFromJSON(prevState, () => {
            if (!fabricRef.current) return;
            fabricRef.current.renderAll();
            isLocked.current = false;
            emitChange();
          });
        }
      },
      redo: () => {
        // TODO: Implement redo functionality
        // if (historyIndexRef.current < historyRef.current.length - 1) {
        //   isLocked.current = true;
        //   historyIndexRef.current += 1;
        //   const nextState = historyRef.current[historyIndexRef.current];
        //   fabricRef.current?.loadFromJSON(nextState, () => {
        //     if (!fabricRef.current) return;
        //     fabricRef.current.renderAll();
        //     isLocked.current = false;
        //     emitChange();
        //   });
        // }
      },
      clear: () => {
        // TODO: Implement clear functionality
        // const canvas = fabricRef.current;
        // if (canvas) {
        //   isLocked.current = true;
        //   canvas.clear();
        //   canvas.setBackgroundColor("#f3f4f6", () => {
        //     if (!fabricRef.current) return;
        //     fabricRef.current.renderAll();
        //     isLocked.current = false;
        //     saveHistory();
        //     emitChange();
        //   });
        // }
      },
      deleteSelected: () => {
        // TODO: Implement delete selected functionality
        // const canvas = fabricRef.current;
        // if (!canvas) return;
        // const activeObjects = canvas.getActiveObjects();
        // if (activeObjects.length) {
        //   isLocked.current = true;
        //   canvas.discardActiveObject();
        //   canvas.remove(...activeObjects);
        //   canvas.requestRenderAll();
        //   isLocked.current = false;
        //   saveHistory();
        //   emitChange();
        // }
      },
      applyRemoteAction: (json: string) => {
        if (!fabricRef.current) return;

        const currentJson = JSON.stringify(fabricRef.current.toJSON());
        if (currentJson === json) return;

        isReceiving.current = true;

        isLocked.current = true;

        fabricRef.current.loadFromJSON(json, () => {
          if (!fabricRef.current) return;
          fabricRef.current.renderAll();

          isLocked.current = false;
          saveHistory();

          isReceiving.current = false;
        });
      },
      getJson: () => {
        return JSON.stringify(fabricRef.current?.toJSON());
      },
    }));

    // --- HELPER: SAVE HISTORY ---
    const saveHistory = () => {
      if (isLocked.current || !fabricRef.current) return;

      const json = JSON.stringify(
        fabricRef.current.toJSON(["selectable", "evented"])
      );

      if (historyRef.current.length > 0) {
        const lastState = historyRef.current[historyIndexRef.current];
        if (lastState === json) return;
      }

      const newHistory = historyRef.current.slice(
        0,
        historyIndexRef.current + 1
      );
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
        backgroundColor: "#f3f4f6",
        isDrawingMode: false,
        selection: true,
      });

      fabricRef.current = canvas;

      onCanvasChanged?.(canvas);

      saveHistory();

      // --- EVENT LISTENERS ---
      const handleModification = () => {
        saveHistory();
      };

      canvas.on("object:modified", handleModification);

      canvas.on("object:added", (e) => {
        if (!e.target?.name?.includes("temp") && e.target?.type !== "path") {
          handleModification();
        }
      });

      canvas.on("object:removed", handleModification);

      canvas.on("path:created", () => {
        handleModification();
      });

      canvas.on("object:scaling", (e) => {
        if (!e.target) return;
        onAction?.({
          type: "UPDATE_OBJECT",
          name: e.target.name!,
          left: e.target.left,
          top: e.target.top,
          skewX: e.target.skewX,
          skewY: e.target.skewY,
          scaleX: e.target.scaleX,
          scaleY: e.target.scaleY,
          angle: e.target.angle,
        });
      });

      canvas.on("object:rotating", (e) => {
        if (!e.target) return;
        onAction?.({
          type: "UPDATE_OBJECT",
          name: e.target.name!,
          left: e.target.left,
          top: e.target.top,
          skewX: e.target.skewX,
          skewY: e.target.skewY,
          scaleX: e.target.scaleX,
          scaleY: e.target.scaleY,
          angle: e.target.angle,
        });
      });

      canvas.on("object:moving", (e) => {
        if (!e.target) return;
        onAction?.({
          type: "UPDATE_OBJECT",
          name: e.target.name!,
          left: e.target.left,
          top: e.target.top,
          skewX: e.target.skewX,
          skewY: e.target.skewY,
          scaleX: e.target.scaleX,
          scaleY: e.target.scaleY,
          angle: e.target.angle,
        });
      });

      const handleResize = () => {
        canvas.setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Delete" || e.key === "Backspace") {
          const activeObj = canvas.getActiveObject();
          if (activeObj instanceof fabric.IText && activeObj.isEditing) return;

          const activeObjects = canvas.getActiveObjects();
          if (activeObjects.length) {
            for (const obj of activeObjects) {
              onAction?.({
                type: "DELETE_OBJECT",
                name: obj.name!,
              });
            }
            isLocked.current = true;
            canvas.discardActiveObject();
            canvas.remove(...activeObjects);
            canvas.requestRenderAll();
            isLocked.current = false;

            saveHistory();
          }
        }
      };

      window.addEventListener("resize", handleResize);
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("keydown", handleKeyDown);

        canvas.dispose();
        onCanvasChanged?.(null);
        fabricRef.current = null;
      };
    }, []);

    // --- EFFECT 2: TOOL LOGIC ---
    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      canvas.off("mouse:down");
      canvas.off("mouse:move");
      canvas.off("mouse:up");

      canvas.isDrawingMode = false;
      canvas.selection = false;
      canvas.skipTargetFind = false;
      canvas.defaultCursor = "default";

      canvas.forEachObject((obj) => {
        obj.selectable = true;
        obj.evented = true;
      });

      switch (activeTool) {
        case "PEN":
          canvas.isDrawingMode = true;
          canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
          canvas.freeDrawingBrush.color = color;
          canvas.freeDrawingBrush.width = strokeWidth;
          break;

        case "ERASER":
          canvas.isDrawingMode = false;
          canvas.selection = false;
          canvas.defaultCursor = "crosshair";

          canvas.forEachObject((obj) => {
            obj.selectable = false;
            obj.evented = true;
          });

          let isErasing = false;

          canvas.on("mouse:down", (opt) => {
            isErasing = true;
            if (opt.target && opt.target.type === "path") {
              canvas.remove(opt.target);
              canvas.requestRenderAll();
            }
          });

          canvas.on("mouse:up", () => {
            isErasing = false;
          });

          canvas.on("mouse:move", (opt) => {
            if (isErasing && opt.target) {
              if (opt.target.type === "path") {
                canvas.remove(opt.target);
                canvas.requestRenderAll();
              }
            }
          });
          break;

        case "SELECT":
          canvas.selection = true;
          break;

        case "TEXT":
          canvas.defaultCursor = "text";
          canvas.on("mouse:down", (opt) => {
            if (opt.target) return;
            const pointer = canvas.getPointer(opt.e);
            const text = new fabric.IText("Type here...", {
              left: pointer.x,
              top: pointer.y,
              fill: color,
              fontSize: Math.max(20, strokeWidth * 2),
              fontFamily: "Arial",
            });
            canvas.add(text);
            canvas.setActiveObject(text);
            text.enterEditing();
            text.selectAll();
            saveHistory();
            // emitChange();
          });
          break;

        case "RECTANGLE":
        case "CIRCLE":
        case "LINE":
          canvas.defaultCursor = "crosshair";
          canvas.selection = false;
          canvas.skipTargetFind = true;

          let isDown = false;
          let origX = 0;
          let origY = 0;
          let activeShape: fabric.Object | null = null;

          canvas.on("mouse:down", (o) => {
            isDown = true;
            const pointer = canvas.getPointer(o.e);
            origX = pointer.x;
            origY = pointer.y;

            if (activeTool === "RECTANGLE") {
              const name = crypto.randomUUID();
              activeShape = new fabric.Rect({
                name,
                left: origX,
                top: origY,
                width: 0,
                height: 0,
                fill: "transparent",
                stroke: color,
                strokeWidth: strokeWidth,
              });

              onAction?.({
                type: "CREATE_RECTANGLE",
                name,
                left: origX,
                top: origY,
                width: 0,
                height: 0,
                fill: "transparent",
                stroke: color,
                strokeWidth: strokeWidth,
              });
            } else if (activeTool === "CIRCLE") {
              const name = crypto.randomUUID();
              activeShape = new fabric.Ellipse({
                name,
                left: origX,
                top: origY,
                rx: 0,
                ry: 0,
                fill: "transparent",
                stroke: color,
                strokeWidth: strokeWidth,
              });
              onAction?.({
                type: "CREATE_ELLIPSE",
                name,
                left: origX,
                top: origY,
                rx: 0,
                ry: 0,
                fill: "transparent",
                stroke: color,
                strokeWidth: strokeWidth,
              });
            } else if (activeTool === "LINE") {
              activeShape = new fabric.Line([origX, origY, origX, origY], {
                stroke: color,
                strokeWidth: strokeWidth,
              });
            }

            if (activeShape) {
              canvas.add(activeShape);
            }
          });

          canvas.on("mouse:move", (o) => {
            if (!isDown || !activeShape) return;
            const pointer = canvas.getPointer(o.e);

            if (activeTool === "RECTANGLE") {
              const rect = activeShape as fabric.Rect;
              let left = rect.left!;
              let top = rect.top!;
              const width = Math.abs(origX - pointer.x);
              const height = Math.abs(origY - pointer.y);
              if (origX > pointer.x) {
                left = Math.abs(pointer.x);
                rect.set({ left });
              }
              if (origY > pointer.y) {
                top = Math.abs(pointer.y);
                rect.set({ top });
              }
              rect.set({
                width,
                height,
              });
              onAction?.({
                type: "UPDATE_RECTANGLE",
                name: rect.name!,
                left,
                top,
                width,
                height,
                fill: "transparent",
                stroke: color,
                strokeWidth: strokeWidth,
              });
            } else if (activeTool === "CIRCLE") {
              const ell = activeShape as fabric.Ellipse;
              let left = ell.left!;
              let top = ell.top!;
              const rx = Math.abs(origX - pointer.x) / 2;
              const ry = Math.abs(origY - pointer.y) / 2;
              if (origX > pointer.x) {
                left = Math.abs(pointer.x);
                ell.set({ left });
              }
              if (origY > pointer.y) {
                top = Math.abs(pointer.y);
                ell.set({ top });
              }
              ell.set({
                rx,
                ry,
              });
              onAction?.({
                type: "UPDATE_ELLIPSE",
                name: ell.name!,
                left,
                top,
                rx,
                ry,
                fill: "transparent",
                stroke: color,
                strokeWidth: strokeWidth,
              });
            } else if (activeTool === "LINE") {
              const line = activeShape as fabric.Line;
              line.set({ x2: pointer.x, y2: pointer.y });
            }

            canvas.renderAll();
          });

          canvas.on("mouse:up", () => {
            isDown = false;
            if (activeShape) {
              activeShape.setCoords();
              saveHistory();
              // emitChange();
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
  }
);

Board.displayName = "Board";
export default Board;
