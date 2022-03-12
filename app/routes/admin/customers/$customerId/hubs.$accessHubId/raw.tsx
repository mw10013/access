import { Prisma } from "@prisma/client";
import React from "react";
import { LoaderFunction, useFetcher, useLoaderData, useLocation } from "remix";
import { Header, Main } from "~/components/lib";
import { db } from "~/utils/db.server";
import { requireUserSession } from "~/utils/session.server";

export const handle = {
  breadcrumb: "Raw",
};

type LoaderData = {
  accessHub: Prisma.AccessHubGetPayload<{
    include: {
      accessPoints: { include: { accessUsers: true } };
    };
  }>;
};

export const loader: LoaderFunction = async ({
  request,
  params: { customerId, accessHubId },
}): Promise<LoaderData> => {
  await requireUserSession(request, "admin");
  const accessHub = await db.accessHub.findFirst({
    where: { id: Number(accessHubId), user: { id: Number(customerId) } },
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
  return { accessHub };
};

export default function RouteComponent() {
  const { accessHub } = useLoaderData<LoaderData>();
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
    <>
      <Header
        title={accessHub.name}
        side={
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
        }
      />
      <Main>
        <pre>{JSON.stringify(poll.data?.accessHub ?? accessHub, null, 2)}</pre>
      </Main>
    </>
  );
}
