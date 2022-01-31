import { Prisma } from "@prisma/client";
import { LoaderFunction, useLoaderData } from "remix";
import {
  Card,
  Header,
  Main,
  Table,
  Td,
  TdLink,
  TdProminent,
  Th,
  ThSr,
} from "~/components/lib";
import { db } from "~/utils/db.server";
import { requireUserSession } from "~/utils/session.server";

export const handle = {
  breadcrumb: "Access Manager",
};

type LoaderData = {
  accessManager: Prisma.AccessManagerGetPayload<{
    include: {
      accessPoints: true;
    };
  }>;
};

export const loader: LoaderFunction = async ({
  request,
  params: { customerId, accessManagerId },
}): Promise<LoaderData> => {
  await requireUserSession(request, "admin");
  const accessManager = await db.accessManager.findFirst({
    where: {
      id: Number(customerId),
      user: { id: Number(customerId) },
    },
    include: {
      accessPoints: { orderBy: { position: "asc" } },
    },
    rejectOnNotFound: true,
  });
  return { accessManager };
};

export default function RouteComponent() {
  const { accessManager } = useLoaderData<LoaderData>();
  return (
    <>
      <Header title={accessManager.name} />
      <Main>
        <Card title="Points">
          <Table
            decor="edge"
            headers={
              <>
                <Th>Position</Th>
                <Th>Name</Th>
                <Th>ID</Th>
                <Th>Heartbeat At</Th>
                <ThSr>View</ThSr>
              </>
            }
          >
            {accessManager.accessPoints.map((i) => (
              <tr key={i.id}>
                <Td>{i.position}</Td>
                <TdProminent>{i.name}</TdProminent>
                <Td>{i.id}</Td>
                <Td>
                  {i.heartbeatAt && new Date(i.heartbeatAt).toLocaleString}
                </Td>
                <TdLink to={`managers/${i.id}`}>View</TdLink>
              </tr>
            ))}
          </Table>
        </Card>
      </Main>
    </>
  );
}
