import type { LoaderFunction } from "remix";
import { useLoaderData, Link, useNavigate, useSubmit } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

type LoaderData = {
  accessManager: Prisma.AccessManagerGetPayload<{
    include: {
      accessPoints: true;
    };
  }>;
};

export const loader: LoaderFunction = async ({
  request,
  params: { accessManagerId },
}): Promise<LoaderData> => {
  const userId = await requireUserId(request);

  const accessManager = await db.accessManager.findFirst({
    where: { id: Number(accessManagerId), user: { id: Number(userId) } },
    include: {
      accessPoints: {
        orderBy: { position: "asc" },
      },
    },
    rejectOnNotFound: true,
  });
  return { accessManager };
};

export default function Index() {
  const navigate = useNavigate();
  const { accessManager } = useLoaderData<LoaderData>();
  return (
    <div className="p-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900">
          Access Manager
        </h1>
        <div className="flex space-x-2">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-purple-500"
            onClick={() => navigate("mock")}
          >
            Mock
          </button>
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
        <div>{accessManager.name}</div>
        <div>ID: {accessManager.id}</div>
      </div>

      {accessManager.description ? (
        <p className="mt-2 text-sm text-gray-500">
          {accessManager.description}
        </p>
      ) : null}

      <div className="mt-4">
        <div className="flex justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Access Points
          </h3>
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
                  Position
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
              {accessManager.accessPoints.map((i) => (
                <tr key={i.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {i.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium  text-gray-900">
                    {i.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {i.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link
                      to={`../points/${i.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View
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
