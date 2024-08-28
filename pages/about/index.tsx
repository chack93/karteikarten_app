import React from "react";
import { useTranslation } from "../../components/translation/store";
import { Layout } from "../../components/layout";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Layout title={t("about.title")}>
      <div className="flex flex-wrap justify-center">
        <div className="card bg-primary w-96 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Impressum nach Mediengesetz §24</h2>
            <p>
              <pre>
                02.April 2022
                <br />
                Christian Hackl
                <br />
                Stübegg 9<br />
                2871 Zöbern
                <br />
                Österreich
              </pre>
            </p>
            <div className="card-actions justify-end">
              <button
                className="btn btn-accent"
                onClick={() => {
                  router.back();
                }}
              >
                {t("about.action.close")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
