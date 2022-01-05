import * as React from "react";
import type { LoaderFunction } from "remix";
import { useLoaderData, Link } from "remix";
// import type { AccessPoint } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";

type LoaderData = {
  accessUser: Prisma.AccessUserGetPayload<{
    include: { accessPoints: true };
  }>;
};

export const loader: LoaderFunction = async ({
  params: { accessUserId: id },
}): Promise<LoaderData> => {
  const accessUser = await db.accessUser.findUnique({
    where: { id: Number(id) },
    include: { accessPoints: { orderBy: { name: "asc" } } },
    rejectOnNotFound: true,
  });
  return { accessUser };
};

export default function Index() {
  const { accessUser } = useLoaderData<LoaderData>();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold leading-7 text-gray-900">
        User {accessUser.name}{" "}
      </h1>
      <div className="flex mt-3 space-x-10 text-sm text-gray-500">
        <div>ID: {accessUser.id}</div>
        <div>
          Code:{" "}
          {accessUser.code || (
            <span className="font-bold">{accessUser.code}</span>
          )}
        </div>
        <div>
          {accessUser.enabled ? (
            "Enabled"
          ) : (
            <span className="font-bold">Disabled</span>
          )}
        </div>
      </div>
    </div>
  );
}
