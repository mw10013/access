import type { LoaderFunction } from "remix";
import { useLoaderData, Link, useNavigate, json } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import { Table, Td, TdLink, TdProminent, Th, ThSr } from "~/components/lib";

type LoaderData = {
  accessUsers: Prisma.AccessUserGetPayload<{}>[];
};

export const loader: LoaderFunction = async ({
  request,
}): Promise<LoaderData> => {
  const userId = await requireUserId(request);
  const accessUsers = await db.accessUser.findMany({
    where: { deletedAt: null, user: { id: Number(userId) } },
    orderBy: { name: "asc" },
  });

  return { accessUsers };
};

export default function RouteComponent() {
  const { accessUsers } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  return (
    <div className="py-10">
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Users
            </h1>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => navigate("create")}
            >
              Create
            </button>
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
                <Th>Code</Th>
                <ThSr>View</ThSr>
              </>
            }
          >
            {accessUsers.map((i) => (
              <tr key={i.id}>
                <TdProminent>{i.name}</TdProminent>
                <Td>{i.id}</Td>
                <Td>{i.code}</Td>
                <TdLink to={i.id.toString()}>View</TdLink>
              </tr>
            ))}
          </Table>
        </div>
      </main>
    </div>
  );
}
