export interface BoardHandle {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  deleteSelected: () => void;

  applyRemoteAction: (data: string) => void;
  getJson: () => string;
}

export interface ObjectAction {
  name: string;
  left: number;
  top: number;
}

export interface RectAction extends ObjectAction {
  width: number;
  height: number;
  stroke: string;
  strokeWidth: number;
  fill: string;
}

export interface ElipseAction extends ObjectAction {
  rx: number;
  ry: number;
  stroke: string;
  strokeWidth: number;
  fill: string;
}

export interface TextAction extends ObjectAction {
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
}

export interface CreateRectAction extends RectAction {
  type: "CREATE_RECTANGLE";
}

export interface UpdateRectAction extends RectAction {
  type: "UPDATE_RECTANGLE";
}

export interface CreateEllipseAction extends ElipseAction {
  type: "CREATE_ELLIPSE";
}

export interface UpdateEllipseAction extends ElipseAction {
  type: "UPDATE_ELLIPSE";
}

export interface CreateTextAction extends TextAction {
  type: "CREATE_TEXT";
}

export interface UpdateTextAction extends TextAction {
  type: "UPDATE_TEXT";
}

export interface DeleteObjectAction {
  type: "DELETE_OBJECT";
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
  | CreateEllipseAction
  | UpdateEllipseAction
  | CreateTextAction
  | UpdateTextAction
  | DeleteObjectAction
  | UpdateObjectAction;
