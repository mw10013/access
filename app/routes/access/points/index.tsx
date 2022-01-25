import type { LoaderFunction } from "remix";
import { useLoaderData, Link } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import {
  OverflowShadow,
  Table,
  Td,
  TdLink,
  TdProminent,
  Th,
  ThSr,
} from "~/components/lib";

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

export default function RouteComponent() {
  const { accessPoints } = useLoaderData<LoaderData>();
  return (
    <>
      <header className="p-8">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Points
            </h2>
          </div>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto sm:px-8">
          <OverflowShadow>
            <Table
              headers={
                <>
                  <Th>Name</Th>
                  <Th>Manager</Th>
                  <Th>Description</Th>
                  <ThSr>View</ThSr>
                </>
              }
            >
              {accessPoints.map((i) => (
                <tr key={i.id}>
                  <TdProminent>{i.name}</TdProminent>
                  <Td>{i.accessManager.name}</Td>
                  <Td>{i.description}</Td>
                  <TdLink to={`${i.id}`}>View</TdLink>
                </tr>
              ))}
            </Table>
          </OverflowShadow>
        </div>
      </main>
    </>
  );
}
