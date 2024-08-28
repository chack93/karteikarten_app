import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {} from "@redux-devtools/extension"; // required for devtools typing

export interface KkEntry {
  key: string;
  value: string;
}

interface KarteikartenState {
  kkEntryList: Array<KkEntry>;
  setCsv: (csv: string) => void;
  getShuffledList: () => Array<KkEntry>;
}

export const useKarteikartenStore = create<KarteikartenState>()(
  devtools(
    (set, get) => ({
      kkEntryList: [],
      setCsv: (csv: string) => {
        const result = csv
          .split("\n")
          .flatMap((el) => el.split("\r"))
          .filter((el) => el)
          .map((el) => {
            const [key, value] = el.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/g);
            return {
              key: key.replace(/^"+|"+$/g, ""),
              value: value.replace(/^"+|"+$/g, ""),
            };
          });
        set({ kkEntryList: result });
      },
      getShuffledList: () => {
        const array: Array<KkEntry> = JSON.parse(
          JSON.stringify(get().kkEntryList)
        );
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      },
    }),
    {
      name: "karteikarten",
    }
  )
);
