import { Prisma } from "@prisma/client";
import {
  ActionFunction,
  LoaderFunction,
  useActionData,
  useLoaderData,
} from "remix";
import { Card, Header, Main } from "~/components/lib";
import { db } from "~/utils/db.server";
import {
  generatePasswordResetTokenAndHash,
  requireUserSession,
} from "~/utils/session.server";

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
  await requireUserSession(request, "admin");
  const { token, hash } = await generatePasswordResetTokenAndHash();
  const customer = await db.user.update({
    data: { resetPasswordHash: hash },
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
