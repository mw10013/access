import { Prisma } from "@prisma/client";
import {
  ActionFunction,
  LoaderFunction,
  useLoaderData,
  useLocation,
} from "remix";
import { Card, Header, Main } from "~/components/lib";
import { db } from "~/utils/db.server";
import { requireUserSession } from "~/utils/session.server";

export const handle = {
  breadcrumb: "Reset Password",
};

type LoaderData = {
  customer: Prisma.UserGetPayload<{}>;
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
    rejectOnNotFound: true,
  });
  return { customer };
};

export const action: ActionFunction = async ({
  request,
  params: { customerId },
}) => {
  await requireUserSession(request, "admin");
  await db.user.update({
    data: { resetPasswordToken: `reset-token-${new Date().toLocaleString()}` },
    where: { id: Number(customerId) },
  });

  return null;
};

export default function RouteComponent() {
  const { customer } = useLoaderData<LoaderData>();
  const location = useLocation();
  const data = {
    location: location,
    pathname: location.pathname,
    resetPasswordToken: customer.resetPasswordToken,
    resetPasswordExpireAt: customer.resetPasswordExpireAt,
  };
  return (
    <>
      <Header title={customer.email} />
      <Main>
        <Card title="Password Reset Link">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </Card>
      </Main>
    </>
  );
}
