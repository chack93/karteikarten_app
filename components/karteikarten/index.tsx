import { useEffect, useState } from "react";
import { KkEntry, useKarteikartenStore } from "./store";
import { useTranslation } from "../translation/store";
import { twMerge } from "tailwind-merge";

export type KarteikartenCardParam = {};

export default function KarteikartenCard({}: KarteikartenCardParam) {
  const { t } = useTranslation();
  const { kkEntryList, getShuffledList } = useKarteikartenStore();

  const [ShuffledList, setShuffeledList] = useState<KkEntry[]>([]);
  const [CurrentEntryIdx, setCurrentEntryIdx] = useState(0);
  const [Revealed, setRevealed] = useState(false);

  useEffect(() => {
    setShuffeledList(getShuffledList());
    setCurrentEntryIdx(0);
    setRevealed(false);
  }, [kkEntryList]);

  const currentEntry = ShuffledList[CurrentEntryIdx % ShuffledList.length];

  return (
    <>
      {currentEntry ? (
        <div className="card bg-primary text-primary-content w-96 shadow-xl">
          <div className="card-body">
            <h2 className="card-title gap-1 min-h-16">
              {t("kk.label.question")} {currentEntry.key}
            </h2>

            <div className="divider">
              <div className="card-actions justify-end">
                <button
                  className="btn btn-accent btn-sm"
                  onClick={() => {
                    setRevealed(true);
                  }}
                >
                  {t("kk.action.reveal")}
                </button>
              </div>
            </div>
            <div className="min-h-16">
              <div>{t("kk.label.answer")}</div>{" "}
              <p
                className={twMerge(
                  "overflow-hidden transition-all rounded",
                  Revealed ? "max-h-auto" : "max-h-96 bg-base-100 shadow-inner"
                )}
              >
                <div
                  className={twMerge(
                    "transition-opacity opacity-0",
                    Revealed ? "opacity-100" : ""
                  )}
                >
                  {currentEntry.value}
                </div>
              </p>
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setCurrentEntryIdx(CurrentEntryIdx + 1);
              setRevealed(false);
            }}
          >
            {t("kk.action.next")}
          </button>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
