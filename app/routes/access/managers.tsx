import { Outlet } from "remix";

export const handle = {
  breadcrumb: "Managers",
};

export default function RouteComponent() {
  return <Outlet />;
}
