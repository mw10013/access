import { Link, Outlet, useSubmit } from "remix";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const navigation = [
  { name: "Dashboard", to: "dashboard", current: false },
  { name: "Users", to: "users", current: false },
  { name: "Locations", to: "locations", current: false },
  { name: "Managers", to: "managers", current: false },
  { name: "Access Points", to: "accessPoints", current: false },
];

export default function AccessRoute() {
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
                  <Link
                    key={item.name}
                    to={item.to}
                    className={classNames(
                      item.current
                        ? "border-indigo-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                      "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    )}
                    aria-current={item.current ? "page" : undefined}
                  >
                    {item.name}
                  </Link>
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
              {/* <a
                href="#"
                className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign up
              </a> */}
            </div>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
