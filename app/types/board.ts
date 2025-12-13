export interface BoardHandle {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  deleteSelected: () => void;

  applyRemoteAction: (data: string) => void;
  getJson: () => any;
}