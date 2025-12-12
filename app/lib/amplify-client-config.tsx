"use client";

import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { useEffect, useState } from "react";

export function ConfigureAmplify() {
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    if (!configured) {
      Amplify.configure(outputs, { ssr: true });
      setConfigured(true);
    }
  }, [configured]);

  return null;
}
