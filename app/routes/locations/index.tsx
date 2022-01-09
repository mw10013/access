import type { LoaderFunction } from "remix";
import { useLoaderData, Link, useNavigate } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";

type LoaderData = {
  accessLocations: Prisma.AccessLocationGetPayload<{}>[];
};

export const loader: LoaderFunction = async (): Promise<LoaderData> => {
  const accessLocations = await db.accessLocation.findMany({
    orderBy: { name: "asc" },
  });
  return { accessLocations };
};

export default function Index() {
  const { accessLocations } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  return (
    <div className="p-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900">
          Locations
        </h1>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-purple-500"
          onClick={() => navigate("create")}
        >
          Create
        </button>
      </div>
      <table className="mt-4 max-width-md divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
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
          {accessLocations.map((al) => (
            <tr key={al.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {al.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {al.description}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <Link
                  to={`/locations/${al.id}`}
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
