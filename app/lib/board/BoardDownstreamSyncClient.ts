import {
  EllipseRecord,
  ObjectRecord,
  RectangleRecord,
  TextRecord,
} from "@/app/types/schema";
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
  ) {}

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
      this.addObjects(data);
    });
  }

  stop() {
    this._subscriptions.forEach((sub) => sub.unsubscribe());
    this._subscriptions = [];
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

  updateObject(record: ObjectRecord) {
    if (!this._canvas) return;

    if (record.deleted) {
      this.deleteObject(record.id);
      return;
    }

    const obj = this._canvas.getObjects().find((o) => o.name === record.id);

    if (obj === undefined) {
      this.addObjects([record]);
      this._canvas.requestRenderAll();
      return;
    }

    obj.animate(this.getAnimatableAttributes(record), {
      duration: UPDATE_INTERVAL_MS,
      onChange: this._canvas.requestRenderAll.bind(this._canvas),
      easing: fabric.util.ease.easeInOutSine,
    });

    if (record.type === "TEXT" && record.text && obj instanceof fabric.Text) {
      obj.text = record.text.text;
      obj.fontFamily = record.text.fontFamily;
    }
  }

  getAnimatableAttributes(
    record: ObjectRecord
  ): Record<string, number | string> {
    let attributes: Record<string, number | string> = {
      left: record.left,
      top: record.top,
      angle: record.angle,
      scaleX: record.scaleX,
      scaleY: record.scaleY,
      skewX: record.skewX,
      skewY: record.skewY,
    };
    if (record.type === "RECTANGLE" && record.rectangle) {
      attributes = {
        ...attributes,
        width: record.rectangle.width,
        height: record.rectangle.height,
        stroke: record.rectangle.stroke,
        strokeWidth: record.rectangle.strokeWidth,
      };
    } else if (record.type === "ELLIPSE" && record.ellipse) {
      attributes = {
        ...attributes,
        rx: record.ellipse.rx,
        ry: record.ellipse.ry,
        stroke: record.ellipse.stroke,
        strokeWidth: record.ellipse.strokeWidth,
      };
    } else if (record.type === "TEXT" && record.text) {
      attributes = {
        ...attributes,
        fontSize: record.text.fontSize,
      };
    }

    return attributes;
  }

  addEllipse(record: EllipseRecord) {
    if (!this._canvas) return;

    if (record.deleted) return;
    const fabricEllipse = new fabric.Ellipse({
      name: record.id,
      left: record.left,
      top: record.top,
      angle: record.angle,
      scaleX: record.scaleX,
      scaleY: record.scaleY,
      skewX: record.skewX,
      skewY: record.skewY,
      rx: record.ellipse.rx,
      ry: record.ellipse.ry,
      fill: record.ellipse.fill,
      stroke: record.ellipse.stroke,
      strokeWidth: record.ellipse.strokeWidth,
    });

    this._canvas.add(fabricEllipse);
  }

  addText(record: TextRecord) {
    if (!this._canvas) return;

    if (record.deleted) return;

    const fabricText = new fabric.Text(record.text.text, {
      name: record.id,
      left: record.left,
      top: record.top,
      angle: record.angle,
      scaleX: record.scaleX,
      scaleY: record.scaleY,
      skewX: record.skewX,
      skewY: record.skewY,
      fill: record.text.fill,
      fontFamily: record.text.fontFamily,
      fontSize: record.text.fontSize,
    });

    this._canvas.add(fabricText);
  }

  addObjects(objects: ObjectRecord[]) {
    if (!this._canvas) return;

    for (const object of objects) {
      if (object.deleted) continue;
      if (object.type === "RECTANGLE" && object.rectangle) {
        this.addRectangle(object as RectangleRecord);
      } else if (object.type === "ELLIPSE" && object.ellipse) {
        this.addEllipse(object as EllipseRecord);
      } else if (object.type === "TEXT" && object.text) {
        this.addText(object as TextRecord);
      }
    }

    this._canvas.requestRenderAll();
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
