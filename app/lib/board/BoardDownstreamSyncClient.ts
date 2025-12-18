import { ObjectRecord } from "@/app/types/schema";
import { client } from "../amplify";
import { fabric } from "fabric";
import { attributes } from "./attributes";

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

  private addObjects(objects: ObjectRecord[]) {
    if (!this._canvas) return;

    for (const object of objects) {
      if (object.deleted) continue;
      this.addObject(object);
    }

    this._canvas.requestRenderAll();
  }

  private addObject(object: ObjectRecord) {
    if (!this._canvas) return;

    const fabricObject = this.instantiate(object.type, object.attributes);
    fabricObject.name = object.id;

    this._canvas.add(fabricObject);
  }

  private instantiate(
    type: ObjectRecord["type"],
    attributes: ObjectRecord["attributes"]
  ): fabric.Object {
    const deserializedAttributes = JSON.parse(attributes as string);
    if (type === "RECTANGLE") {
      return new fabric.Rect(deserializedAttributes);
    } else if (type === "ELLIPSE") {
      return new fabric.Ellipse(deserializedAttributes);
    } else if (type === "TEXT") {
      return new fabric.Text(
        deserializedAttributes.text,
        deserializedAttributes
      );
    } else if (type === "PATH") {
      return new fabric.Path(
        deserializedAttributes.path,
        deserializedAttributes
      );
    }
    throw new Error(`Unknown type ${type}`);
  }

  private updateObject(record: ObjectRecord) {
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

    const [animatableAttributes, otherAttributes] = this.getAttributes(
      record.attributes
    );

    obj.animate(animatableAttributes, {
      duration: UPDATE_INTERVAL_MS,
      onChange: this._canvas.requestRenderAll.bind(this._canvas),
      easing: fabric.util.ease.easeInOutSine,
    });

    for (const attr in otherAttributes) {
      if (!Object.hasOwn(otherAttributes, attr)) continue;
      const value = otherAttributes[attr];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (obj as any)[attr] = value;
    }

    this._canvas.requestRenderAll();
  }

  private getAttributes(
    serializedAttributes: ObjectRecord["attributes"]
  ): [Record<string, number | string>, Record<string, number | string>] {
    const objAttributes = JSON.parse(serializedAttributes as string);
    const animatableAttributes: Record<string, number | string> = {};
    const otherAttributes: Record<string, number | string> = {};

    for (const attr in objAttributes) {
      if (!Object.hasOwn(objAttributes, attr)) continue;

      const value = objAttributes[attr];

      if (attributes[attr].animatable) {
        animatableAttributes[attr] = value;
      } else {
        otherAttributes[attr] = value;
      }
    }

    return [animatableAttributes, otherAttributes];
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
