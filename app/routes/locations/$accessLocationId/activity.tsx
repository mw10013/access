import type { LoaderFunction } from "remix";
import { useLoaderData, Link, useNavigate, useSubmit } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";

type LoaderData = {
  accessLocation: Prisma.AccessLocationGetPayload<{}>;
  accessEvents: Prisma.AccessEventGetPayload<{
    include: {
      accessPoint: {
        include: { accessManager: { include: { accessLocation: true } } };
      };
    };
  }>[];
  //   accessUsersObject: Record<string, Prisma.AccessUserGetPayload<{}>>;
  accessUsersObject: { [id: string]: Prisma.AccessUserGetPayload<{}> };
};

export const loader: LoaderFunction = async ({
  params: { accessLocationId },
}): Promise<LoaderData> => {
  const accessLocation = await db.accessLocation.findUnique({
    where: { id: Number(accessLocationId) },
    rejectOnNotFound: true,
  });

  const accessEvents = await db.accessEvent.findMany({
    where: {
      accessPoint: {
        accessManager: {
          accessLocation: { id: Number(accessLocationId) },
        },
      },
    },
    orderBy: { at: "desc" },
    include: {
      accessPoint: {
        include: { accessManager: { include: { accessLocation: true } } },
      },
    },
  });

  const accessUserIds = new Set(
    accessEvents
      .map((i) => i.accessUserId)
      .filter((i): i is number => typeof i === "number")
  );
  const accessUsers = await db.accessUser.findMany({
    where: {
      id: { in: [...accessUserIds] },
    },
  });
  const accessUsersObject = accessUsers.reduce(
    (acc: { [id: string]: Prisma.AccessUserGetPayload<{}> }, v) => {
      acc[v.id] = v;
      return acc;
    },
    {}
  );
  console.log({ accessEvents, accessUsersObject });

  return { accessLocation, accessEvents, accessUsersObject };
};

function accessUserDisplay(
  accessEvent: Prisma.AccessEventGetPayload<{}>,
  accessUsersObject: LoaderData["accessUsersObject"]
) {
  if (!accessEvent.accessUserId) {
    return "";
  }
  const accessUser = accessUsersObject[accessEvent.accessUserId];
  if (accessUser) {
    return accessUser.name;
  }
  return `Deleted user [${accessEvent.accessUserId}]`;
}

export default function Index() {
  const navigate = useNavigate();
  const submit = useSubmit();
  const { accessLocation, accessEvents, accessUsersObject } =
    useLoaderData<LoaderData>();
  return (
    <div className="p-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900">
          Location Activity
        </h1>
        <div className="flex space-x-2"></div>
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
            Events
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
                  At
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Access
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
                  User
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accessEvents.map((i) => (
                <tr key={i.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(i.at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {i.access}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {i.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {accessUserDisplay(i, accessUsersObject)}
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
