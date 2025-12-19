"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { fabric } from "fabric";
import { Tool } from "../types/tool";
import {
  BoardAction,
  BoardHandle,
  CreateAction,
  DeleteAction,
  UpdateAction,
} from "../types/board";
import { getType } from "../lib/util";

interface BoardProps {
  activeTool: Tool;
  color: string;
  strokeWidth: number;
  onAction?: (data: BoardAction) => void;
  onCanvasChanged?: (canvas: fabric.Canvas | null) => void;
  onHistoryAction?: (data: BoardAction) => void;
}

const Board = forwardRef<BoardHandle, BoardProps>(
  (
    {
      activeTool,
      color,
      strokeWidth,
      onAction,
      onCanvasChanged,
      onHistoryAction,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);
    const activeToolRef = useRef<Tool>(activeTool);

    useEffect(() => {
      activeToolRef.current = activeTool;
    }, [activeTool]);

    // --- HISTORY STATE ---
    const isLocked = useRef(false);

    // --- EXPOSED METHODS (via Ref) ---
    useImperativeHandle(ref, () => ({
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
      getJson: () => {
        return JSON.stringify(fabricRef.current?.toJSON());
      },
    }));

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

      canvas.on("object:scaling", (e) => {
        if (!e.target) return;
        onAction?.({
          type: "UPDATE",
          name: e.target.name!,
          object: e.target,
          objectType: getType(e.target),
        });
      });

      canvas.on("object:rotating", (e) => {
        if (!e.target) return;
        onAction?.({
          type: "UPDATE",
          name: e.target.name!,
          object: e.target,
          objectType: getType(e.target),
        });
      });

      canvas.on("object:moving", (e) => {
        if (!e.target) return;
        onAction?.({
          type: "UPDATE",
          name: e.target.name!,
          object: e.target,
          objectType: getType(e.target),
        });
      });

      canvas.on("object:modified", (e) => {
        if (!e.target) return;
        onHistoryAction?.({
          type: "UPDATE",
          name: e.target.name!,
          object: e.target,
          objectType: getType(e.target),
        });
      });

      canvas.on("text:changed", (e) => {
        if (!e.target) return;
        const action: UpdateAction = {
          type: "UPDATE",
          name: e.target.name!,
          object: e.target,
          objectType: getType(e.target),
        };
        onAction?.(action);
        onHistoryAction?.(action);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      canvas.on("path:created", (e: any) => {
        const name = crypto.randomUUID();
        e.path.name = name;
        e.path.fill = "transparent";
        const action: CreateAction = {
          type: "CREATE",
          name,
          object: e.path,
          objectType: "PATH",
        };
        onAction?.(action);
        onHistoryAction?.(action);
      });

      canvas.on("object:removed", (e) => {
        if (!e.target) return;
        const action: DeleteAction = {
          type: "DELETE",
          name: e.target.name!,
          objectType: getType(e.target),
        };
        onAction?.(action);
        onHistoryAction?.(action);
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
            isLocked.current = true;
            canvas.discardActiveObject();
            canvas.remove(...activeObjects);
            canvas.requestRenderAll();
            isLocked.current = false;
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
          canvas.freeDrawingBrush.decimate = 10;
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
            const name = crypto.randomUUID();
            const defaultText = "Type here...";
            if (opt.target) return;
            const pointer = canvas.getPointer(opt.e);
            const text = new fabric.IText(defaultText, {
              name,
              left: pointer.x,
              top: pointer.y,
              fill: color,
              fontSize: Math.max(20, strokeWidth * 2),
              fontFamily: "Arial",
            });
            const action: CreateAction = {
              type: "CREATE",
              name,
              object: text,
              objectType: "TEXT",
            };
            onAction?.(action);
            onHistoryAction?.(action);
            canvas.add(text);
            canvas.setActiveObject(text);
            text.enterEditing();
            text.selectAll();
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
                type: "CREATE",
                name,
                object: activeShape,
                objectType: "RECTANGLE",
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
                type: "CREATE",
                name,
                object: activeShape,
                objectType: "RECTANGLE",
              });
            } else if (activeTool === "LINE") {
              const name = crypto.randomUUID();
              activeShape = new fabric.Line([origX, origY, origX, origY], {
                name,
                stroke: color,
                strokeWidth: strokeWidth,
              });
              onAction?.({
                type: "CREATE",
                name,
                object: activeShape,
                objectType: "LINE",
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
                type: "UPDATE",
                name: rect.name!,
                object: rect,
                objectType: "RECTANGLE",
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
                type: "UPDATE",
                name: ell.name!,
                object: ell,
                objectType: "ELLIPSE",
              });
            } else if (activeTool === "LINE") {
              const line = activeShape as fabric.Line;
              line.set({ x2: pointer.x, y2: pointer.y });
              onAction?.({
                type: "UPDATE",
                name: line.name!,
                object: line,
                objectType: "LINE",
              });
            }

            canvas.renderAll();
          });

          canvas.on("mouse:up", () => {
            isDown = false;
            if (activeShape) {
              activeShape.setCoords();
              onHistoryAction?.({
                type: "CREATE",
                name: activeShape.name!,
                object: activeShape,
                objectType: getType(activeShape),
              });
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
