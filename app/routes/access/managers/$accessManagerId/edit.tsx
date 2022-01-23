import { ActionFunction, Link, LoaderFunction, useNavigate } from "remix";
import { useActionData, useLoaderData, Form, useSubmit, redirect } from "remix";
import type { AccessManager } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import type { ZodError } from "zod";
import { z } from "zod";
import { ChevronRightIcon, PlusIcon } from "@heroicons/react/solid";
import { RadioGroup } from "@headlessui/react";

const team = [
  {
    name: "Calvin Hawkins",
    email: "calvin.hawkins@example.com",
    imageUrl:
      "https://images.unsplash.com/photo-1513910367299-bce8d8a0ebf6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Bessie Richards",
    email: "bessie.richards@example.com",
    imageUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Floyd Black",
    email: "floyd.black@example.com",
    imageUrl:
      "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
];

const settings = [
  {
    name: "Public access",
    description: "This project would be available to anyone who has the link",
  },
  {
    name: "Private to Project Members",
    description: "Only members of this project would be able to access",
  },
  {
    name: "Private to you",
    description: "You are the only one able to access this project",
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

type LoaderData = { accessManager: AccessManager };

export const loader: LoaderFunction = async ({
  request,
  params: { accessManagerId },
}): Promise<LoaderData> => {
  const userId = await requireUserId(request);

  const accessManager = await db.accessManager.findFirst({
    where: { id: Number(accessManagerId), user: { id: Number(userId) } },
    rejectOnNotFound: true,
  });
  return { accessManager };
};

const FieldValues = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(100),
});
type FieldValues = z.infer<typeof FieldValues>;

type ActionData = {
  formErrors?: ZodError["formErrors"];
  fieldValues?: any;
};

export const action: ActionFunction = async ({
  request,
  params: { accessManagerId },
}): Promise<Response | ActionData> => {
  // Node FormData get() seems to return null for empty string value.
  // Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(await request.formData());
  const parseResult = FieldValues.safeParse(fieldValues);
  if (!parseResult.success) {
    return { formErrors: parseResult.error.formErrors, fieldValues };
  }

  const userId = await requireUserId(request);
  await db.accessManager.findFirst({
    where: { id: Number(accessManagerId), user: { id: Number(userId) } },
    rejectOnNotFound: true,
  });
  const { name, description } = parseResult.data;
  await db.accessManager.update({
    where: { id: Number(accessManagerId) },
    data: { name, description },
  });

  return redirect(`/access/managers/${accessManagerId}`);
};

export default function RouteComponent() {
  const { accessManager } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigate = useNavigate();
  return (
    <>
      <header className="p-8">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="flex-1 min-w-0">
            <nav className="flex" aria-label="Breadcrumb">
              <ol role="list" className="flex items-center space-x-4">
                <li>
                  <div className="flex">
                    <Link
                      to="./../.."
                      className="text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      Managers
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <ChevronRightIcon
                      className="flex-shrink-0 h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                    <Link
                      to="./.."
                      className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      Access Manager
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <ChevronRightIcon
                      className="flex-shrink-0 h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                    <Link
                      to="."
                      className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      Edit
                    </Link>
                  </div>
                </li>
              </ol>
            </nav>
            {/* <h2 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {accessManager.name}
            </h2> */}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto pb-12 px-4 lg:pb-16">
        <Form replace method="post">
          <div className="space-y-6">
            <div>
              <h1 className="text-lg leading-6 font-medium text-gray-900">
                Access Manager Settings
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {actionData?.formErrors?.formErrors.join(". ")}
              </p>
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="block w-full shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm border-gray-300 rounded-md"
                  defaultValue={
                    actionData?.fieldValues
                      ? actionData.fieldValues.name
                      : accessManager.name
                  }
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="block w-full shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm border border-gray-300 rounded-md"
                  defaultValue={
                    actionData?.fieldValues
                      ? actionData.fieldValues.description
                      : accessManager.description
                  }
                />
              </div>
              {actionData?.formErrors?.fieldErrors?.description ? (
                <p
                  className="mt-2 text-sm text-red-600"
                  role="alert"
                  id="description-error"
                >
                  {actionData.formErrors.fieldErrors.description.join(". ")}
                </p>
              ) : null}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              >
                Save
              </button>
            </div>
          </div>
        </Form>
      </main>
    </>
  );
}
