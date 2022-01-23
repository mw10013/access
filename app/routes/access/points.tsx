import { Outlet } from "remix";

export const handle = {
  breadcrumb: "Points",
};

export default function RouteComponent() {
  return <Outlet />;
}
