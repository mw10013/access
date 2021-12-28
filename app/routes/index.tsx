import type { LoaderFunction } from "remix";
import { useLoaderData, Link } from "remix";
import type { AccessPoint } from "@prisma/client";
import { db } from "~/utils/db.server";

type LoaderData = { accessPoints: AccessPoint[] };

export const loader: LoaderFunction = async ({ params }) => {
  const accessPoints = await db.accessPoint.findMany({
    orderBy: { key: "asc" },
  });
  const data: LoaderData = { accessPoints };
  return data;
};

export default function Index() {
  const { accessPoints } = useLoaderData<LoaderData>();
  return (
    <div className="p-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold leading-7 text-gray-900">Access</h1>
        <table className="max-width-md divide-y divide-gray-200">
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
                    to={`/mock/${ap.key}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Mock
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* <pre>{JSON.stringify(accessPoints, null, 2)}</pre> */}
      </div>
    </div>
  );
}
