import { Outlet } from "remix";

export const handle = {
  breadcrumb: "Access Point",
};

export default function RouteComponent() {
  return <Outlet />;
}
