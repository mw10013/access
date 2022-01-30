import { LoaderFunction, useMatches } from "remix";
import { useLoaderData } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { Breadcrumbs, Table, Th } from "~/components/lib";
import { requireUserSession } from "~/utils/session.server";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const handle = {
  breadcrumb: "Activity",
};

type LoaderData = {
  accessManager: Prisma.AccessManagerGetPayload<{}>;
  accessEvents: Prisma.AccessEventGetPayload<{
    include: {
      accessUser: true;
      accessPoint: true;
    };
  }>[];
};

export const loader: LoaderFunction = async ({
  request,
  params: { accessManagerId },
}): Promise<LoaderData> => {
  const { userId } = await requireUserSession(request, "customer");
  const accessManager = await db.accessManager.findFirst({
    where: { id: Number(accessManagerId), user: { id: userId } },
    rejectOnNotFound: true,
  });

  const accessEvents = await db.accessEvent.findMany({
    where: {
      accessPoint: {
        accessManager: { id: accessManager.id },
      },
    },
    orderBy: { at: "desc" },
    include: {
      accessUser: true,
      accessPoint: true,
    },
  });

  return { accessManager, accessEvents };
};

export default function RouteComponent() {
  const { accessManager, accessEvents } = useLoaderData<LoaderData>();
  const matches = useMatches();
  return (
    <>
      <header className="p-8">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <Breadcrumbs />
            <h2 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
              {accessManager.name}
            </h2>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-6 pb-8 sm:px-8">
        <section aria-labelledby="access-events-heading">
          <div className="bg-white pt-6 shadow sm:overflow-hidden sm:rounded-md">
            <div className="px-4 sm:px-6">
              <h2
                id="access-events-heading"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                Access Events
              </h2>
            </div>
            <div className="mt-6">
              <Table
                headers={
                  <>
                    <Th>At</Th>
                    <Th>Access</Th>
                    <Th>Code</Th>
                    <Th>User</Th>
                  </>
                }
              >
                {accessEvents.map((i) => (
                  <tr key={i.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {new Date(i.at).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {i.access}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {i.code}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {i.accessUser ? i.accessUser.name : null}
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
