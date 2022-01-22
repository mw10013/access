import type { LoaderFunction } from "remix";
import { useLoaderData, Link, useNavigate, useSubmit } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

type LoaderData = {
  accessPoint: Prisma.AccessPointGetPayload<{
    include: {
      accessUsers: true;
      accessManager: true;
    };
  }>;
};

export const loader: LoaderFunction = async ({
  request,
  params: { accessPointId },
}): Promise<LoaderData> => {
  const userId = await requireUserId(request);
  const accessPoint = await db.accessPoint.findFirst({
    where: {
      id: Number(accessPointId),
      accessManager: { user: { id: Number(userId) } },
    },
    include: {
      accessUsers: { orderBy: { name: "asc" } },
      accessManager: true,
    },
    rejectOnNotFound: true,
  });
  return { accessPoint };
};

export default function RouteComponent() {
  const navigate = useNavigate();
  const submit = useSubmit();
  const { accessPoint } = useLoaderData<LoaderData>();
  return (
    <div className="p-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900">
          Access Point
        </h1>
        <div className="flex space-x-2">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-purple-500"
            onClick={() => navigate("raw")}
          >
            Raw
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-purple-500"
            onClick={() => navigate("edit")}
          >
            Edit
          </button>
        </div>
      </div>
      <div className="flex mt-1 space-x-10 text-sm text-gray-500">
        <div className="text-gray-900">{accessPoint.name}</div>
        <div>ID: {accessPoint.id}</div>
        <div>
          Manager:{" "}
          <Link
            to={`../managers/${accessPoint.accessManagerId}`}
            className="text-indigo-600 hover:text-indigo-900"
          >
            {accessPoint.accessManager.name}
          </Link>
        </div>
        <div>Position: {accessPoint.position}</div>
        <div>{accessPoint.description}</div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Users With Access
          </h3>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-purple-500"
            onClick={() => navigate("users/add")}
          >
            Add
          </button>
        </div>
        <div className="max-w-7xl mx-auto">
          <table className="max-width-md divide-y divide-gray-200">
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
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accessPoint.accessUsers.map((i) => (
                <tr key={i.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm  text-gray-500">
                    {i.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link
                      to={`../users/${i.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {i.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {i.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {i.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link
                      to="#"
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={(e) => {
                        e.preventDefault();
                        submit(null, {
                          method: "post",
                          action: `/access/points/${accessPoint.id}/users/${i.id}/remove`,
                        });
                      }}
                    >
                      Remove
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
