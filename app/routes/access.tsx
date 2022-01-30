import { json, Link, LoaderFunction, useMatches } from "remix";
import { NavLink, Outlet, useSubmit } from "remix";
import { GenericCatchBoundary, GenericErrorBoundary } from "~/components/lib";
import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { BellIcon, MenuIcon, XIcon } from "@heroicons/react/outline";
import { HomeIcon } from "@heroicons/react/solid";
import logoHref from "~/assets/logo.svg";
import avatarHref from "~/assets/avatar.jpg";
import { requireUserSession } from "~/utils/session.server";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const handle = {
  breadcrumb: (match: ReturnType<typeof useMatches>[number]) => (
    <Link to={match.pathname} className="text-gray-400 hover:text-gray-500">
      <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <span className="sr-only">Home</span>
    </Link>
  ),
};

const user = {
  name: "Tom Cook",
  email: "tom@example.com",
  imageUrl: avatarHref,
};
const userNavigation = [
  { name: "Your Profile", href: "#" },
  { name: "Settings", href: "#" },
  // { name: "Sign out", href: "#" },
];

const navigation = [
  { name: "Dashboard", to: "dashboard" },
  { name: "Users", to: "users" },
  { name: "Managers", to: "managers" },
  { name: "Points", to: "points" },
];

function Layout({ children }: { children: React.ReactNode }) {
  const submit = useSubmit();
  // https://tailwindui.com/components/application-ui/page-examples/detail-screens
  // With page heading and stacked list
  // <div className="min-h-full">
  return (
    <div className="min-h-full">
      <Disclosure as="nav" className="border-b border-gray-200 bg-white">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <div className="flex flex-shrink-0 items-center">
                    <img
                      className="block h-8 w-auto lg:hidden"
                      src={logoHref}
                      alt="Workflow"
                    />
                    <img
                      className="hidden h-8 w-auto lg:block"
                      src={logoHref}
                      alt="Workflow"
                    />
                  </div>
                  <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                    {navigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.to}
                        className={({ isActive }) =>
                          classNames(
                            isActive
                              ? "border-indigo-500 text-gray-900"
                              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                            "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium"
                          )
                        }
                      >
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:items-center">
                  <button
                    type="button"
                    className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>

                  {/* Profile dropdown */}
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        <span className="sr-only">Open user menu</span>
                        <img
                          className="h-8 w-8 rounded-full"
                          src={user.imageUrl}
                          alt=""
                        />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {userNavigation.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) => (
                              <a
                                href={item.href}
                                className={classNames(
                                  active ? "bg-gray-100" : "",
                                  "block px-4 py-2 text-sm text-gray-700"
                                )}
                              >
                                {item.name}
                              </a>
                            )}
                          </Menu.Item>
                        ))}
                        <Menu.Item key="signOut">
                          {({ active }) => (
                            <a
                              href="#"
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                              onClick={(e) => {
                                e.preventDefault();
                                submit(null, {
                                  action: "/signout",
                                  method: "post",
                                });
                              }}
                            >
                              Sign out
                            </a>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
                <div className="-mr-2 flex items-center sm:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 pt-2 pb-3">
                {navigation.map((item) => (
                  <Disclosure.Button key={item.name} as={Fragment}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        classNames(
                          isActive
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800",
                          "block border-l-4 py-2 pl-3 pr-4 text-base font-medium"
                        )
                      }
                    >
                      {item.name}
                    </NavLink>
                  </Disclosure.Button>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={user.imageUrl}
                      alt=""
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {user.name}
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      {user.email}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-3 space-y-1">
                  {userNavigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                  <Disclosure.Button key="signOut" as={Fragment}>
                    <a
                      href="#"
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                      onClick={(e) => {
                        e.preventDefault();
                        submit(null, {
                          action: "/signout",
                          method: "post",
                        });
                      }}
                    >
                      Sign out
                    </a>
                  </Disclosure.Button>
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      {children}
    </div>
  );
}

export default function RouteComponent() {
  return (
    // No px-4 since mobile needs tables going to the edge.
    // No sm:px-6 lg:px-8. Let header and main specify
    <Layout>
      <div className="mx-auto max-w-7xl">
        <Outlet />
      </div>
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
