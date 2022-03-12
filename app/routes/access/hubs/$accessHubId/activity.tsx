import { LoaderFunction } from "remix";
import { useLoaderData } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { Card, Header, Main, Table, Th } from "~/components/lib";
import { requireUserSession } from "~/utils/session.server";

export const handle = {
  breadcrumb: "Activity",
};

type LoaderData = {
  accessHub: Prisma.AccessHubGetPayload<{}>;
  accessEvents: Prisma.AccessEventGetPayload<{
    include: {
      accessUser: true;
      accessPoint: true;
    };
  }>[];
};

export const loader: LoaderFunction = async ({
  request,
  params: { accessHubId },
}): Promise<LoaderData> => {
  const { userId } = await requireUserSession(request, "customer");
  const accessHub = await db.accessHub.findFirst({
    where: { id: Number(accessHubId), user: { id: userId } },
    rejectOnNotFound: true,
  });

  const accessEvents = await db.accessEvent.findMany({
    where: {
      accessPoint: {
        accessHub: { id: accessHub.id },
      },
    },
    orderBy: { at: "desc" },
    include: {
      accessUser: true,
      accessPoint: true,
    },
  });

  return { accessHub, accessEvents };
};

export default function RouteComponent() {
  const { accessHub, accessEvents } = useLoaderData<LoaderData>();
  return (
    <>
      <Header title={accessHub.name} />
      <Main>
        <Card title="Access Events">
          <Table
            decor="edge"
            headers={
              <>
                <Th>At</Th>
                <Th>Point</Th>
                <Th>Access</Th>
                <Th>User</Th>
                <Th>Code</Th>
              </>
            }
          >
            {accessEvents.map((i) => (
              <tr key={i.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {new Date(i.at).toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {i.accessPoint.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {i.access}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {i.accessUser ? i.accessUser.name : null}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {i.code}
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </Main>
    </>
  );
}
