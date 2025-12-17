import type { Schema } from "@/amplify/data/resource";

export type BoardRecord = Schema["Board"]["type"];
export type ObjectRecord = Schema["Object"]["type"];
export type RectangleContent = Schema["RectangleContent"]["type"];

export type RectangleRecord = ObjectRecord & {
  type: "RECTANGLE";
  rectangle: RectangleContent;
};
