interface Attribute {
  animatable: boolean;
}

export const attributes: Record<string, Attribute> = {
  left: { animatable: true },
  top: { animatable: true },
  scaleX: { animatable: true },
  scaleY: { animatable: true },
  angle: { animatable: true },
  width: { animatable: true },
  height: { animatable: true },
  rx: { animatable: true },
  ry: { animatable: true },
  x1: { animatable: false },
  x2: { animatable: false },
  y1: { animatable: false },
  y2: { animatable: false },
  text: { animatable: false },
  fontSize: { animatable: true },
  fontFamily: { animatable: false },
  stroke: { animatable: false },
  strokeWidth: { animatable: true },
  fill: { animatable: false },
  path: { animatable: false },
};
