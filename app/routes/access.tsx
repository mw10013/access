import { Link, Outlet } from "remix";

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
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
