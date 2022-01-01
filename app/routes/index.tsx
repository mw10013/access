import * as React from "react";
import type { LoaderFunction } from "remix";
import { useLoaderData, Link, useNavigate } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import * as _ from "lodash";

type LoaderData = {
  accessPoints: Prisma.AccessPointGetPayload<{
    include: { cachedConfig: true };
  }>[];
};

export const loader: LoaderFunction = async () => {
  const accessPoints = await db.accessPoint.findMany({
    include: { cachedConfig: true },
    orderBy: { key: "asc" },
  });
  const data: LoaderData = { accessPoints };
  return data;
};

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
    <div className="p-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold leading-7 text-gray-900">Access</h1>
        <table className="mt-4 max-width-md divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Key
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Code
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
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Heartbeats
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Heartbase At
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Mock</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {accessPoints.map((ap) => (
              <tr key={ap.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {ap.key}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ap.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ap.heartbeatAt ? typeof ap.heartbeatAt : `DISCONNECTED`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ap.cachedConfig &&
                  _.isEqual({ code: ap.cachedConfig.code }, { code: ap.code })
                    ? "Saved"
                    : "Pending"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {ap.heartbeats}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ap.heartbeatAt
                    ? new Date(ap.heartbeatAt).toLocaleString("en-US")
                    : null}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`/accesspoint/edit/${ap.key}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </Link>{" "}
                  <Link
                    to={`/accesspoint/mock/${ap.key}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Mock
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
