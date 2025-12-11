import { defineBackend } from "@aws-amplify/backend";
import { data } from "./data/resource";
import { auth } from "./auth/resource";

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
defineBackend({
  auth,
  data,
});
