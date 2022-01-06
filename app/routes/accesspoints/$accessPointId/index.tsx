import type { LoaderFunction } from "remix";
import { useLoaderData, Link, useNavigate, useSubmit } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";

type LoaderData = {
  accessPoint: Prisma.AccessPointGetPayload<{
    include: { accessUsers: true };
  }>;
};

export const loader: LoaderFunction = async ({
  params: { accessPointId },
}): Promise<LoaderData> => {
  const accessPoint = await db.accessPoint.findUnique({
    where: { id: Number(accessPointId) },
    include: { accessUsers: { orderBy: { name: "asc" } } },
    rejectOnNotFound: true,
  });
  return { accessPoint };
};

export default function Index() {
  const navigate = useNavigate();
  const submit = useSubmit();
  const { accessPoint } = useLoaderData<LoaderData>();
  return (
    <div className="p-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900">
          Access Point {accessPoint.name}
        </h1>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-purple-500"
          onClick={() => navigate("edit")}
        >
          Edit
        </button>
      </div>
      <div className="flex mt-1 space-x-10 text-sm text-gray-500">
        <div>ID: {accessPoint.id}</div>
      </div>

      {accessPoint.description ? (
        <p className="mt-4">{accessPoint.description}</p>
      ) : null}

      <div className="mt-4">
        <div className="flex justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Access Users
          </h3>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-purple-500"
            onClick={() => navigate("./users/add")}
          >
            Add
          </button>
        </div>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p></p>
        </div>
        <div className="max-w-7xl mx-auto">
          <table className="mt-4 max-width-md divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ID
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
              {accessPoint.accessUsers.map((au) => (
                <tr key={au.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                    {au.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {au.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {au.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {au.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {au.enabled ? "Enabled" : "Disabled"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        submit(null, {
                          method: "post",
                          action: `/accesspoints/${accessPoint.id}/users/${au.id}/remove`,
                        });
                      }}
                    >
                      Remove
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* <pre className="mt-2">{JSON.stringify(accessUser, null, 2)}</pre> */}
    </div>
  );
}
