import { Outlet } from "remix";

export const handle = {
  breadcrumb: "Point",
};

export default function RouteComponent() {
  return <Outlet />;
}
