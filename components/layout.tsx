import React, { ReactElement } from "react";
import Head from "next/head";
import styles from "../styles/Layout.module.css";
import Link from "next/link";
import { useTranslation } from "./translation/store";

export type LayoutParam = {
  children: ReactElement;
  title: string;
};

export default function Layout({ children, title = "" }: LayoutParam) {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>
          {t("app.title")} {title}
        </title>
        <meta name="description" content="Karteikarten" />
        <link rel="icon" href="/karteikarten/favicon/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/karteikarten/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/karteikarten/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/karteikarten/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/karteikarten/favicon/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/karteikarten/favicon/safari-pinned-tab.svg"
          color="#33050d"
        />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#272727" />
      </Head>

      <header>
        <nav className="navbar bg-primary rounded-b-xl shadow-md pl-5">
          <div className="flex-1">
            <Link href="/">
              <a className={`${styles.imgLogo} ${styles.jumpAnim}`}>
                <img
                  src="/karteikarten/image/logo.png"
                  className="w-10 h-10"
                  alt="Logo"
                  width={500}
                  height={500}
                />
              </a>
            </Link>
          </div>
          <div className="flex-none"></div>
        </nav>
      </header>

      <main className="container mx-auto p-4 mb-14">{children}</main>

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
