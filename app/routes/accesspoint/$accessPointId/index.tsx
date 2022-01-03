import * as React from "react";
import type { LoaderFunction } from "remix";
import { Outlet, useLoaderData, Link, useNavigate } from "remix";
import type { AccessPoint } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";

type LoaderData = {
  accessPoint: Prisma.AccessPointGetPayload<{
    include: { codes: true; cachedConfig: true };
  }>;
};

export const loader: LoaderFunction = async ({
  params: { accessPointId: id },
}) => {
  const accessPoint = await db.accessPoint.findUnique({
    where: { id: Number(id) },
    include: { codes: { orderBy: { name: "asc" } }, cachedConfig: true },
  });
  if (!accessPoint) {
    throw new Response("Access point not found.", {
      status: 404,
    });
  }
  const data: LoaderData = { accessPoint };
  return data;
};

export default function IdIndex() {
  const { accessPoint } = useLoaderData<LoaderData>();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold leading-7 text-gray-900">Overview</h1>
      <div className="m-4 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Codes</h3>
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
                    Code
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Enabled
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accessPoint.codes.map((code) => (
                  <tr key={code.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {code.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {code.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {code.enabled ? "Enabled" : "Disabled"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`code/${code.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>{" "}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
