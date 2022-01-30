import * as React from "react";
import type { LoaderFunction } from "remix";
import { useLoaderData, useFetcher, useLocation } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserSession } from "~/utils/session.server";

type LoaderData = {
  accessPoint: Prisma.AccessPointGetPayload<{
    include: {
      accessUsers: true;
      accessManager: true;
    };
  }>;
};

export const loader: LoaderFunction = async ({
  request,
  params: { accessPointId },
}): Promise<LoaderData> => {
  const { userId } = await requireUserSession(request, "customer");
  const accessPoint = await db.accessPoint.findFirst({
    where: {
      id: Number(accessPointId),
      accessManager: { user: { id: userId } },
    },
    include: {
      accessUsers: { orderBy: { name: "asc" } },
      accessManager: true,
    },
    rejectOnNotFound: true,
  });
  return { accessPoint };
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
          <div className="flex h-5 items-center">
            <input
              id="poll"
              aria-describedby="comments-description"
              name="poll"
              type="checkbox"
              checked={isPolling}
              onChange={() => setIsPolling(!isPolling)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
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
