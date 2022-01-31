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

type LoaderData = {
  customer: Prisma.UserGetPayload<{
    include: {
      accessUsers: true;
      accessManagers: true;
    };
  }>;
};

export const loader: LoaderFunction = async ({
  request,
  params: { customerId },
}): Promise<LoaderData> => {
  await requireUserSession(request, "admin");
  const customer = await db.user.findFirst({
    where: {
      id: Number(customerId),
    },
    include: {
      accessUsers: { orderBy: { name: "asc" } },
      accessManagers: { orderBy: { name: "asc" } },
    },
    rejectOnNotFound: true,
  });
  return { customer };
};

export default function RouteComponent() {
  const { customer } = useLoaderData<LoaderData>();
  return (
    <>
      <Header title={customer.email} />
      <Main>
        <Card title="Access Managers">
          <Table
            decor="edge"
            headers={
              <>
                <Th>Name</Th>
                <Th>ID</Th>
                <Th>Description</Th>
                <ThSr>View</ThSr>
              </>
            }
          >
            {customer.accessManagers.map((i) => (
              <tr key={i.id}>
                <TdProminent>{i.name}</TdProminent>
                <Td>{i.id}</Td>
                <Td>{i.description}</Td>
                <TdLink to={`managers/${i.id}`}>View</TdLink>
              </tr>
            ))}
          </Table>
        </Card>
        <Card title="Access Users">
          <Table
            decor="edge"
            headers={
              <>
                <Th>Name</Th>
                <Th>ID</Th>
                <Th>Code</Th>
                <Th>Activate Code At</Th>
                <Th>Expire Code At</Th>
                <ThSr>View</ThSr>
              </>
            }
          >
            {customer.accessUsers.map((i) => (
              <tr key={i.id}>
                <TdProminent>{i.name}</TdProminent>
                <Td>{i.id}</Td>
                <Td>{i.code}</Td>
                <Td>
                  {i.activateCodeAt &&
                    new Date(i.activateCodeAt).toLocaleString()}
                </Td>
                <Td>
                  {i.expireCodeAt && new Date(i.expireCodeAt).toLocaleString()}
                </Td>
                <TdLink to={`users/${i.id}`}>View</TdLink>
              </tr>
            ))}
          </Table>
        </Card>
      </Main>
    </>
  );
}
