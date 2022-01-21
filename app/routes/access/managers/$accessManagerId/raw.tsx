import * as React from "react";
import type { LoaderFunction } from "remix";
import { useLoaderData, useFetcher, useLocation } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

type LoaderData = {
  accessManager: Prisma.AccessManagerGetPayload<{
    include: {
      accessPoints: { include: { accessUsers: true } };
    };
  }>;
};

export const loader: LoaderFunction = async ({
  request,
  params: { accessManagerId },
}): Promise<LoaderData> => {
  const userId = await requireUserId(request);

  const accessManager = await db.accessManager.findFirst({
    where: { id: Number(accessManagerId), user: { id: Number(userId) } },
    include: {
      accessPoints: {
        include: {
          accessUsers: { orderBy: { name: "asc" } },
        },
        orderBy: { position: "asc" },
      },
    },
    rejectOnNotFound: true,
  });
  return { accessManager };
};

export default function RouteComponent() {
  const data = useLoaderData<LoaderData>();
  const poll = useFetcher<LoaderData>();
  const [isPolling, setIsPolling] = React.useState(true);
  const location = useLocation();

  React.useEffect(() => {
    if (isPolling) {
      const intervalId = setInterval(() => poll.load(location.pathname), 5000);
      return () => clearInterval(intervalId);
    }
  }, [location, isPolling]);

  return (
    <div className="p-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900">Raw</h1>
        <div className="relative flex items-start">
          <div className="flex items-center h-5">
            <input
              id="poll"
              aria-describedby="comments-description"
              name="poll"
              type="checkbox"
              checked={isPolling}
              onChange={() => setIsPolling(!isPolling)}
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="poll" className="font-medium text-gray-700">
              Poll
            </label>
          </div>
        </div>
      </div>

      <pre className="mt-4">{JSON.stringify(poll.data ?? data, null, 2)}</pre>
    </div>
  );
}
