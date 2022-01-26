import type { LoaderFunction } from "remix";
import { useLoaderData } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
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
  accessManagers: Prisma.AccessManagerGetPayload<{}>[];
};

export const loader: LoaderFunction = async ({
  request,
}): Promise<LoaderData> => {
  const userId = await requireUserId(request);
  const accessManagers = await db.accessManager.findMany({
    where: {
      user: { id: Number(userId) },
    },
    orderBy: { name: "asc" },
  });
  return { accessManagers };
};

export default function RouteComponent() {
  const { accessManagers } = useLoaderData<LoaderData>();
  return (
    <>
      <Header title="Managers" />
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
          {accessManagers.map((i) => (
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
