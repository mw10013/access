import { requireUserSession } from "~/utils/session.server";
import {
  Main,
  Header,
  Table,
  Td,
  TdLink,
  TdProminent,
  Th,
  ThSr,
} from "~/components/lib";
import { Prisma } from "@prisma/client";
import { LoaderFunction, useLoaderData } from "remix";
import { db } from "~/utils/db.server";

type LoaderData = {
  users: Prisma.UserGetPayload<{}>[];
};

export const loader: LoaderFunction = async ({
  request,
}): Promise<LoaderData> => {
  await requireUserSession(request, "admin");
  const users = await db.user.findMany({
    where: { role: "customer" },
    orderBy: { email: "asc" },
  });
  return { users };
};

export default function RouteComponent() {
  const { users } = useLoaderData<LoaderData>();
  return (
    <>
      <Header title="Customers" />
      <Main>
        <Table
          headers={
            <>
              <Th>Email</Th>
              <Th>Created At</Th>
              <ThSr>View</ThSr>
            </>
          }
        >
          {users.map((i) => (
            <tr key={i.id}>
              <TdProminent>{i.email}</TdProminent>
              <Td>{new Date(i.createdAt).toLocaleDateString()}</Td>
              <TdLink to={`${i.id}`}>View</TdLink>
            </tr>
          ))}
        </Table>
      </Main>
    </>
  );
}
