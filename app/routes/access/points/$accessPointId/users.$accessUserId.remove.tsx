import type { ActionFunction } from "remix";
import { redirect } from "remix";
import { db } from "~/utils/db.server";
import { requireUserSession } from "~/utils/session.server";

export const action: ActionFunction = async ({
  request,
  params: { accessPointId, accessUserId },
}) => {
  const { userId } = await requireUserSession(request, "customer");
  const accessPoint = await db.accessPoint.findFirst({
    where: {
      id: Number(accessPointId),
      accessHub: { user: { id: userId } },
    },
    rejectOnNotFound: true,
  });
  await db.accessPoint.update({
    where: { id: accessPoint.id },
    data: {
      accessUsers: { disconnect: { id: Number(accessUserId) } },
    },
  });
  return redirect(`/access/points/${accessPointId}`);
};
