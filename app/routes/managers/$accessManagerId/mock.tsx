import * as React from "react";
import type { LoaderFunction } from "remix";
import { useLoaderData, useFetcher } from "remix";
import type { AccessManager } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { QueryClient, QueryClientProvider, useMutation } from "react-query";

const queryClient = new QueryClient();

type LoaderData = {
  accessManager: Prisma.AccessManagerGetPayload<{
    include: {
      accessPoints: { include: { accessUsers: true; cachedConfig: true } };
    };
  }>;
};

export const loader: LoaderFunction = async ({
  params: { accessManagerId },
}): Promise<LoaderData> => {
  const accessManager = await db.accessManager.findUnique({
    where: { id: Number(accessManagerId) },
    include: {
      accessPoints: { include: { accessUsers: true, cachedConfig: true } },
    },
    rejectOnNotFound: true,
  });
  return { accessManager };
};

function Heartbeat({
  accessManager,
}: {
  accessManager: LoaderData["accessManager"];
}) {
  const { id } = accessManager;
  //   const [codes, setCodes] = React.useState<string>(() =>
  //     accessManager.cachedConfig
  //       ? JSON.parse(accessManager.cachedConfig.codes).join(" ")
  //       : ""
  //   );
  const [users, setUsers] = React.useState<string>("");
  const mutation = useMutation<
    unknown,
    Error,
    {
      id: AccessManager["id"];
      config: {
        users: string;
      };
    }
  >(({ id, config }) =>
    fetch(
      new Request(`/api/heartbeat`, {
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
            {`Http post to /api/accessmanager/heartbeat. See dev network tab for format of body.`}
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
                value={users}
                onChange={(e) => setUsers(e.target.value)}
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
                  users,
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

export default function MockRoute() {
  const { accessManager } = useLoaderData<LoaderData>();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="p-8">
        <h1 className="text-2xl font-bold leading-7 text-gray-900">
          Mock Access Manager
        </h1>
        <div className="flex mt-1 space-x-10 text-sm text-gray-500">
          <div>{accessManager.name}</div>
          <div>ID: {accessManager.id}</div>
          <div>{accessManager.description}</div>
        </div>

        <Heartbeat accessManager={accessManager} />
      </div>
    </QueryClientProvider>
  );
}
