import * as React from "react";
import type { ActionFunction, LoaderFunction } from "remix";
import { useActionData, redirect, Form, useLoaderData } from "remix";
import type { AccessPoint, AccessPointCachedConfig } from "@prisma/client";
import { db } from "~/utils/db.server";
import { QueryClient, QueryClientProvider, useMutation } from "react-query";

const queryClient = new QueryClient();

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

function Access({
  accessPointKey: key,
}: {
  accessPointKey: AccessPoint["key"];
}) {
  const [code, setCode] = React.useState("");
  const mutation = useMutation(() =>
    fetch(
      new Request(`/api/accesspoint/access`, {
        method: "POST",
        body: JSON.stringify({ key, code }),
      })
    ).then((res) => res.json())
  );

  return (
    <div className="m-4 bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Access</h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>{`Http post to /api/accesspoint/access with body { key: "${key}", code: "nnn" }.`}</p>
        </div>
        <form className="mt-2 sm:flex sm:items-center">
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
            type="submit"
            className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
          >
            Access
          </button>
        </form>
        {mutation.isLoading ? null : mutation.isError ? (
          <div>
            An error occurred:{" "}
            {mutation.error instanceof Error ? mutation.error.message : null}
          </div>
        ) : mutation.isSuccess ? (
          <div className="mt-2">
            <pre>{JSON.stringify(mutation.data, null, 2)}</pre>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Heartbeat({ accessPoint }: { accessPoint: AccessPoint }) {
  const { key } = accessPoint;
  const [code, setCode] = React.useState("");
  const mutation = useMutation<
    unknown,
    Error,
    { key: AccessPoint["key"]; config: Partial<AccessPointCachedConfig> }
  >(({ key, config }) =>
    fetch(
      new Request(`/api/accesspoint/heartbeat`, {
        method: "POST",
        body: JSON.stringify({ key, config }),
      })
    ).then(async (res) => {
      if (res.ok) {
        return await res.json();
      } else {
        throw new Error(await res.text());
      }
    })
  );
  return (
    <div className="m-4 bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Heartbeat
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            {`Http post to /api/accesspoint/heartbeat with body { key: "${key}" }.`}
          </p>
        </div>
        <div className="mt-2">
          <label
            htmlFor="heartbeatCode"
            className="block text-sm font-medium text-gray-700"
          >
            Code
          </label>

          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              name="heartbeatCode"
              id="heartbeatCode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
            />
          </div>
        </div>
        <button
          type="button"
          className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-2 sm:ml-3- sm:w-auto sm:text-sm"
          onClick={() => mutation.mutate({ key, config: { code } })}
        >
          Heartbeat
        </button>
        {mutation.isLoading ? null : mutation.isError ? (
          <div>{`An error occurred: ${mutation.error.message}`}</div>
        ) : mutation.isSuccess ? (
          <div className="mt-2">
            <pre>{JSON.stringify(mutation.data, null, 2)}</pre>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Connectivity({
  accessPointKey: key,
}: {
  accessPointKey: AccessPoint["key"];
}) {
  const mutation = useMutation(() =>
    fetch(`/api/accesspoint/heartbeat/${key}`).then((res) => res.json())
  );
  return (
    <div className="m-4 bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Connectivity
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            Deprecated http get /api/accesspoint/heartbeat/:key ie.
            /api/accesspoint/heartbeat/
            {key} for connectivity test.
          </p>
        </div>
        <button
          type="button"
          className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-2 sm:ml-3- sm:w-auto sm:text-sm"
          onClick={() => mutation.mutate()}
        >
          Heartbeat
        </button>
        {mutation.isLoading ? null : mutation.isError ? (
          <div>
            An error occurred:{" "}
            {mutation.error instanceof Error ? mutation.error.message : null}
          </div>
        ) : mutation.isSuccess ? (
          <div className="mt-2">
            <pre>{JSON.stringify(mutation.data, null, 2)}</pre>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function MockRoute() {
  const { accessPoint } = useLoaderData<LoaderData>();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="p-8">
        <h1 className="text-2xl font-bold leading-7 text-gray-900">
          Mock <span className="text-md text-gray-400">{accessPoint.key}</span>
        </h1>
        <Access accessPointKey={accessPoint.key} />
        <Heartbeat accessPoint={accessPoint} />
        <Connectivity accessPointKey={accessPoint.key} />
      </div>
    </QueryClientProvider>
  );
}
