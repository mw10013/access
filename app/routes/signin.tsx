import type { ActionFunction, LoaderFunction } from "remix";
import { useActionData, useLoaderData, Form, useSubmit, redirect } from "remix";
import type { AccessUser } from "@prisma/client";
import { db } from "~/utils/db.server";
import { signIn, createUserSession } from "~/utils/session.server";

function validateEmail(email: unknown) {
  if (typeof email !== "string" || email.length < 3) {
    return `Email must be at least 3 characters long`;
  }
}

function validatePassword(password: unknown) {
  if (typeof password !== "string" || password.length < 6) {
    return `Passwords must be at least 6 characters long`;
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: { email: string | undefined; password: string | undefined };
  fieldValues?: { email: string; password: string };
};

export const action: ActionFunction = async ({
  request,
}): Promise<Response | ActionData> => {
  const { email, password } = Object.fromEntries(await request.formData());
  if (typeof email !== "string" || typeof password !== "string") {
    return { formError: `Form not submitted correctly.` };
  }

  const fieldValues = { email, password };
  const fieldErrors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (Object.values(fieldErrors).some(Boolean))
    return { fieldErrors, fieldValues };

  const user = await signIn({ email, password });
  if (!user) {
    return {
      fieldValues,
      formError: `Email/Password combination is incorrect`,
    };
  }
  return createUserSession(user.id.toString(), "/access/dashboard");
};

export default function SignIn() {
  const actionData = useActionData<ActionData>();
  return (
    <>
      <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img
            className="mx-auto h-12 w-auto"
            src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
            alt="Workflow"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <a
              href="#"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              start your 14-day free trial
            </a>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <Form replace method="post" className="space-y-6">
              {actionData?.formError ? (
                <div className="-mt-11 grid place-content-center">
                  <p
                    className="text-sm text-red-600"
                    role="alert"
                    id="form-error"
                  >
                    {actionData.formError}
                  </p>
                </div>
              ) : null}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    // autoComplete="email"
                    // required
                    defaultValue={actionData?.fieldValues?.email}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                {actionData?.fieldErrors?.email ? (
                  <p
                    className="mt-2 text-sm text-red-600"
                    role="alert"
                    id="email-error"
                  >
                    {actionData.fieldErrors.email}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    // autoComplete="current-password"
                    // required
                    defaultValue={actionData?.fieldValues?.password}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                {actionData?.fieldErrors?.password ? (
                  <p
                    className="mt-2 text-sm text-red-600"
                    role="alert"
                    id="password-error"
                  >
                    {actionData.fieldErrors.password}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign in
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
