import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Board: a
    .model({
      name: a.string(),
      createdAt: a.datetime(),
      createdBy: a.string(),
      owner: a
        .string()
        .authorization((allow) => [
          allow.owner().to(["read", "update", "delete"]),
        ]),
      collaborators: a.string().array(), // Array of user IDs who can access this board
    })
    .authorization((allow) => [
      allow.owner(), // Board owner has full access
    ]),
  Object: a
    .model({
      boardID: a.string().required(),
      lastUpdatedBy: a.string().required(),
      deleted: a.boolean().default(false),
      left: a.float().required(),
      top: a.float().required(),
      skewX: a.float().default(0).required(),
      skewY: a.float().default(0).required(),
      scaleX: a.float().default(1).required(),
      scaleY: a.float().default(1).required(),
      angle: a.float().default(0).required(),

      type: a.ref("ContentType").required(),
      rectangle: a.ref("RectangleContent"),
    })
    .authorization((allow) => [allow.authenticated()]),

  ContentType: a.enum(["RECTANGLE"]),

  RectangleContent: a.customType({
    width: a.float().required(),
    height: a.float().required(),
    stroke: a.string().required(),
    strokeWidth: a.integer().required(),
    fill: a.string().required(),
  }),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
