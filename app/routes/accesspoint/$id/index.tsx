import * as React from "react";
import type { LoaderFunction } from "remix";
import { Outlet, useLoaderData, Link, useNavigate } from "remix";
import type { AccessPoint } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";

export default function IdIndex() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold leading-7 text-gray-900">Overview</h1>
    </div>
  );
}
