import {
  BoardAction,
  DeleteAction,
  UnDeleteAction,
  UpdateAction,
} from "@/app/types/board";
import { fabric } from "fabric";
import { attributes } from "./attributes";
import { ObjectRecord } from "@/app/types/schema";

export class ActionResolver {
  private _canvas: fabric.Canvas | null = null;

  setCanvas(canvas: fabric.Canvas | null) {
    this._canvas = canvas;
  }

  resolve(action: BoardAction) {
    if (!this._canvas) return;

    const obj = this._canvas.getObjects().find((o) => o.name === action.name);

    if (action.type === "UPDATE") {
      if (!obj) return;
      this.updateObject(action, obj);
    } else if (action.type === "DELETE") {
      if (!obj) return;
      this.deleteObject(action, obj);
    } else if (action.type === "UN_DELETE") {
      if (obj) return;
      this.unDeleteObject(action);
    }

    this._canvas.requestRenderAll();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private updateObject(action: UpdateAction, obj: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actionObj: any = action.object;

    for (const attr in actionObj) {
      if (!Object.hasOwn(actionObj, attr)) continue;
      if (attributes[attr] == undefined) continue;
      obj[attr] = actionObj[attr];
    }
  }

  private deleteObject(_action: DeleteAction, obj: fabric.Object) {
    if (!this._canvas) return;

    this._canvas.remove(obj);
  }

  private unDeleteObject(action: UnDeleteAction) {
    if (!this._canvas) return;
    const fabricObj = this.instantiate(action.objectType, action.object);

    this._canvas.add(fabricObj);
  }

  private instantiate(
    type: ObjectRecord["type"],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    attributes: any
  ): fabric.Object {
    if (type === "RECTANGLE") {
      return new fabric.Rect(attributes);
    } else if (type === "ELLIPSE") {
      return new fabric.Ellipse(attributes);
    } else if (type === "TEXT") {
      return new fabric.Text(attributes.text, attributes);
    } else if (type === "PATH") {
      return new fabric.Path(attributes.path, attributes);
    } else if (type === "LINE") {
      return new fabric.Line(
        [attributes.x1, attributes.y1, attributes.x2, attributes.y2],
        attributes
      );
    }
    throw new Error(`Unknown type ${type}`);
  }
}

export const actionResolver = new ActionResolver();
