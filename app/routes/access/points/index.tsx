import type { LoaderFunction } from "remix";
import { useLoaderData, Link } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserSession } from "~/utils/session.server";
import {
  Header,
  Main,
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
  const { userId } = await requireUserSession(request, "customer");
  const accessPoints = await db.accessPoint.findMany({
    where: { accessManager: { user: { id: userId } } },
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
      <Header title="Points" />
      <Main>
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
      </Main>
    </>
  );
}
