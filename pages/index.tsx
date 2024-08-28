import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Layout } from "../components/layout";
import { getStorage, setStorage } from "../api/localstorage";
import {
  requestSessionCreate,
  requestSessionJoinCodeFetch,
} from "../api/session";
import { Close } from "../api/datasync";
import { useTranslation } from "../components/translation/store";
import {
  requestClientCreate,
  requestClientFetch,
  requestClientUpdate,
} from "../api/client";

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();

  let [init, setInit] = useState(false);
  let [JoinCode, setJoinCode] = useState("");
  let [LoadingCreate, setLoadingCreate] = useState(false);
  let [LoadingJoin, setLoadingJoin] = useState(false);
  let [ErrorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!init) {
      setInit(true);
      const jc = new URLSearchParams(window.location.search).get("join");
      setJoinCode(jc || getStorage("joinCode"));
      Close();
      return;
    }
    setStorage("joinCode", JoinCode);
  });

  async function ensureClient(sessionId: string): Promise<void> {
    let clientId = getStorage("clientId");
    if (clientId) {
      try {
        await requestClientFetch(clientId);
        await requestClientUpdate(clientId, "user", sessionId);
      } catch (e) {
        console.debug("login/ensureClient - client invalid, create new");
        clientId = "";
      }
    }
    if (!clientId) {
      try {
        const createResp = await requestClientCreate("user", sessionId);
        clientId = createResp.body.id;
      } catch (e) {
        console.error("login/ensureClient - failed to create client", e);
        throw e;
      }
    }
    setStorage("clientId", clientId);
  }

  async function createGame(_event: React.MouseEvent<HTMLButtonElement>) {
    setLoadingCreate(true);
    try {
      const newSession = await requestSessionCreate();
      setStorage("sessionId", newSession.body.id);
      setStorage("joinCode", newSession.body.joinCode);
      await ensureClient(newSession.body.id);
    } catch (e) {
      console.error("login/create-session failed", e);
      setErrorMsg(t("login.error.create_failed"));
      setLoadingCreate(false);
      return;
    }
    setLoadingCreate(false);
    router.push("/kk");
  }

  async function joinGame(_event: React.MouseEvent<HTMLButtonElement>) {
    if (JoinCode.length < 6) return;
    setLoadingJoin(true);

    try {
      const session = await requestSessionJoinCodeFetch(JoinCode);
      setStorage("sessionId", session.body.id);
      await ensureClient(session.body.id);
    } catch (e) {
      console.error("login/join-session failed", e);
      setErrorMsg(t("login.error.unknown_join_code"));
      setLoadingJoin(false);
      return;
    }

    setLoadingJoin(false);
    router.push("/kk");
  }

  return (
    <Layout title={t("login.title")}>
      <>
        <div className="hero">
          <div className="hero-content grid justify-items-center">
            <div className="card w-full max-w-sm shadow-2xl bg-primary">
              <div className="card-body px-12">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">
                      {t("login.field.join_code.label")}
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder={t("login.field.join_code.placeholder")}
                    className={`input input-bordered input-sm ${
                      JoinCode.length < 6 && "btn-error btn-outline"
                    }`}
                    value={JoinCode}
                    onChange={(event) => setJoinCode(event.target.value)}
                  />
                </div>
                <div className="form-control mt-6">
                  <div className="flex w-full">
                    <div className="grid flex-grow">
                      <button
                        className={`
                        btn
                        btn-accent
                        btn-sm
                        ${LoadingCreate && "loading"}
                        `}
                        onClick={createGame}
                      >
                        {t("login.action.create")}
                      </button>
                    </div>
                    <div className="divider divider-horizontal"></div>
                    <div className="grid flex-grow">
                      <button
                        className={`
                        btn
                        btn-accent
                        btn-sm
                        ${(!JoinCode || JoinCode.length < 6) && "btn-disabled"}
                        ${LoadingJoin && "loading"}
                        `}
                        onClick={joinGame}
                      >
                        {t("login.action.join")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
        </div>
      </>
    </Layout>
  );
}
