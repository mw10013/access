import type { LoaderFunction } from "remix";
import { useLoaderData } from "remix";
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

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

type LoaderData = {
  accessHubs: Prisma.AccessHubGetPayload<{}>[];
};

export const loader: LoaderFunction = async ({
  request,
}): Promise<LoaderData> => {
  const { userId } = await requireUserSession(request, "customer");
  const accessHubs = await db.accessHub.findMany({
    where: {
      user: { id: userId },
    },
    orderBy: { name: "asc" },
  });
  return { accessHubs };
};

export default function RouteComponent() {
  const { accessHubs } = useLoaderData<LoaderData>();
  return (
    <>
      <Header title="Hubs" />
      <Main>
        <Table
          headers={
            <>
              <Th>Name</Th>
              <Th>Id</Th>
              <Th>Description</Th>
              <ThSr>View</ThSr>
            </>
          }
        >
          {accessHubs.map((i) => (
            <tr key={i.id}>
              <TdProminent>{i.name}</TdProminent>
              <Td>{i.id}</Td>
              <Td>{i.description}</Td>
              <TdLink to={`${i.id}`}>View</TdLink>
            </tr>
          ))}
        </Table>
      </Main>
    </>
  );
}
