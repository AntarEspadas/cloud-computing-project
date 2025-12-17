import { ObjectRecord, RectangleRecord } from "@/app/types/schema";
import { client } from "../amplify";
import { fabric } from "fabric";

const UPDATE_INTERVAL_MS = 500;

type Subscription = ReturnType<
  ReturnType<typeof client.models.Board.observeQuery>["subscribe"]
>;

export class BoardDownstreamSyncClient {
  private _subscriptions: Subscription[] = [];

  constructor(
    private boardId: string,
    private _canvas: fabric.Canvas | null
  ) {
    console.log("Created BoardDownstreamSyncClient", this._canvas);
  }

  //   setCanvas = (canvas: fabric.Canvas | null) => {
  //     console.log("Setting canvas in downstream sync client", canvas, this);
  //   };

  populateCanvas() {}

  async start(userId: string) {
    const filter = {
      boardID: { eq: this.boardId },
      lastUpdatedBy: { ne: userId },
    };

    this._subscriptions.push(
      client.models.Object.onCreate({ filter }).subscribe((objects) => {
        this.addObjects([objects]);
      })
    );
    this._subscriptions.push(
      client.models.Object.onUpdate({ filter }).subscribe((objects) => {
        this.updateObject(objects);
      })
    );

    client.models.Object.list({
      filter: { boardID: { eq: this.boardId } },
    }).then(({ data }) => {
      console.log("Adding all rectanges");
      this.addObjects(data);
    });
  }

  stop() {
    this._subscriptions.forEach((sub) => sub.unsubscribe());
    this._subscriptions = [];
  }

  addObjects(objects: ObjectRecord[]) {
    if (!this._canvas) return;

    for (const object of objects) {
      if (object.deleted) continue;
      if (object.type === "RECTANGLE" && object.rectangle) {
        this.addRectangle(object as RectangleRecord);
      }
    }

    this._canvas.requestRenderAll();
  }

  updateObject(object: ObjectRecord) {
    if (!this._canvas) return;

    if (object.deleted) {
      this.deleteObject(object.id);
      return;
    }

    if (object.type === "RECTANGLE" && object.rectangle) {
      this.updateRectangle(object as RectangleRecord);
    }
  }

  addRectangle(record: RectangleRecord) {
    if (!this._canvas) return;

    if (record.deleted) return;
    const fabricRect = new fabric.Rect({
      name: record.id,
      left: record.left,
      top: record.top,
      angle: record.angle,
      scaleX: record.scaleX,
      scaleY: record.scaleY,
      skewX: record.skewX,
      skewY: record.skewY,
      width: record.rectangle.width,
      height: record.rectangle.height,
      fill: record.rectangle.fill,
      stroke: record.rectangle.stroke,
      strokeWidth: record.rectangle.strokeWidth,
    });

    this._canvas.add(fabricRect);
  }

  updateRectangle(record: ObjectRecord) {
    if (!this._canvas) return;

    const obj = this._canvas.getObjects().find((o) => o.name === record.id);

    if (obj === undefined) {
      this.addObjects([record]);
      this._canvas.requestRenderAll();
      return;
    }

    if (obj instanceof fabric.Rect) {
      obj.animate(
        {
          left: record.left,
          top: record.top,
          width: record.rectangle?.width ?? 0,
          height: record.rectangle?.height ?? 0,
          stroke: record.rectangle?.stroke ?? "",
          strokeWidth: record.rectangle?.strokeWidth ?? 0,
          angle: record.angle,
          scaleX: record.scaleX,
          scaleY: record.scaleY,
          skewX: record.skewX,
          skewY: record.skewY,
        },
        {
          duration: UPDATE_INTERVAL_MS,
          onChange: this._canvas.requestRenderAll.bind(this._canvas),
          easing: fabric.util.ease.easeInOutSine,
        }
      );
    }
  }

  deleteObject(recordId: string) {
    if (!this._canvas) return;

    const obj = this._canvas.getObjects().find((o) => o.name === recordId);
    if (obj) {
      this._canvas.remove(obj);
      this._canvas.requestRenderAll();
    }
  }
}

function flatten(obj: ObjectRecord): Record<string, unknown> {
  return { ...obj, ...(obj.rectangle ?? {}) };
}
