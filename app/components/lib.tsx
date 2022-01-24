import { ChevronRightIcon } from "@heroicons/react/solid";
import { RemixLinkProps } from "@remix-run/react/components";
import React from "react";
import { Link, useCatch, useMatches } from "remix";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function Button({
  children,
  variant = "primary",
  ...props
}: {
  children: React.ReactNode;
  variant?: "primary" | "white";
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">) {
  return (
    <button
      className={
        variant === "primary"
          ? "inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          : "inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      }
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
}: {
  headers: React.ReactFragment;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-t border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Edit</span>
                  </th> */}
                  {headers}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* <tr key={person.email}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {person.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {person.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a
                        href="#"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </a>
                    </td>
                  </tr> */}
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
