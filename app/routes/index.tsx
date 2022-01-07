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
      accessUsers: {
        where: { code: { not: "" }; enabled: true };
        // orderBy: { code: "asc" };
      };
      accessHub: {
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
        where: { code: { not: "" }, enabled: true },
        orderBy: { code: "asc" },
      },
      accessHub: {
        include: {
          accessLocation: true,
        },
      },
      cachedConfig: true,
    },
    orderBy: [
      { accessHub: { accessLocation: { name: "asc" } } },
      { name: "asc" },
    ],
  });

  const data: LoaderData = { accessPoints };
  return data;
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
  const navigate = useNavigate();

  React.useEffect(() => {
    const intervalId = setInterval(
      () => navigate(".", { replace: true }),
      5000
    );
    return () => clearInterval(intervalId);
  }, [navigate]);
  return (
    <div className="p-4 bg-white">
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
            {accessPoints.map((ap) => (
              <tr key={ap.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ap.accessHub.accessLocation.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {ap.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {connectionStatus(ap.heartbeatAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ap.cachedConfig &&
                  _.isEqual(
                    {
                      codes: new Set(JSON.parse(ap.cachedConfig.codes)),
                    },
                    {
                      codes: new Set(ap.accessUsers.map((el) => el.code)),
                    }
                  )
                    ? "Saved"
                    : "Pending"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`/accesspoints/${ap.id}`}
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
