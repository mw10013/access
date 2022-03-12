import { Prisma } from "@prisma/client";
import {
  LoaderFunction,
  useFormAction,
  useLoaderData,
  useNavigate,
  useSubmit,
} from "remix";
import {
  Button,
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
      accessHubs: true;
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
      accessUsers: {
        where: { deletedAt: new Date(0) },
        orderBy: { name: "asc" },
      },
      accessHubs: { orderBy: { name: "asc" } },
    },
    rejectOnNotFound: true,
  });
  return { customer };
};

function codeActivateExpireStatus(
  accessUser: LoaderData["customer"]["accessUsers"][number]
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

export default function RouteComponent() {
  const { customer } = useLoaderData<LoaderData>();
  const submit = useSubmit();
  const resetPasswordAction = useFormAction("resetpassword");
  return (
    <>
      <Header
        title={customer.email}
        side={
          <Button
            onClick={() => {
              submit(null, { method: "post", action: resetPasswordAction });
            }}
          >
            Reset Password
          </Button>
        }
      />
      <Main>
        <Card title="Access Hubs">
          <Table
            decor="edge"
            headers={
              <>
                <Th>Name</Th>
                <Th>ID</Th>
                <Th>Description</Th>
                <Th>Heartbeat At</Th>
                <ThSr>View</ThSr>
              </>
            }
          >
            {customer.accessHubs.map((i) => (
              <tr key={i.id}>
                <TdProminent>{i.name}</TdProminent>
                <Td>{i.id}</Td>
                <Td>{i.description}</Td>
                <Td>
                  {i.heartbeatAt && new Date(i.heartbeatAt).toLocaleString()}
                </Td>
                <TdLink to={`hubs/${i.id}`}>View</TdLink>
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
                <Th>Code Status</Th>
                <Th>Activate Expire Status</Th>
                <ThSr>View</ThSr>
              </>
            }
          >
            {customer.accessUsers.map((i) => {
              const { codeStatus, activateExpireStatus } =
                codeActivateExpireStatus(i);
              return (
                <tr key={i.id}>
                  <TdProminent>{i.name}</TdProminent>
                  <Td>{i.id}</Td>
                  <Td>{i.code}</Td>
                  <Td>{codeStatus}</Td>
                  <Td>{activateExpireStatus}</Td>
                  <TdLink to={`users/${i.id}`}>View</TdLink>
                </tr>
              );
            })}
          </Table>
        </Card>
      </Main>
    </>
  );
}
