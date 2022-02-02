import { Prisma } from "@prisma/client";
import { LoaderFunction, useLoaderData } from "remix";
import { db } from "~/utils/db.server";
import { comparePasswordResetTokenAndHash } from "~/utils/session.server";

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
  console.log({ user, email, token });
  if (
    !user.resetPasswordHash ||
    !user.resetPasswordExpireAt ||
    user.resetPasswordExpireAt.getTime() < Date.now() ||
    !comparePasswordResetTokenAndHash(token, user.resetPasswordHash)
  ) {
    return { user, error: "Invalid or expired password reset." };
  }
  return { user };
};

export default function RouteComponent() {
  const { user, error } = useLoaderData<LoaderData>();
  return <div>{error ? error : user.email}</div>;
}
