import * as React from "react";
import type { ActionFunction, LoaderFunction } from "remix";
import { useActionData, useLoaderData, Form, json, redirect } from "remix";
import type { AccessPoint } from "@prisma/client";
import { db } from "~/utils/db.server";

type LoaderData = { accessPoint: AccessPoint };

export const loader: LoaderFunction = async ({
  params: { accessPointId: id },
}) => {
  const accessPoint =
    typeof id === "string" &&
    (await db.accessPoint.findUnique({
      where: { id: Number(id) },
    }));
  if (!accessPoint) {
    throw new Response("Access point not found.", {
      status: 404,
    });
  }
  const data: LoaderData = { accessPoint };
  return data;
};

function validateName(name: string) {
  if (name.length === 0) {
    return "Name is required.";
  }
  if (name.length > 100) {
    return "Name is too long.";
  }
}
function validateDescription(name: string) {
  if (name.length > 1000) {
    return "Description is too long.";
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name: string | undefined;
    description: string | undefined;
  };
  fields?: {
    name: string;
    description: string;
  };
};

export const action: ActionFunction = async ({
  request,
  params: { accessPointId: id },
}) => {
  const formData = await request.formData();
  // Node FormData get() seems to return null for empty string value.
  // Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(formData);
  const { name, description } = fieldValues;
  if (typeof name !== "string" || typeof description !== "string") {
    return { formError: `Form not submitted correctly.` };
  }

  const fieldErrors = {
    name: validateName(name),
    description: validateDescription(description),
  };
  const fields = { name };
  if (Object.values(fieldErrors).some(Boolean)) {
    return { fieldErrors, fields };
  }

  const accessPoint = await db.accessPoint.findUnique({
    where: { id: Number(id) },
  });
  if (!accessPoint) {
    throw new Response("Access point not found.", {
      status: 404,
    });
  }

  await db.accessPoint.update({
    where: { id: accessPoint.id },
    data: { name, description },
  });
  return redirect("..");
};

export default function EditSettingsRoute() {
  const { accessPoint } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold leading-7 text-gray-900">
        Edit Settings
      </h1>
      <Form
        reloadDocument
        replace
        method="post"
        className="space-y-8 divide-y divide-gray-200"
      >
        <div className="space-y-8 divide-y divide-gray-200">
          <div>
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {actionData?.formError}
              </h3>
              <p className="mt-1 text-sm text-gray-500"></p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>

                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    defaultValue={
                      actionData ? actionData?.fields?.name : accessPoint.name
                    }
                    className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                  />
                </div>
                {actionData?.fieldErrors?.name ? (
                  <p
                    className="mt-2 text-sm text-red-600"
                    role="alert"
                    id="name-error"
                  >
                    {actionData.fieldErrors.name}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>

                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="description"
                    id="description"
                    defaultValue={
                      actionData
                        ? actionData?.fields?.description
                        : accessPoint.description
                    }
                    className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                  />
                </div>
                {actionData?.fieldErrors?.description ? (
                  <p
                    className="mt-2 text-sm text-red-600"
                    role="alert"
                    id="description-error"
                  >
                    {actionData.fieldErrors.description}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            {/* <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button> */}
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
}
