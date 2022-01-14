import type { ActionFunction, LoaderFunction } from "remix";
import { redirect } from "remix";
import { db } from "~/utils/db.server";

export const action: ActionFunction = async ({
  params: { accessUserId, accessPointId },
}) => {
  await db.accessUser.update({
    where: { id: Number(accessUserId) },
    data: {
      accessPoints: { disconnect: { id: Number(accessPointId) } },
    },
  });
  return redirect(`/access/users/${accessUserId}`);
};
