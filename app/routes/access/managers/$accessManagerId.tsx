import { Outlet } from "remix";

export const handle = {
  breadcrumb: "Access Manager",
};

export default function RouteComponent() {
  return <Outlet />;
}
