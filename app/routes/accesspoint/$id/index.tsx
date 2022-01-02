import * as React from "react";
import type { LoaderFunction } from "remix";
import { Outlet, useLoaderData, Link, useNavigate } from "remix";
import type { AccessPoint } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";

export default function IdIndex() {
  return <div>ID Index</div>;
}
