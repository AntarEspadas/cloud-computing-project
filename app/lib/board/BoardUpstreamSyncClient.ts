import { BoardAction, UpdateAction } from "@/app/types/board";
import { client } from "../amplify";
import { throttle } from "../util";
import { getCurrentUser } from "aws-amplify/auth";
import { attributes } from "./attributes";
import { ObjectRecord } from "@/app/types/schema";
import { fabric } from "fabric";

const UPDATE_INTERVAL_MS = 500;

export class BoardUpstreamSyncClient {
  private _userId: string | null = null;
  constructor(private boardId: string) {
    getCurrentUser().then((user) => {
      this._userId = user.userId;
    });
  }

  handleBoardAction = (action: BoardAction) => {
    if (action.type === "CREATE") {
      const type = this.getType(action.object);
      const attributes = this.getAttributes(action.object as unknown);
      client.models.Object.create({
        id: action.name,
        boardID: this.boardId,
        lastUpdatedBy: this._userId!,
        deleted: false,
        type,
        attributes: JSON.stringify(attributes),
      });
    } else if (action.type === "UPDATE") {
      this.updateObject(action);
    } else if (action.type === "DELETE") {
      client.models.Object.update({
        id: action.name,
        lastUpdatedBy: this._userId!,
        deleted: true,
      });
    }
  };

  updateObject = throttle((action: UpdateAction) => {
    const attributes = this.getAttributes(action.object as unknown);
    client.models.Object.update({
      id: action.name,
      lastUpdatedBy: this._userId!,
      attributes: JSON.stringify(attributes),
    });
  }, UPDATE_INTERVAL_MS);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getAttributes(object: any): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const attribute in object) {
      if (!Object.hasOwn(object, attribute)) continue;
      if (attributes[attribute] == undefined) continue;

      const value = object[attribute];

      if (value == undefined) continue;

      result[attribute] = value;
    }
    return result;
  }

  private getType(object: fabric.Object): ObjectRecord["type"] {
    if (object instanceof fabric.Rect) return "RECTANGLE";
    if (object instanceof fabric.Ellipse) return "ELLIPSE";
    if (object instanceof fabric.Text) return "TEXT";
    throw new Error(`Unsupported object type ${typeof object}`);
  }
}
