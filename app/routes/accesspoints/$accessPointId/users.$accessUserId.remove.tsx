import type { ActionFunction } from "remix";
import { redirect } from "remix";
import { db } from "~/utils/db.server";

export const action: ActionFunction = async ({
  params: { accessPointId, accessUserId },
}) => {
  await db.accessPoint.update({
    where: { id: Number(accessPointId) },
    data: {
      accessUsers: { disconnect: { id: Number(accessUserId) } },
    },
  });
  return redirect(`/accesspoints/${accessPointId}`);
};
