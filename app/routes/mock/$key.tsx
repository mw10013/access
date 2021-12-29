import * as React from "react";
import type { LoaderFunction } from "remix";
import { useLoaderData } from "remix";
import type { AccessPoint } from "@prisma/client";
import { db } from "~/utils/db.server";

type LoaderData = { accessPoint: AccessPoint };

export const loader: LoaderFunction = async ({ params: { key } }) => {
  const accessPoint = await db.accessPoint.findUnique({
    where: { key },
  });
  if (!accessPoint) {
    throw new Response("Key not found.", {
      status: 404,
    });
  }
  const data: LoaderData = { accessPoint };
  return data;
};

export default function MockRoute() {
  const { accessPoint } = useLoaderData<LoaderData>();
  const [code, setCode] = React.useState("");
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold leading-7 text-gray-900">
        Mock <span className="text-md text-gray-400">{accessPoint.key}</span>
      </h1>

      <div className="m-4 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Code</h3>
          <form className="mt-1 sm:flex sm:items-center">
            <div className="w-full sm:max-w-xs">
              <label htmlFor="code" className="sr-only">
                Code
              </label>
              <input
                type="text"
                name="code"
                id="code"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => console.log({ code })}
            >
              Access
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
