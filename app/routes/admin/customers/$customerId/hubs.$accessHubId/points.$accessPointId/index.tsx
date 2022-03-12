import { PencilIcon, LinkIcon, CheckIcon } from "@heroicons/react/solid";
import { Prisma } from "@prisma/client";
import { LoaderFunction, useLoaderData, useNavigate } from "remix";
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
  accessPoint: Prisma.AccessPointGetPayload<{
    include: {
      accessUsers: true;
    };
  }>;
};

export const loader: LoaderFunction = async ({
  request,
  params: { customerId, accessPointId },
}): Promise<LoaderData> => {
  await requireUserSession(request, "admin");
  const accessPoint = await db.accessPoint.findFirst({
    where: {
      id: Number(accessPointId),
      accessHub: { user: { id: Number(customerId) } },
    },
    include: {
      accessUsers: { orderBy: { name: "asc" } },
    },
    rejectOnNotFound: true,
  });
  return { accessPoint };
};

export default function RouteComponent() {
  const { accessPoint } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  return (
    <>
      <Header
        title={accessPoint.name}
        side={
          <>
            <span className="hidden sm:block">
              <Button variant="white" onClick={() => navigate("activity")}>
                <LinkIcon
                  className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                  aria-hidden="true"
                />
                Activity
              </Button>
            </span>
            <span className="ml-3 hidden sm:block">
              <Button variant="white" onClick={() => navigate("raw")}>
                <CheckIcon
                  className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                  aria-hidden="true"
                />
                Raw
              </Button>
            </span>
          </>
        }
      />
      <Main>
        <Card title="Users">
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
            {accessPoint.accessUsers.map((i) => (
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
                <TdLink to={`../../../users/${i.id}`}>View</TdLink>
              </tr>
            ))}
          </Table>
        </Card>
      </Main>
    </>
  );
}
