import type { LoaderFunction } from "remix";
import { useLoaderData, Link, useNavigate, useSubmit } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";

type LoaderData = {
  accessUser: Prisma.AccessUserGetPayload<{
    include: {
      accessPoints: {
        include: { accessManager: { include: { accessLocation: true } } };
      };
    };
  }>;
};

export const loader: LoaderFunction = async ({
  params: { accessUserId },
}): Promise<LoaderData> => {
  const accessUser = await db.accessUser.findFirst({
    where: { id: Number(accessUserId), deletedAt: null },
    include: {
      accessPoints: {
        orderBy: [
          { accessManager: { accessLocation: { name: "asc" } } },
          { name: "asc" },
        ],
        include: { accessManager: { include: { accessLocation: true } } },
      },
    },
    rejectOnNotFound: true,
  });
  return { accessUser };
};

export default function Index() {
  const navigate = useNavigate();
  const submit = useSubmit();
  const { accessUser } = useLoaderData<LoaderData>();
  return (
    <div className="p-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900">User</h1>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-purple-500"
          onClick={() => navigate("edit")}
        >
          Edit
        </button>
      </div>
      <div className="flex mt-1 space-x-10 text-sm text-gray-500">
        <div>{accessUser.name}</div>
        <div>ID: {accessUser.id}</div>
        <div>
          Code:{" "}
          {accessUser.code || (
            <span className="font-bold">{accessUser.code}</span>
          )}
        </div>
        <div>
          {accessUser.enabled ? (
            "Enabled"
          ) : (
            <span className="font-bold">Disabled</span>
          )}
        </div>
      </div>

      {accessUser.description ? (
        <p className="mt-2 text-sm text-gray-500">{accessUser.description}</p>
      ) : null}

      <div className="mt-4">
        <div className="flex justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Access Points
          </h3>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-purple-500"
            onClick={() => navigate("./accesspoints/add")}
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
              {accessUser.accessPoints.map((i) => (
                <tr key={i.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link
                      to={`/access/locations/${i.accessManager.accessLocation.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {i.accessManager.accessLocation.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium  text-gray-900">
                    {i.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {i.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link
                      to="#"
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={(e) => {
                        e.preventDefault();
                        submit(null, {
                          method: "post",
                          action: `/access/users/${accessUser.id}/accesspoints/${i.id}/remove`,
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