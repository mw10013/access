import { PencilIcon, CheckIcon, LinkIcon } from "@heroicons/react/solid";
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
  accessHub: Prisma.AccessHubGetPayload<{
    include: {
      accessPoints: true;
    };
  }>;
};

export const loader: LoaderFunction = async ({
  request,
  params: { customerId, accessHubId },
}): Promise<LoaderData> => {
  await requireUserSession(request, "admin");
  const accessHub = await db.accessHub.findFirst({
    where: {
      id: Number(customerId),
      user: { id: Number(customerId) },
    },
    include: {
      accessPoints: { orderBy: { position: "asc" } },
    },
    rejectOnNotFound: true,
  });
  return { accessHub };
};

export default function RouteComponent() {
  const { accessHub } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  return (
    <>
      <Header
        title={accessHub.name}
        side={
          <>
            <span className="hidden sm:block">
              <Button variant="white" onClick={() => navigate("mock")}>
                <PencilIcon
                  className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                  aria-hidden="true"
                />
                Mock
              </Button>
            </span>
            <span className="ml-3 hidden sm:block">
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
        <Card title="Points">
          <Table
            decor="edge"
            headers={
              <>
                <Th>Position</Th>
                <Th>Name</Th>
                <Th>ID</Th>
                <ThSr>View</ThSr>
              </>
            }
          >
            {accessHub.accessPoints.map((i) => (
              <tr key={i.id}>
                <Td>{i.position}</Td>
                <TdProminent>{i.name}</TdProminent>
                <Td>{i.id}</Td>
                <TdLink to={`points/${i.id}`}>View</TdLink>
              </tr>
            ))}
          </Table>
        </Card>
      </Main>
    </>
  );
}
