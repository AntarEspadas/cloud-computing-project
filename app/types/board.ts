export interface BoardHandle {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  deleteSelected: () => void;

  applyRemoteAction: (data: string) => void;
  getJson: () => string;
}

export interface RectAction {
  left: number;
  top: number;
  width: number;
  height: number;
  stroke: string;
  strokeWidth: number;
  fill: string;
  name: string;
}

export interface CreateRectAction extends RectAction {
  type: "CREATE_RECTANGLE";
}

export interface UpdateRectAction extends RectAction {
  type: "UPDATE_RECTANGLE";
  name: string;
}

export interface DeleteRectAction {
  type: "DELETE_RECTANGLE";
  name: string;
}

export interface UpdateObjectAction {
  type: "UPDATE_OBJECT";
  name: string;
  left?: number;
  top?: number;
  skewX?: number;
  skewY?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
}

export type BoardAction =
  | CreateRectAction
  | UpdateRectAction
  | DeleteRectAction
  | UpdateObjectAction;
