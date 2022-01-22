import type { LoaderFunction } from "remix";
import { useLoaderData, Link } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import { Table, Th } from "~/components/lib";

type LoaderData = {
  accessManagers: Prisma.AccessManagerGetPayload<{}>[];
};

export const loader: LoaderFunction = async ({
  request,
}): Promise<LoaderData> => {
  const userId = await requireUserId(request);
  const accessManagers = await db.accessManager.findMany({
    where: {
      user: { id: Number(userId) },
    },
    orderBy: { name: "asc" },
  });
  return { accessManagers };
};

export default function RouteComponent() {
  const { accessManagers } = useLoaderData<LoaderData>();
  return (
    <div className="py-10">
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Managers
            </h1>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          <Table
            headers={
              <>
                <Th>Name</Th>
                <Th>Id</Th>
                <Th>Description</Th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">View</span>
                </th>
              </>
            }
          >
            {accessManagers.map((i) => (
              <tr key={i.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {i.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {i.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {i.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`${i.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View
                  </Link>{" "}
                </td>
              </tr>
            ))}
          </Table>
        </div>
      </main>
    </div>
  );
}
