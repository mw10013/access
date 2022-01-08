import type { LoaderFunction } from "remix";
import { useLoaderData, Link, useNavigate, useSubmit } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";

type LoaderData = {
  accessLocation: Prisma.AccessLocationGetPayload<{
    include: {
      accessManagers: { include: { accessPoints: true } };
    };
  }>;
  accessPoints: Prisma.AccessPointGetPayload<{
    include: {
      accessManager: { include: { accessLocation: true } };
    };
  }>[];
};

export const loader: LoaderFunction = async ({
  params: { accessLocationId },
}): Promise<LoaderData> => {
  const accessLocation = await db.accessLocation.findUnique({
    where: { id: Number(accessLocationId) },
    include: {
      accessManagers: {
        include: { accessPoints: { orderBy: { name: "asc" } } },
      },
    },
    rejectOnNotFound: true,
  });

  const accessPoints = await db.accessPoint.findMany({
    where: {
      accessManagerId: { in: accessLocation.accessManagers.map((el) => el.id) },
    },
    include: { accessManager: { include: { accessLocation: true } } },
    orderBy: { name: "asc" },
  });
  return { accessLocation, accessPoints };
};

export default function Index() {
  const navigate = useNavigate();
  const submit = useSubmit();
  const { accessLocation, accessPoints } = useLoaderData<LoaderData>();
  return (
    <div className="p-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900">Location</h1>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-purple-500"
          onClick={() => navigate("edit")}
        >
          Edit
        </button>
      </div>
      <div className="flex mt-1 space-x-10 text-sm text-gray-500">
        <div>{accessLocation.name}</div>
        <div>ID: {accessLocation.id}</div>
      </div>

      {accessLocation.description ? (
        <p className="mt-2 text-sm text-gray-500">
          {accessLocation.description}
        </p>
      ) : null}

      <div className="mt-4">
        <div className="flex justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Access Points
          </h3>
          {/* <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-purple-500"
            onClick={() => navigate("./accesspoints/add")}
          >
            Add
          </button> */}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium  text-gray-900">
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
