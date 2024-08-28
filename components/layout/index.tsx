import Head from "next/head";
import Link from "next/link";
import { ReactElement, useEffect, useState } from "react";
import { useAppStore } from "../app_store";
import { CsvHandler } from "../csv_handler";
import { useTranslation } from "../translation/store";
import styles from "./Layout.module.css";
import { OverlayEnum, useLayoutStore } from "./store";

export type LayoutParam = {
  children: ReactElement;
  title: string;
};

export function Layout({ children, title = "" }: LayoutParam) {
  const { t } = useTranslation();
  const { openOverlay } = useLayoutStore();
  const { session } = useAppStore();

  const [CurrentPath, setCurrentPath] = useState("");

  useEffect(() => {
    const locationOrigin = window.location.origin || "";
    const locationPathname = window.location.pathname.replace("/kk", "") || "";
    setCurrentPath(`${locationOrigin}${locationPathname}`);
  }, [session]);

  function renderOverlay() {
    switch (openOverlay) {
      case OverlayEnum.CsvUpload:
        return <CsvHandler />;
      default:
        return <></>;
    }
  }

  return (
    <>
      <Head>
        <title>
          {t("app.title")} {title}
        </title>
        <meta name="description" content="Karteikarten" />
        <link rel="icon" href="/favicon/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/favicon/safari-pinned-tab.svg"
          color="#33050d"
        />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#272727" />
      </Head>

      <header className="relative z-10">
        <nav className="navbar bg-primary rounded-b-xl shadow-md px-5 gap-6">
          <div className="flex grow">
            <Link href="/">
              <a className={`${styles.imgLogo} ${styles.jumpAnim}`}>
                <img
                  src="/image/logo.png"
                  className="w-10 h-10"
                  alt="Logo"
                  width={500}
                  height={500}
                />
              </a>
            </Link>
          </div>

          {session ? (
            <div className="flex justify-between gap-2">
              <span>{t("nav.join_link.text")}</span>
              <a
                className="link-accent"
                href={`${CurrentPath}?join=${session.joinCode || ""}`}
              >
                #{session.joinCode}
              </a>
            </div>
          ) : (
            <></>
          )}

          <button
            className={`btn btn-accent btn-sm`}
            onClick={() => {
              useLayoutStore.setState({ openOverlay: OverlayEnum.CsvUpload });
            }}
          >
            <span className="text-md pr-1">⇪</span>
            {t("nav.kk.action")}
          </button>
        </nav>
      </header>

      <main className="container mx-auto p-4 mb-14">
        {children}
        {renderOverlay()}
      </main>

      <footer className="footer footer-center p-4 text-base-content bg-primary fixed bottom-0">
        <div>
          <Link href="/about">
            <a className="link link-hover">{t("about.title")}</a>
          </Link>
        </div>
      </footer>
    </>
  );
}
