import { sendStateToServer } from "../../api/datasync";
import { useAppStore } from "../app_store";
import { useKarteikartenStore } from "../karteikarten/store";
import { useLayoutStore } from "../layout/store";
import { useTranslation } from "../translation/store";

export function CsvHandler(): React.ReactElement {
  const { t } = useTranslation();
  const { kkEntryList } = useKarteikartenStore();

  return (
    <div
      id="csv-handler-overlay"
      className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center"
      onClick={(e) => {
        if ((e.currentTarget.id = "csv-handler-overlay")) {
          useLayoutStore.setState({ openOverlay: undefined });
        }
      }}
    >
      <div
        className="flex-flex-col"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="card bg-base-300 rounded-box p-6 flex gap-3">
          <div>{t("csv.download.text")}</div>
          <button
            className={`btn btn-accent btn-sm`}
            onClick={() => {
              const csv = t("csv.download.example_csv.content");
              const downloadLink = document.createElement("a");
              const blob = new Blob(["\ufeff", csv]);
              const url = URL.createObjectURL(blob);
              downloadLink.href = url;
              downloadLink.download = t("csv.download.example_csv.name");

              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);
            }}
          >
            <span className="text-md pr-1">⇩</span>
            {t("csv.download.action")}
          </button>
        </div>
        <div className="divider"></div>
        <div className="card bg-base-300 rounded-box p-6 flex gap-3">
          <button
            className={`btn btn-accent btn-sm`}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".csv";

              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files[0];
                const reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onload = (re) => {
                  const content = re.target.result.toString();
                  useKarteikartenStore.getState().setCsv(content);
                  const session = useAppStore.getState().session;
                  session.csv = content;
                  sendStateToServer();
                  setTimeout(() => {
                    useLayoutStore.setState({ openOverlay: undefined });
                  }, 1000);
                };
              };
              input.click();
            }}
          >
            <span className="text-md pr-1">⇪</span>
            {t("csv.upload.action")}
          </button>
          <span>
            {t("csv.upload.current_entries")} {kkEntryList.length}
          </span>
        </div>
      </div>
    </div>
  );
}
