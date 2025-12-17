import type { Schema } from "@/amplify/data/resource";

export type BoardRecord = Schema["Board"]["type"];
export type ObjectRecord = Schema["Object"]["type"];

export type RectangleContent = Schema["RectangleContent"]["type"];
export type RectangleRecord = ObjectRecord & {
  type: "RECTANGLE";
  rectangle: RectangleContent;
};

export type EllipseContent = Schema["EllipseContent"]["type"];
export type EllipseRecord = ObjectRecord & {
  type: "ELLIPSE";
  ellipse: EllipseContent;
};
