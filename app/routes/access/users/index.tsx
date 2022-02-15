import type { LoaderFunction } from "remix";
import { useLoaderData, useNavigate } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserSession } from "~/utils/session.server";
import {
  Button,
  Main,
  Header,
  Table,
  Td,
  TdLink,
  TdProminent,
  Th,
  ThSr,
} from "~/components/lib";

type LoaderData = {
  accessUsers: Prisma.AccessUserGetPayload<{}>[];
};

function codeActivateExpireStatus(
  accessUser: LoaderData["accessUsers"][number]
) {
  // JSON serializes dates as strings. The dates in LoaderData will come out as strings on the client.
  const activateCodeAt = accessUser.activateCodeAt
    ? new Date(accessUser.activateCodeAt)
    : null;
  const expireCodeAt = accessUser.expireCodeAt
    ? new Date(accessUser.expireCodeAt)
    : null;
  const now = Date.now();

  const codeStatus =
    expireCodeAt && now > expireCodeAt.getTime()
      ? "EXPIRED"
      : activateCodeAt && now < activateCodeAt.getTime()
      ? "PENDING"
      : "ACTIVE";

  const activateExpireStatus =
    codeStatus === "ACTIVE"
      ? expireCodeAt
        ? `Will expire at ${expireCodeAt.toLocaleString()}`
        : ``
      : codeStatus === "PENDING"
      ? expireCodeAt
        ? `Will activate at ${activateCodeAt?.toLocaleString()} until ${expireCodeAt.toLocaleString()}.`
        : `Will activate at ${activateCodeAt?.toLocaleString()}`
      : ``;

  return { codeStatus, activateExpireStatus };
}

export const loader: LoaderFunction = async ({
  request,
}): Promise<LoaderData> => {
  const { userId } = await requireUserSession(request, "customer");
  const accessUsers = await db.accessUser.findMany({
    where: { deletedAt: new Date(0), user: { id: userId } },
    orderBy: { name: "asc" },
  });

  return { accessUsers };
};

export default function RouteComponent() {
  const { accessUsers } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  return (
    <>
      <Header
        title="Users"
        side={<Button onClick={() => navigate("create")}>Create</Button>}
      />
      <Main>
        <Table
          headers={
            <>
              <Th>Name</Th>
              <Th>Id</Th>
              <Th>Code</Th>
              <Th>Code Status</Th>
              <Th>Activate Expire Status</Th>
              <ThSr>View</ThSr>
            </>
          }
        >
          {accessUsers.map((i) => {
            const { codeStatus, activateExpireStatus } =
              codeActivateExpireStatus(i);
            return (
              <tr key={i.id}>
                <TdProminent>{i.name}</TdProminent>
                <Td>{i.id}</Td>
                <Td>{i.code}</Td>
                <Td>{codeStatus}</Td>
                <Td>{activateExpireStatus}</Td>
                <TdLink to={i.id.toString()}>View</TdLink>
              </tr>
            );
          })}
        </Table>
      </Main>
    </>
  );
}
