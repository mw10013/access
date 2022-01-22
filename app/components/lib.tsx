import React from "react";
import { useCatch } from "remix";

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
