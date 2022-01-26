import { Menu, Transition } from "@headlessui/react";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LinkIcon,
  LocationMarkerIcon,
  PencilIcon,
} from "@heroicons/react/solid";
import { RemixLinkProps } from "@remix-run/react/components";
import React, { Fragment } from "react";
import { Link, useCatch, useMatches } from "remix";

function classNames(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Header({
  title,
  meta,
  side, // Should be fragment if more than 1 item for flex
}: {
  title: string;
  meta?: React.ReactNode;
  side?: React.ReactNode;
}) {
  // https://tailwindui.com/components/application-ui/page-examples/detail-screens
  // With page heading and stacked list
  return (
    <header className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="lg:flex lg:items-center lg:justify-between">
        <div className="flex-1 min-w-0">
          <Breadcrumbs />
          <h2 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {title}
          </h2>
          {meta}
        </div>
        {side ? <div className="mt-5 flex lg:mt-0 lg:ml-4">{side}</div> : null}
      </div>
    </header>
  );
}

export function Main({ children }: { children: React.ReactNode }) {
  // No px-4 since tables need to extend to the edge on mobile.
  return <main className="sm:px-6 lg:px-8 space-y-6 pb-8">{children}</main>;
}

export function Button({
  type = "button",
  variant = "primary",
  className,
  children,
  ...props
}: {
  children: React.ReactNode;
  variant?: "primary" | "white";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={classNames(
        className,
        variant === "primary"
          ? "inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          : "inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Breadcrumbs() {
  const matches = useMatches();
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-4">
        {matches
          .filter((match) => match.handle && match.handle.breadcrumb)
          .map((match, index) => (
            <li key={match.pathname}>
              <div className="flex items-center">
                {index ? (
                  <ChevronRightIcon
                    className="flex-shrink-0 h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                ) : null}
                <Link
                  to={match.pathname}
                  className={classNames(
                    index ? "ml-4" : "",
                    "text-sm font-medium text-gray-500 hover:text-gray-700"
                  )}
                >
                  {match.handle.breadcrumb}
                </Link>
              </div>
            </li>
          ))}
      </ol>
    </nav>
  );
}

export function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      scope="col"
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
    >
      {children}
    </th>
  );
}

export function ThSr({ children }: { children: React.ReactNode }) {
  return (
    // Tailwind comment: relative needed to work around issue on safari mobile.
    <th scope="col" className="relative px-6 py-3">
      <span className="sr-only">{children}</span>
    </th>
  );
}

export function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {children}
    </td>
  );
}

export function TdProminent({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
      {children}
    </td>
  );
}

// Intended for link in last column since text-right.
export function TdLink({
  children,
  to,
  onClick,
}: { children: React.ReactNode } & Pick<RemixLinkProps, "to" | "onClick">) {
  return (
    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <Link
        to={to}
        className="text-indigo-600 hover:text-indigo-900"
        onClick={onClick}
      >
        {children}
      </Link>
    </td>
  );
}

export function Table({
  headers,
  children,
  decor = "shadow",
}: {
  headers: React.ReactFragment;
  children: React.ReactNode;
  decor?: "shadow" | "edge";
}) {
  // Tailwind UI table with shadow: <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
  // Tailwind UI details table: <div className="overflow-hidden border-t border-gray-200">
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div
            className={classNames(
              decor === "shadow" ? "shadow border-b sm:rounded-lg" : "border-t",
              "overflow-hidden border-gray-200"
            )}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>{headers}</tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {children}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GenericCatchBoundary() {
  const caught = useCatch();
  return (
    <div className="py-16">
      <div className="prose max-w-xl mx-auto px-4">
        <h1>
          {caught.status} {caught.statusText}
        </h1>
        {typeof caught.data === "string" ? <pre>{caught.data}</pre> : null}
      </div>
    </div>
  );
}

export function GenericErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return (
    <div className="py-16">
      <div className="prose max-w-xl mx-auto px-4">
        <h1>Application Error</h1>
        <pre>{error.message}</pre>
      </div>
    </div>
  );
}
