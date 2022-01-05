import * as React from "react";
import type { LoaderFunction } from "remix";
import { useLoaderData, Link } from "remix";
// import type { AccessPoint } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";

type LoaderData = {
  accessUsers: Prisma.AccessUserGetPayload<{
    include: { accessPoints: true };
  }>[];
};

export const loader: LoaderFunction = async (): Promise<LoaderData> => {
  const accessUsers = await db.accessUser.findMany({
    orderBy: { name: "asc" },
    include: { accessPoints: true },
  });
  return { accessUsers };
};

export default function Index() {
  const { accessUsers } = useLoaderData<LoaderData>();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold leading-7 text-gray-900">Users</h1>
      <table className="mt-4 max-width-md divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Id
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
              Code
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Enabled
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">View</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {accessUsers.map((au) => (
            <tr key={au.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {au.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {au.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {au.code}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {au.enabled ? "Enabled" : "Disabled"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link
                  to={`/users/${au.id}`}
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
  );
}
