export interface BoardHandle {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  deleteSelected: () => void;
}