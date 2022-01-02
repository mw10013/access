import * as React from "react";
import type { ActionFunction, LoaderFunction } from "remix";
import { useActionData, useLoaderData, Form, json, redirect } from "remix";
import type { AccessPoint } from "@prisma/client";
import { db } from "~/utils/db.server";

type LoaderData = { accessPoint: AccessPoint };

export const loader: LoaderFunction = async ({ params: { id } }) => {
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

function validateCode(code: string) {
  if (code.length > 0) {
    if (!/^\d+$/.test(code)) {
      return "Code must contain only digits.";
    }
    if (code.length < 3) {
      return "Code must have at least 3 digits";
    }
    if (code.length > 8) {
      return "Code must have no more than 8 digits.";
    }
  }
}

function validateAccessCheckPolicy(accessCheckPolicy: string) {
  if (
    !["cloud-first", "cloud-only", "point-only"].some(
      (el) => el === accessCheckPolicy
    )
  ) {
    return "Access check policy must be cloud-first, cloud-only, or point-only.";
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    code: string | undefined;
    accessCheckPolicy: string | undefined;
  };
  fields?: {
    code: string;
    accessCheckPolicy: string;
  };
};

export const action: ActionFunction = async ({ request, params: { id } }) => {
  const form = await request.formData();
  const code = form.get("code") ?? "";
  const accessCheckPolicy = form.get("accessCheckPolicy");
  if (typeof code !== "string" || typeof accessCheckPolicy !== "string") {
    return { formError: `Form not submitted correctly.` };
  }

  const fieldErrors = {
    code: validateCode(code),
    accessCheckPolicy: validateAccessCheckPolicy(accessCheckPolicy),
  };
  const fields = { code, accessCheckPolicy };
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
    data: { code, accessCheckPolicy },
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
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700"
                >
                  Code
                </label>

                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="code"
                    id="code"
                    defaultValue={
                      actionData ? actionData?.fields?.code : accessPoint.code
                    }
                    className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                  />
                </div>
                {actionData?.fieldErrors?.code ? (
                  <p
                    className="mt-2 text-sm text-red-600"
                    role="alert"
                    id="code-error"
                  >
                    {actionData.fieldErrors.code}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="pt-8">
            <div className="mt-6-">
              <fieldset className="mt-6-">
                <div>
                  <legend className="text-base font-medium text-gray-900">
                    Access Check Policy
                  </legend>
                  <p className="text-sm text-gray-500"></p>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center">
                    <input
                      id="acpCloudFirst"
                      name="accessCheckPolicy"
                      value="cloud-first"
                      type="radio"
                      defaultChecked={
                        accessPoint.accessCheckPolicy === "cloud-first"
                      }
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <label
                      htmlFor="acpCloudFirst"
                      className="ml-3 block text-sm font-medium text-gray-700"
                    >
                      Cloud First
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="acpCloudOnly"
                      name="accessCheckPolicy"
                      value="cloud-only"
                      type="radio"
                      defaultChecked={
                        accessPoint.accessCheckPolicy === "cloud-only"
                      }
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <label
                      htmlFor="acpCloudOnly"
                      className="ml-3 block text-sm font-medium text-gray-700"
                    >
                      Cloud Only
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="acpPointOnly"
                      name="accessCheckPolicy"
                      value="point-only"
                      type="radio"
                      defaultChecked={
                        accessPoint.accessCheckPolicy === "point-only"
                      }
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <label
                      htmlFor="acpPointOnly"
                      className="ml-3 block text-sm font-medium text-gray-700"
                    >
                      Point Only
                    </label>
                  </div>
                </div>
              </fieldset>
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
