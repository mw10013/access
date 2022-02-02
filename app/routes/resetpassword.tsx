import { Prisma } from "@prisma/client";
import { LoaderFunction, useLoaderData } from "remix";
import { db } from "~/utils/db.server";

type LoaderData = {
  user: Prisma.UserGetPayload<{}>;
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
  return { user };
};

export default function RouteComponent() {
  const { user } = useLoaderData<LoaderData>();
  return <div>{user.email}</div>;
}
