import { create } from "zustand";
import { devtools } from "zustand/middleware";
import de from "./de.json";
//import type {} from "@redux-devtools/extension"; // required for devtools typing

interface TranslationState {
  translation: { [key: string]: string };
  t: (key: string) => string;
}

export const useTranslation = create<TranslationState>()(
  devtools(
    (_set, get) => ({
      translation: de,
      t: (key) => {
        return get().translation[key] ?? key;
      },
    }),
    {
      name: "translation",
    }
  )
);
