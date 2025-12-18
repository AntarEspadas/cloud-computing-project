export interface BoardHandle {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  deleteSelected: () => void;

  applyRemoteAction: (data: string) => void;
  getJson: () => string;
}

export interface CreateAction {
  type: "CREATE";
  name: string;
  object: fabric.Object;
}

export interface UpdateAction {
  type: "UPDATE";
  name: string;
  object: fabric.Object;
}

export interface DeleteAction {
  type: "DELETE";
  name: string;
}

export type BoardAction = CreateAction | UpdateAction | DeleteAction;
