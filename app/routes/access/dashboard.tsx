import * as React from "react";
import type { LoaderFunction } from "remix";
import { useLoaderData, useFetcher, Link, useLocation } from "remix";
import type { AccessPoint } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import { Table, Td, TdLink, TdProminent, Th, ThSr } from "~/components/lib";
import { OverflowShadow } from "../../components/lib";

type LoaderData = {
  accessPoints: Prisma.AccessPointGetPayload<{
    include: {
      accessUsers: true;
      accessManager: {
        include: {
          user: true;
        };
      };
    };
  }>[];
};

export const loader: LoaderFunction = async ({
  request,
}): Promise<LoaderData> => {
  const userId = await requireUserId(request);

  const accessPoints = await db.accessPoint.findMany({
    where: {
      accessManager: {
        userId: Number(userId),
      },
    },
    include: {
      accessUsers: true,
      accessManager: {
        include: {
          user: true,
        },
      },
    },
    orderBy: [{ accessManager: { name: "asc" } }, { name: "asc" }],
  });
  return { accessPoints };
};

function connectionStatus(heartbeatAt: AccessPoint["heartbeatAt"]) {
  if (heartbeatAt) {
    const deltaMs = Date.now() - new Date(heartbeatAt).getTime();
    if (deltaMs < 5 * 1000) {
      return "Live";
    }
    if (deltaMs < 10 * 1000) {
      return "Dying";
    }
  }
  return "Dead";
}

export default function RouteComponent() {
  const { accessPoints } = useLoaderData<LoaderData>();
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
    <div className="py-10">
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Dashboard
            </h1>
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
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          <OverflowShadow>
            <Table
              headers={
                <>
                  <Th>Manager</Th>
                  <Th>Name</Th>
                  <Th>Connection</Th>
                  <ThSr>View</ThSr>
                </>
              }
            >
              {(poll.data?.accessPoints ?? accessPoints).map((i) => (
                <tr key={i.id}>
                  <Td>{i.accessManager.name}</Td>
                  <TdProminent>{i.name}</TdProminent>
                  <Td>{connectionStatus(i.heartbeatAt)}</Td>
                  <TdLink to={`../points/${i.id}`}>View</TdLink>
                </tr>
              ))}
            </Table>
          </OverflowShadow>
        </div>
      </main>
    </div>
  );
}
