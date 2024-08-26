import React from "react";
import Layout from "../../components/layout";
import { useTranslation } from "../../components/translation/store";

export default function Home() {
  const { t } = useTranslation();

  return (
    <Layout title={t("about.title")}>
      <>
        <h1 className="text-lg mb-2">Impressum nach Mediengesetz §24</h1>
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
      </>
    </Layout>
  );
}
