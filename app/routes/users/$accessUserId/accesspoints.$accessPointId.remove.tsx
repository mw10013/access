import * as React from "react";
import type { ActionFunction, LoaderFunction } from "remix";
import {
  useActionData,
  useLoaderData,
  Form,
  useNavigate,
  redirect,
} from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";

export const action: ActionFunction = async ({
  request,
  params: { accessUserId, accessPointId },
}) => {
  console.log({ fn: "remove", accessUserId, accessPointId });

  await db.accessUser.update({
    where: { id: Number(accessUserId) },
    data: {
      accessPoints: { disconnect: { id: Number(accessPointId) } },
    },
  });
  return redirect(`/users/${accessUserId}`);
};
