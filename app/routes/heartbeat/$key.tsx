import type { LoaderFunction } from "remix";
import { json } from "remix";
import type { AccessPoint } from "@prisma/client";
import { db } from "~/utils/db.server";

//https://remix.run/docs/en/v1.0.6/api/remix#json

export const loader: LoaderFunction = async ({ params }) => {
  const accessPoints = await db.accessPoint.findMany();
  return json({ key: params.key, accessPoints, success: true }, 200);
};
