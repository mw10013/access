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
    return json(
      {
        error: {
          name: "NotFoundError",
          message: `Access point ${id} not found.`,
        },
      },
      404
    );
  }
  const updatedAccessPoint = await db.accessPoint.update({
    where: { id: accessPoint.id },
    data: { heartbeatAt: new Date() },
  });

  return json({ accessPoint: updatedAccessPoint }, 200);
};
