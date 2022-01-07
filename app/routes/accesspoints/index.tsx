import type { LoaderFunction } from "remix";
import { useLoaderData, Link, useNavigate } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";

type LoaderData = {
  accessPoints: Prisma.AccessPointGetPayload<{
    include: {
      accessUsers: true;
      accessHub: { include: { accessLocation: true } };
    };
  }>[];
};

export const loader: LoaderFunction = async (): Promise<LoaderData> => {
  const accessPoints = await db.accessPoint.findMany({
    orderBy: { name: "asc" },
    include: {
      accessUsers: { orderBy: { name: "asc" } },
      accessHub: { include: { accessLocation: true } },
    },
  });
  return { accessPoints };
};

export default function Index() {
  const { accessPoints } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  return (
    <div className="p-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900">
          Access Points
        </h1>
        {/* <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-purple-500"
          onClick={() => navigate("create")}
        >
          Create
        </button> */}
      </div>
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
              Description
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
                {ap.description}
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
  );
}
