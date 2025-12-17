import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Board: a
    .model({
      name: a.string(),
      createdAt: a.datetime(),
      createdBy: a
        .string()
        .authorization((allow) => [allow.owner().to(["read", "delete"])]),
      collaborators: a.string().array(), // Array of user IDs who can access this board
    })
    .authorization((allow) => [
      allow.ownerDefinedIn("createdBy"), // Board owner has full access
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
