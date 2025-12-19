import {
  BoardAction,
  CreateAction,
  DeleteAction,
  UnDeleteAction,
  UpdateAction,
} from "@/app/types/board";
import { actionResolver, ActionResolver } from "./ActionResolver";
import { BoardUpstreamSyncClient } from "./BoardUpstreamSyncClient";

interface HistoryEvent {
  originalAction: BoardAction;
  compensatingAction: BoardAction;
}

export class ActionHistory {
  private _undoHistory: HistoryEvent[] = [];
  private _redoHistory: HistoryEvent[] = [];

  private _knownStates = new Map<string, object>();

  private _upstreamSyncClient: BoardUpstreamSyncClient | null = null;

  constructor(private _actionResolver: ActionResolver) {}

  setUpstreamSyncClient(upstreamSyncClient: BoardUpstreamSyncClient | null) {
    this._upstreamSyncClient = upstreamSyncClient;
  }

  undo() {
    this.moveHistory(this._undoHistory, this._redoHistory);
  }

  redo() {
    this.moveHistory(this._redoHistory, this._undoHistory);
  }

  private moveHistory(from: HistoryEvent[], to: HistoryEvent[]) {
    const event = from.pop();
    if (!event) return;
    this._upstreamSyncClient?.handleBoardAction(event.compensatingAction);
    this._actionResolver?.resolve(event.compensatingAction);

    const oppositeEvent = this.reverseEvent(event);
    const compensatingAction = event.compensatingAction;

    if (compensatingAction.type !== "DELETE") {
      this._knownStates.set(event.originalAction.name, {
        ...compensatingAction.object,
      });
    }

    to.push(oppositeEvent);
  }

  addEvent = (action: BoardAction) => {
    const event = this.getEvent(action);
    if (action.type === "CREATE" || action.type === "UPDATE") {
      this._knownStates.set(action.name, { ...action.object });
    }
    this._undoHistory.push(event);
    this._redoHistory = [];
  };

  registerState(name: string, object: object) {
    this._knownStates.set(name, { ...object });
  }

  private getEvent(action: BoardAction): HistoryEvent {
    if (action.type === "CREATE") {
      return this.getCreateEvent(action);
    } else if (action.type === "UPDATE") {
      return this.getUpdateEvent(action);
    } else if (action.type === "DELETE") {
      return this.getDeleteEvent(action);
    } else if (action.type === "UN_DELETE") {
      return this.getUnDeleteAction(action);
    }
    throw new Error(action);
  }

  private getCreateEvent(action: CreateAction): HistoryEvent {
    return {
      originalAction: {
        ...action,
        object: { ...action.object } as fabric.Object,
      },
      compensatingAction: {
        type: "DELETE",
        name: action.name,
        objectType: action.objectType,
      },
    };
  }

  private getUpdateEvent(action: UpdateAction): HistoryEvent {
    const originalState =
      this._knownStates.get(action.name) ?? ({} as fabric.Object);
    return {
      originalAction: {
        ...action,
        object: { ...action.object } as fabric.Object,
      },
      compensatingAction: {
        type: "UPDATE",
        name: action.name,
        object: originalState as fabric.Object,
        objectType: action.objectType,
      },
    };
  }

  private getDeleteEvent(action: DeleteAction): HistoryEvent {
    const originalState =
      this._knownStates.get(action.name) ?? ({} as fabric.Object);
    return {
      originalAction: action,
      compensatingAction: {
        type: "UN_DELETE",
        name: action.name,
        object: originalState as fabric.Object,
        objectType: action.objectType,
      },
    };
  }

  private getUnDeleteAction(action: UnDeleteAction): HistoryEvent {
    return {
      originalAction: action,
      compensatingAction: {
        type: "DELETE",
        name: action.name,
        objectType: action.objectType,
      },
    };
  }

  private reverseEvent(event: HistoryEvent): HistoryEvent {
    const compensatingAction = event.compensatingAction;
    const originalAction = event.originalAction;
    if (
      compensatingAction.type === "DELETE" &&
      originalAction.type === "CREATE"
    ) {
      return {
        originalAction: compensatingAction,
        compensatingAction: {
          type: "UN_DELETE",
          name: originalAction.name,
          object: originalAction.object,
          objectType: originalAction.objectType,
        },
      };
    }
    return {
      originalAction: compensatingAction,
      compensatingAction: originalAction,
    };
  }
}

export const actionHistory = new ActionHistory(actionResolver);
