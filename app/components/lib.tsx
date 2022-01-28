import { ChevronRightIcon } from "@heroicons/react/solid";
import { FormProps, RemixLinkProps } from "@remix-run/react/components";
import React, { ButtonHTMLAttributes } from "react";
import { Form, Link, useCatch, useMatches, useNavigate } from "remix";

function classNames(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Header({
  title,
  meta,
  side, // Should be fragment if more than 1 item for flex
}: {
  title?: string;
  meta?: React.ReactNode;
  side?: React.ReactNode;
}) {
  // https://tailwindui.com/components/application-ui/page-examples/detail-screens
  // With page heading and stacked list
  return (
    <header className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="lg:flex lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <Breadcrumbs />
          {title ? (
            <h2 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
              {title}
            </h2>
          ) : null}
          {meta}
        </div>
        {side ? <div className="mt-5 flex lg:mt-0 lg:ml-4">{side}</div> : null}
      </div>
    </header>
  );
}

export function Main({ children }: { children: React.ReactNode }) {
  // No px-4 since tables need to extend to the edge on mobile.
  return <main className="space-y-6 pb-8 sm:px-6 lg:px-8">{children}</main>;
}

export function Button({
  type = "button",
  variant = "primary",
  className,
  children,
  ...props
}: {
  children: React.ReactNode;
  variant?: "primary" | "white" | "red";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={classNames(
        className,
        variant === "primary"
          ? "inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          : variant === "white"
          ? "inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          : "inline-flex items-center rounded-md border border-transparent bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
                    className="h-5 w-5 flex-shrink-0 text-gray-400"
                    aria-hidden="true"
                  />
                ) : null}
                {typeof match.handle.breadcrumb === "function" ? (
                  match.handle.breadcrumb(match)
                ) : (
                  <Link
                    to={match.pathname}
                    className={classNames(
                      index ? "ml-4" : "",
                      "text-sm font-medium text-gray-500 hover:text-gray-700"
                    )}
                  >
                    {match.handle.breadcrumb}
                  </Link>
                )}
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
      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6"
    >
      {children}
    </th>
  );
}

export function ThSr({ children }: { children: React.ReactNode }) {
  return (
    // Tailwind comment: relative needed to work around issue on safari mobile.
    <th scope="col" className="relative px-4 py-3 sm:px-6">
      <span className="sr-only">{children}</span>
    </th>
  );
}

export function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 sm:px-6">
      {children}
    </td>
  );
}

export function TdProminent({ children }: { children: React.ReactNode }) {
  return (
    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 sm:px-6">
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
    <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium sm:px-6">
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
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div
            className={classNames(
              decor === "shadow" ? "border-b shadow sm:rounded-lg" : "border-t",
              "overflow-hidden border-gray-200"
            )}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>{headers}</tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
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
      <div className="prose mx-auto max-w-xl px-4">
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
      <div className="prose mx-auto max-w-xl px-4">
        <h1>Application Error</h1>
        <pre>{error.message}</pre>
      </div>
    </div>
  );
}

export function DlCardDtDd({
  term,
  description,
  wide = false,
}: {
  term: string;
  description: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : "sm:col-span-1"}>
      <dt className="text-sm font-medium text-gray-500">{term}</dt>
      <dd className="mt-1 text-sm text-gray-900">{description}</dd>
    </div>
  );
}

export function DlCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-2xl border-t border-gray-200 bg-white px-4 py-6 shadow sm:rounded-lg sm:px-6 lg:px-8">
      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
        {children}
      </dl>
    </section>
  );
}

export function Card({
  title,
  side,
  children,
}: {
  title: string;
  side?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white pt-6 shadow sm:overflow-hidden sm:rounded-md">
      <div className="px-4 pb-6 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <h2 className="text-lg font-medium leading-6 text-gray-900">{title}</h2>
        {side ? <div className="mt-5 flex lg:mt-0 lg:ml-4">{side}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function SettingsFormField({
  id,
  label,
  children, // only 1 child.
  errors,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  errors?: string[];
}) {
  const child = React.Children.only(children);
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1">
        {React.isValidElement(child)
          ? React.cloneElement(child, {
              className:
                "block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md",
            })
          : null}
      </div>
      {errors ? (
        <p
          className="mt-2 text-sm text-red-600"
          role="alert"
          id={`${id}-error`}
        >
          {errors.join(". ")}
        </p>
      ) : null}
    </div>
  );
}

export function SettingsForm({
  title,
  formErrors,
  submitText = "Save",
  submitOnClick,
  leftButton,
  children,
  ...props
}: {
  title: string;
  formErrors?: string[];
  submitText?: string;
  submitOnClick?: React.DOMAttributes<HTMLButtonElement>["onClick"];
  leftButton?: React.ReactNode;
  children: React.ReactNode;
} & FormProps) {
  const navigate = useNavigate();
  const submitCancelButtons = (
    <div className="flex justify-end">
      <Button variant="white" onClick={() => navigate(-1)}>
        Cancel
      </Button>
      <Button type="submit" className="ml-3" onClick={submitOnClick}>
        {submitText}
      </Button>
    </div>
  );
  return (
    <section className="mx-auto max-w-lg lg:px-8">
      <Form className="shadow sm:overflow-hidden sm:rounded-md" {...props}>
        <div className="space-y-6 bg-white py-6 px-4 sm:p-6">
          <div>
            <h1 className="text-lg font-medium leading-6 text-gray-900">
              {title}
            </h1>
            {formErrors ? (
              <p className="mt-1 text-sm text-red-600">
                {formErrors.join(". ")}
              </p>
            ) : null}
          </div>
          {children}

          {leftButton ? (
            <div className="flex justify-between">
              {leftButton}
              {submitCancelButtons}
            </div>
          ) : (
            submitCancelButtons
          )}

          {/* <div className="flex justify-end">
            <Button variant="white" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" className="ml-3" onClick={submitOnClick}>
              {submitText}
            </Button>
          </div> */}
        </div>
      </Form>
    </section>
  );
}
