import { ObjectRecord } from "./schema";

export interface BoardHandle {
  clear: () => void;
  deleteSelected: () => void;
  getJson: () => string;
}
export interface BaseAction {
  objectType: ObjectRecord["type"];
  name: string;
}
export interface CreateAction extends BaseAction {
  type: "CREATE";
  object: fabric.Object;
}

export interface UpdateAction extends BaseAction {
  type: "UPDATE";
  object: fabric.Object;
}

export interface DeleteAction extends BaseAction {
  type: "DELETE";
}

export interface UnDeleteAction extends BaseAction {
  type: "UN_DELETE";
  object: fabric.Object;
}

export type BoardAction =
  | CreateAction
  | UpdateAction
  | DeleteAction
  | UnDeleteAction;
