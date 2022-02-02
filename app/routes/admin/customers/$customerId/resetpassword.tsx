import { Prisma } from "@prisma/client";
import React from "react";
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
  const { email, resetPasswordToken, resetPasswordExpireAt } = customer;
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    if (resetPasswordToken) {
      const url = new URL(window.location.href);
      url.pathname = "/resetpassword";
      const urlSearchParams = new URLSearchParams({
        email,
        token: resetPasswordToken,
      });
      url.search = urlSearchParams.toString();
      const data = {
        url,
        urlSearchParams: urlSearchParams.toString(),
        location: window.location,
        resetPasswordToken: customer.resetPasswordToken,
        resetPasswordExpireAt: customer.resetPasswordExpireAt,
      };
      setData(data);
    }
  }, [setData, resetPasswordToken, email]);

  return (
    <>
      <Header title={customer.email} />
      <Main>
        <Card title="Password Reset Link">
          <div className="px-4 sm:px-6 lg:px-8">{data?.url.toString()}</div>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </Card>
      </Main>
    </>
  );
}
