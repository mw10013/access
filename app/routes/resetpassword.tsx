import { Prisma } from "@prisma/client";
import { LoaderFunction, useLoaderData } from "remix";
import { db } from "~/utils/db.server";
import { comparePasswordResetTokenAndHash } from "~/utils/session.server";
import { Main, Card } from "~/components/lib";

type LoaderData = {
  user: Prisma.UserGetPayload<{}>;
  error?: string;
};

export const loader: LoaderFunction = async ({
  request,
}): Promise<LoaderData> => {
  const url = new URL(request.url);
  const { email, token } = Object.fromEntries(url.searchParams);
  const user = await db.user.findUnique({
    where: {
      email,
    },
    rejectOnNotFound: true,
  });
  if (
    !token ||
    !user.resetPasswordHash ||
    !user.resetPasswordExpireAt ||
    user.resetPasswordExpireAt.getTime() < Date.now() ||
    !(await comparePasswordResetTokenAndHash(token, user.resetPasswordHash))
  ) {
    return { user, error: "Invalid or expired password reset." };
  }
  // console.log({token, hash: user.resetPasswordHash, compare: })
  return { user };
};

export default function RouteComponent() {
  const { user, error } = useLoaderData<LoaderData>();
  return (
    <Main>
      <div className="mt-8">
        {error ? (
          <Card title="Reset Password">
            <div className="px-4 pb-8 sm:px-6 lg:px-8">{error}</div>
          </Card>
        ) : (
          user.email
        )}
      </div>
    </Main>
  );
}
