import { Prisma } from "@prisma/client";
import { LoaderFunction, useLoaderData } from "remix";
import { Header } from "~/components/lib";
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
  return <Header title={customer.email} />;
}
