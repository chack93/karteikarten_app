import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {} from "@redux-devtools/extension"; // required for devtools typing

export enum OverlayEnum {
  CsvUpload,
}
interface LayoutStore {
  openOverlay?: OverlayEnum;
}

export const useLayoutStore = create<LayoutStore>()(
  devtools(
    (_set, _get) => ({
      openOverlay: undefined,
    }),
    {
      name: "layout",
    }
  )
);
