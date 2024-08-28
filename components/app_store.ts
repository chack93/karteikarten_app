import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { RestBodySession } from "../api/session";
import { RestBodyClient } from "../api/client";
import type {} from "@redux-devtools/extension"; // required for devtools typing

interface AppState {
  session?: RestBodySession;
  client?: RestBodyClient;
}

export const useAppStore = create<AppState>()(
  devtools(
    (_set, _get) => ({
      session: undefined,
      client: undefined,
    }),
    {
      name: "app",
    }
  )
);
