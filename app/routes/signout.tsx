import type { ActionFunction, LoaderFunction } from "remix";
import { redirect } from "remix";
import { signOut } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
  return signOut(request);
};

export const loader: LoaderFunction = async () => {
  return redirect("/");
};
