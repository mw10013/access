import React from "react";
import { Link, NavLink, Outlet, useSubmit } from "remix";
import { GenericCatchBoundary, GenericErrorBoundary } from "~/components/lib";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const navigation = [
  { name: "Dashboard", to: "dashboard" },
  { name: "Users", to: "users" },
  { name: "Managers", to: "managers" },
  { name: "Access Points", to: "points" },
];

function Layout({ children }: { children: React.ReactNode }) {
  const submit = useSubmit();
  return (
    <div>
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold leading-7 text-gray-900">
                  <Link to="dashboard">Access</Link>
                </h1>
              </div>
              <div className="-my-px ml-6 flex space-x-8">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    className={({ isActive }) =>
                      classNames(
                        isActive
                          ? "border-indigo-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                        "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                      )
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
            <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
              <Link
                to="#"
                className="whitespace-nowrap text-sm font-medium text-gray-500 hover:text-gray-700"
                onClick={(e) => {
                  e.preventDefault();
                  submit(null, { action: "/signout", method: "post" });
                }}
              >
                Sign out
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}

export default function RouteComponent() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export function CatchBoundary() {
  return (
    <Layout>
      <GenericCatchBoundary />
    </Layout>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Layout>
      <GenericErrorBoundary error={error} />
    </Layout>
  );
}
