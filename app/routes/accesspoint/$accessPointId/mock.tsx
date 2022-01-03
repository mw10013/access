import * as React from "react";
import type { LoaderFunction } from "remix";
import { useLoaderData } from "remix";
import type { AccessPoint, AccessPointCachedConfig } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { QueryClient, QueryClientProvider, useMutation } from "react-query";

const queryClient = new QueryClient();

type LoaderData = {
  accessPoint: Prisma.AccessPointGetPayload<{
    include: { cachedConfig: true };
  }>;
};

export const loader: LoaderFunction = async ({
  params: { accessPointId: id },
}) => {
  const accessPoint = await db.accessPoint.findUnique({
    where: { id: Number(id) },
    include: { cachedConfig: true },
  });
  if (!accessPoint) {
    throw new Response("Access point not found.", {
      status: 404,
    });
  }
  const data: LoaderData = { accessPoint };
  return data;
};

function Access({ accessPoint: { id } }: { accessPoint: AccessPoint }) {
  const [code, setCode] = React.useState("");
  const mutation = useMutation(() =>
    fetch(
      new Request(`/api/accesspoint/access`, {
        method: "POST",
        body: JSON.stringify({ id, code }),
      })
    ).then((res) => res.json())
  );

  return (
    <div className="m-4 bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Access</h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>{`Http post to /api/accesspoint/access with body { id: "${id}", code: "nnn" }.`}</p>
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

function Heartbeat({
  accessPoint,
}: {
  accessPoint: LoaderData["accessPoint"];
}) {
  const { id } = accessPoint;
  const [codes, setCodes] = React.useState<string>(() =>
    accessPoint.cachedConfig
      ? JSON.parse(accessPoint.cachedConfig.codes).join(" ")
      : ""
  );
  const [accessCheckPolicy, setAccessCheckPolicy] = React.useState(
    accessPoint.cachedConfig?.accessCheckPolicy ?? ""
  );
  const mutation = useMutation<
    unknown,
    Error,
    {
      id: AccessPoint["id"];
      config: Pick<AccessPointCachedConfig, "accessCheckPolicy"> & {
        codes: string[];
      };
    }
  >(({ id, config }) =>
    fetch(
      new Request(`/api/accesspoint/heartbeat`, {
        method: "POST",
        body: JSON.stringify({ id, config }),
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
            {`Http post to /api/accesspoint/heartbeat. See dev network tab for format of body.`}
          </p>
        </div>
        <form>
          <div className="mt-2">
            <label
              htmlFor="cachedCodes"
              className="block text-sm font-medium text-gray-700"
            >
              Codes
            </label>
            <div className="mt-1 max-w-xl text-sm text-gray-500">
              <p>{`3-8 digit codes separated by space | empty string`}</p>
            </div>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="cachedCodes"
                id="cachedCodes"
                value={codes}
                onChange={(e) => setCodes(e.target.value)}
                className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
              />
            </div>
          </div>

          <div className="mt-2">
            <label
              htmlFor="cachedAccessCheckPolicy"
              className="block text-sm font-medium text-gray-700"
            >
              Access Check Policy
            </label>
            <div className="mt-1 max-w-xl text-sm text-gray-500">
              <p>{`cloud-first | cloud-only | point-only`}</p>
            </div>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="cachedAccessCheckPolicy"
                id="cachedAccessCheckPolicy"
                value={accessCheckPolicy}
                onChange={(e) => setAccessCheckPolicy(e.target.value)}
                className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-2 sm:ml-3- sm:w-auto sm:text-sm"
            onClick={(e) => {
              e.preventDefault();
              mutation.mutate({
                id,
                config: {
                  // MDN: When the string is empty, split() returns an array containing one empty string, rather than an empty array.
                  codes: codes
                    .trim()
                    .split(/\s+/)
                    .filter((el) => el.length > 0),
                  accessCheckPolicy,
                },
              });
            }}
          >
            Heartbeat
          </button>
          {mutation.isLoading ? null : mutation.isError ? (
            <div className="mt-2">{`Error: ${mutation.error.message}`}</div>
          ) : mutation.isSuccess ? (
            <div className="mt-2">
              <pre>{JSON.stringify(mutation.data, null, 2)}</pre>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}

function Connectivity({ accessPoint: { id } }: { accessPoint: AccessPoint }) {
  const mutation = useMutation(() =>
    fetch(`/api/accesspoint/${id}/heartbeat`).then((res) => res.json())
  );
  return (
    <div className="m-4 bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Connectivity
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            Deprecated http get /api/accesspoint/:id/heartbeatie.
            /api/accesspoint/{id}/heartbeat for connectivity test. WARNING: id
            instead of key.
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
        <h1 className="text-2xl font-bold leading-7 text-gray-900">Mock</h1>
        <Access accessPoint={accessPoint} />
        <Heartbeat accessPoint={accessPoint} />
        <Connectivity accessPoint={accessPoint} />
      </div>
    </QueryClientProvider>
  );
}
