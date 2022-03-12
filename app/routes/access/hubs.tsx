import { Outlet } from "remix";

export const handle = {
  breadcrumb: "Hubs",
};

export default function RouteComponent() {
  return <Outlet />;
}
