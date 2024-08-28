import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { requestClientFetch } from "../../api/client";
import { CleanupWS, InitWS } from "../../api/datasync";
import { getStorage } from "../../api/localstorage";
import { requestSessionFetch } from "../../api/session";
import { useAppStore } from "../../components/app_store";
import { Layout } from "../../components/layout";
import { useTranslation } from "../../components/translation/store";
import KarteikartenCard from "../../components/karteikarten";
import { useKarteikartenStore } from "../../components/karteikarten/store";

export default function Home() {
  const router = useRouter();

  const { t } = useTranslation();
  const { session, client } = useAppStore();

  let [IsInit, setIsInit] = useState(false);
  let [ErrorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!IsInit) {
      init();
    }
    return () => {
      // cleanup
      CleanupWS();
    };
  }, []);

  async function init() {
    setIsInit(true);
    const sessionId = getStorage("sessionId");
    const clientId = getStorage("clientId");
    if (!sessionId || !clientId) {
      router.push("/");
    }
    const initDataSuccess = await initData();
    if (!initDataSuccess) {
      router.push("/");
    }
    await InitWS();
  }
  async function initData() {
    const sessionId = getStorage("sessionId");
    const clientId = getStorage("clientId");
    try {
      const session = await requestSessionFetch(sessionId);
      useAppStore.setState({ session: session.body });
      useKarteikartenStore.getState().setCsv(session.body.csv);
    } catch (e) {
      console.error("game/fetch-session failed", e);
      setErrorMsg(t("kk.error.join_failed"));
      return false;
    }
    try {
      const client = await requestClientFetch(clientId);
      useAppStore.setState({ client: client.body });
    } catch (e) {
      console.error("game/fetch-client failed", e);
      setErrorMsg(t("kk.error.join_failed"));
      return false;
    }
    return true;
  }

  return (
    <Layout title={t("kk.title")}>
      <>
        <div className="flex flex-col items-center">
          <KarteikartenCard />

          {ErrorMsg.length > 0 && (
            <div className="alert alert-error shadow-lg">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current flex-shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>{ErrorMsg}</div>
              </div>
            </div>
          )}
        </div>
      </>
    </Layout>
  );
}
