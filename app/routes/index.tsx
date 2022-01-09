import * as React from "react";
import type { LoaderFunction } from "remix";
import { useLoaderData, Link, useNavigate } from "remix";
import type { AccessPoint } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import * as _ from "lodash";

type LoaderData = {
  accessPoints: Prisma.AccessPointGetPayload<{
    include: {
      accessUsers: true;
      accessManager: {
        include: {
          accessLocation: true;
        };
      };
      cachedConfig: true;
    };
  }>[];
};

export const loader: LoaderFunction = async () => {
  const accessPoints = await db.accessPoint.findMany({
    include: {
      accessUsers: {
        where: { enabled: true },
      },
      accessManager: {
        include: {
          accessLocation: true,
        },
      },
      cachedConfig: true,
    },
    orderBy: [
      { accessManager: { accessLocation: { name: "asc" } } },
      { name: "asc" },
    ],
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

export default function Index() {
  const { accessPoints } = useLoaderData<LoaderData>();
  const [poll, setPoll] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (poll) {
      const intervalId = setInterval(
        () => navigate(".", { replace: true }),
        5000
      );
      return () => clearInterval(intervalId);
    }
  }, [navigate, poll]);
  return (
    <div className="p-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900">
          Dashboard
        </h1>
        <div className="relative flex items-start">
          <div className="flex items-center h-5">
            <input
              id="poll"
              aria-describedby="comments-description"
              name="poll"
              type="checkbox"
              checked={poll}
              onChange={() => setPoll(!poll)}
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
      <div className="max-w-7xl mx-auto">
        <table className="mt-4 max-width-md divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Location
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Connection
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Config
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">View</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {accessPoints.map((i) => (
              <tr key={i.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Link
                    to={`/locations/${i.accessManager.accessLocation.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    {i.accessManager.accessLocation.name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {i.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {connectionStatus(i.heartbeatAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {i.cachedConfig &&
                  _.isEqual(
                    new Set(JSON.parse(i.cachedConfig.accessUsers)),
                    new Set(
                      i.accessUsers.map((i) => ({ id: i.id, code: i.code }))
                    )
                  )
                    ? "Saved"
                    : "Pending"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <Link
                    to={`/accesspoints/${i.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View
                  </Link>{" "}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
