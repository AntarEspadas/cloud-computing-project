export type Tool = 
  | 'SELECT' 
  | 'PEN' 
  | 'ERASER' 
  | 'RECTANGLE' 
  | 'CIRCLE' 
  | 'LINE' 
  | 'TEXT';

export interface ToolState {
  activeTool: Tool;
  color: string;
  strokeWidth: number;
}