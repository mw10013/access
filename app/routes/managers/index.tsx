import type { LoaderFunction } from "remix";
import { useLoaderData, Link, useNavigate } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";

type LoaderData = {
  accessManagers: Prisma.AccessManagerGetPayload<{
    include: { accessPoints: true };
  }>[];
};

export const loader: LoaderFunction = async (): Promise<LoaderData> => {
  const accessManagers = await db.accessManager.findMany({
    orderBy: { name: "asc" },
    include: { accessPoints: true },
  });
  return { accessManagers };
};

export default function Index() {
  const { accessManagers } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  return (
    <div className="p-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900">
          Access Managers
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
              Description
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">View</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {accessManagers.map((i) => (
            <tr key={i.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {i.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {i.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {i.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <Link
                  to={`/managers/${i.id}`}
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
