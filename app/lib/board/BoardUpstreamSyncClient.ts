import {
  BoardAction,
  CreateEllipseAction,
  CreateRectAction,
  DeleteObjectAction,
  UpdateEllipseAction,
  UpdateObjectAction,
  UpdateRectAction,
} from "@/app/types/board";
import { client } from "../amplify";
import { throttle } from "../util";
import { getCurrentUser } from "aws-amplify/auth";

const UPDATE_INTERVAL_MS = 500;

export class BoardUpstreamSyncClient {
  private _userId: string | null = null;
  constructor(private boardId: string) {
    getCurrentUser().then((user) => {
      this._userId = user.userId;
    });
  }

  handleBoardAction = (action: BoardAction) => {
    if (action.type === "CREATE_RECTANGLE") {
      this.createRect(action);
    } else if (action.type === "UPDATE_RECTANGLE") {
      this.updateRect(action);
    } else if (action.type === "CREATE_ELLIPSE") {
      this.createEllipse(action);
    } else if (action.type === "UPDATE_ELLIPSE") {
      this.updateEllipse(action);
    } else if (action.type === "DELETE_OBJECT") {
      this.deleteObject(action);
    } else if (action.type === "UPDATE_OBJECT") {
      this.updateObject(action);
    }
  };

  createRect(action: CreateRectAction) {
    client.models.Object.create({
      id: action.name,
      boardID: this.boardId,
      lastUpdatedBy: this._userId!,
      left: action.left,
      top: action.top,
      deleted: false,
      angle: 0,
      skewX: 0,
      skewY: 0,
      scaleX: 1,
      scaleY: 1,
      type: "RECTANGLE",
      rectangle: {
        width: action.width,
        height: action.height,
        stroke: action.stroke,
        strokeWidth: action.strokeWidth,
        fill: action.fill,
      },
    });
  }

  createEllipse(action: CreateEllipseAction) {
    client.models.Object.create({
      id: action.name,
      boardID: this.boardId,
      lastUpdatedBy: this._userId!,
      left: action.left,
      top: action.top,
      deleted: false,
      angle: 0,
      skewX: 0,
      skewY: 0,
      scaleX: 1,
      scaleY: 1,
      type: "ELLIPSE",
      ellipse: {
        rx: action.rx,
        ry: action.ry,
        stroke: action.stroke,
        strokeWidth: action.strokeWidth,
        fill: action.fill,
      },
    });
  }

  updateEllipse = throttle((action: UpdateEllipseAction) => {
    client.models.Object.update({
      id: action.name,
      lastUpdatedBy: this._userId!,
      left: action.left,
      top: action.top,
      ellipse: {
        rx: action.rx,
        ry: action.ry,
        stroke: action.stroke,
        strokeWidth: action.strokeWidth,
        fill: action.fill,
      },
    });
  }, UPDATE_INTERVAL_MS);

  updateRect = throttle((action: UpdateRectAction) => {
    client.models.Object.update({
      id: action.name,
      lastUpdatedBy: this._userId!,
      left: action.left,
      top: action.top,
      rectangle: {
        width: action.width,
        height: action.height,
        stroke: action.stroke,
        strokeWidth: action.strokeWidth,
        fill: action.fill,
      },
    });
  }, UPDATE_INTERVAL_MS);

  deleteObject(action: DeleteObjectAction) {
    client.models.Object.update({
      id: action.name,
      lastUpdatedBy: this._userId!,
      deleted: true,
    });
  }

  updateObject = throttle((action: UpdateObjectAction) => {
    client.models.Object.update({
      id: action.name,
      lastUpdatedBy: this._userId!,
      left: action.left,
      top: action.top,
      skewX: action.skewX,
      skewY: action.skewY,
      scaleX: action.scaleX,
      scaleY: action.scaleY,
      angle: action.angle,
    });
  }, UPDATE_INTERVAL_MS);
}
