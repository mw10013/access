import { Outlet } from "remix";

export const handle = {
  breadcrumb: "Customer",
};

export default function RouteComponent() {
  return <Outlet />;
}
