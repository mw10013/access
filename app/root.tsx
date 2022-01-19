import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from "remix";
import type { MetaFunction } from "remix";
import styles from "./tailwind.css";
import React from "react";

export const meta: MetaFunction = () => {
  return { title: "Access" };
};

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function GenericCatchBoundary() {
  let caught = useCatch();
  let message = caught.statusText;
  if (typeof caught.data === "string") {
    message = caught.data;
  }

  return (
    <div className="py-16">
      <div className="prose prose-invert text-gray-50 max-w-xl mx-auto px-4">
        <h1>{message}</h1>
      </div>
    </div>
  );
}

export function CatchBoundary() {
  let caught = useCatch();

  return (
    <Document>
      <GenericCatchBoundary />
    </Document>
  );
}

export function GenericErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return (
    <div className="py-16">
      <div className="prose prose-invert text-gray-50 max-w-xl mx-auto px-4">
        <h1>An unknown error occured.</h1>
        <pre>{error.message}</pre>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document>
      <GenericErrorBoundary error={error} />
    </Document>
  );
}
