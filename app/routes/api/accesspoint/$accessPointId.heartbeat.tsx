import type { LoaderFunction } from "remix";
import { json } from "remix";
import { db } from "~/utils/db.server";

export const loader: LoaderFunction = async ({
  params: { accessPointId: id },
}) => {
  const accessPoint = await db.accessPoint.findUnique({
    where: { id: Number(id) },
  });
  if (!accessPoint) {
    throw new Response("AccessPoint not found.", {
      status: 404,
    });
  }
  const updatedAccessPoint = await db.accessPoint.update({
    where: { id: accessPoint.id },
    data: { heartbeatAt: new Date() },
  });

  return json({ accessPoint: updatedAccessPoint }, 200);
};
