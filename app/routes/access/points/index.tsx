import type { LoaderFunction } from "remix";
import { useLoaderData, Link, useNavigate } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import { Table, Th } from "~/components/lib";

type LoaderData = {
  accessPoints: Prisma.AccessPointGetPayload<{
    include: {
      accessUsers: true;
      accessManager: true;
    };
  }>[];
};

export const loader: LoaderFunction = async ({
  request,
}): Promise<LoaderData> => {
  const userId = await requireUserId(request);
  const accessPoints = await db.accessPoint.findMany({
    where: { accessManager: { user: { id: Number(userId) } } },
    orderBy: [{ accessManager: { name: "asc" } }, { name: "asc" }],
    include: {
      accessUsers: { orderBy: { name: "asc" } },
      accessManager: true,
    },
  });
  return { accessPoints };
};

export default function Index() {
  const { accessPoints } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  return (
    <div className="py-10">
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Access Points
            </h1>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-8">
          <Table
            headers={
              <>
                <Th>Name</Th>
                <Th>Manager</Th>
                <Th>Description</Th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">View</span>
                </th>
              </>
            }
          >
            {accessPoints.map((i) => (
              <tr key={i.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {i.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {i.accessManager.name}
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
                  </Link>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      </main>
    </div>
  );
}
