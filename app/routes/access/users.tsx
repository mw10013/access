import { Outlet } from "remix";

export const handle = {
  breadcrumb: "Users",
};

export default function RouteComponent() {
  return <Outlet />;
}
