import type { LoaderFunction } from "remix";
import { json } from "remix";
import { db } from "../../../utils/db.server";

export const loader: LoaderFunction = async () => {
  const accessPoints = await db.accessPoint.findMany({
    orderBy: { key: "asc" },
  });
  return json({ accessPoints }, 200);
};
