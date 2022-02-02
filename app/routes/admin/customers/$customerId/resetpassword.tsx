import { Prisma } from "@prisma/client";
import React from "react";
import {
  ActionFunction,
  LoaderFunction,
  useActionData,
  useLoaderData,
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
  const customer = await db.user.findUnique({
    where: {
      id: Number(customerId),
    },
    rejectOnNotFound: true,
  });
  return { customer };
};

type ActionData = {
  resetPasswordHref: string;
};

export const action: ActionFunction = async ({
  request,
  params: { customerId },
}): Promise<ActionData> => {
  console.log({ url: request.url });
  await requireUserSession(request, "admin");
  const token = "my fancy token";
  const customer = await db.user.update({
    data: { resetPasswordHash: `reset-token-${new Date().toLocaleString()}` },
    where: { id: Number(customerId) },
  });

  const url = new URL(request.url);
  url.pathname = "/resetpassword";
  const urlSearchParams = new URLSearchParams({
    email: customer.email,
    token,
  });
  url.search = urlSearchParams.toString();

  return { resetPasswordHref: url.toString() };
};

export default function RouteComponent() {
  const { customer } = useLoaderData<LoaderData>();
  const { resetPasswordHref } = useActionData<ActionData>() ?? {};
  const { email, resetPasswordHash, resetPasswordExpireAt } = customer;

  return (
    <>
      <Header title={customer.email} />
      <Main>
        <Card title="Password Reset Link">
          <div className="px-4 pb-8 sm:px-6 lg:px-8">{resetPasswordHref}</div>
        </Card>
      </Main>
    </>
  );
}
