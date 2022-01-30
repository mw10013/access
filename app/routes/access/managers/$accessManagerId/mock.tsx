import * as React from "react";
import type { LoaderFunction } from "remix";
import { useLoaderData } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { QueryClient, QueryClientProvider, useMutation } from "react-query";
import { requireUserSession } from "~/utils/session.server";

const queryClient = new QueryClient();

type LoaderData = {
  accessManager: Prisma.AccessManagerGetPayload<{
    include: {
      accessPoints: true;
    };
  }>;
};

export const loader: LoaderFunction = async ({
  request,
  params: { accessManagerId },
}): Promise<LoaderData> => {
  const { userId } = await requireUserSession(request, "customer");
  const accessManager = await db.accessManager.findFirst({
    where: { id: Number(accessManagerId), user: { id: userId } },
    include: {
      accessPoints: {
        orderBy: { position: "asc" },
      },
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
  const [data, setData] = React.useState<string>(() =>
    JSON.stringify(
      {
        accessManager: {
          id: accessManager.id,
          accessPoints: accessManager.accessPoints.map((i) => ({
            id: i.id,
          })),
        },
      },
      null,
      2
    )
  );
  const mutation = useMutation<unknown, Error, string>((data) =>
    fetch(
      new Request(`/api/accessmanager/heartbeat`, {
        method: "POST",
        body: data,
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
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Heartbeat
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            {`Changing too much to risk out of date documentation. Use dev network tab for the current truth. View source of request for method and url. View payload to see format of data. View preview to see format of response data.`}
          </p>
        </div>
        <form>
          <div className="mt-2">
            <label
              htmlFor="about"
              className="block text-sm font-medium text-gray-700"
            >
              Data
            </label>
            <div className="mt-1">
              <textarea
                id="about"
                name="about"
                rows={10}
                className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500"></p>
          </div>

          <button
            type="submit"
            className="sm:ml-3- mt-4 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-2 sm:w-auto sm:text-sm"
            onClick={(e) => {
              e.preventDefault();
              mutation.mutate(data);
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
        <div className="mt-1 flex space-x-10 text-sm text-gray-500">
          <div>{accessManager.name}</div>
          <div>ID: {accessManager.id}</div>
          <div>{accessManager.description}</div>
        </div>

        <Heartbeat accessManager={accessManager} />
      </div>
    </QueryClientProvider>
  );
}
