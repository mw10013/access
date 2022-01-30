import type { ActionFunction } from "remix";
import { useActionData, Form } from "remix";
import { signIn, createUserSession } from "~/utils/session.server";
import { z, ZodError } from "zod";

const FieldValues = z
  .object({
    email: z.string().min(1).max(50).email(),
    password: z.string().min(6).max(100),
  })
  .strict();
type FieldValues = z.infer<typeof FieldValues>;

type ActionData = {
  formErrors?: ZodError["formErrors"];
  fieldValues?: any;
};

export const action: ActionFunction = async ({
  request,
}): Promise<Response | ActionData> => {
  // WARNING: Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(await request.formData());
  const parseResult = FieldValues.safeParse(fieldValues);
  if (!parseResult.success) {
    return { formErrors: parseResult.error.formErrors, fieldValues };
  }

  const { email, password } = parseResult.data;
  const user = await signIn({ email, password });
  if (!user) {
    return {
      fieldValues,
      formErrors: {
        formErrors: [`Email/Password combination is incorrect`],
        fieldErrors: {},
      },
    };
  }
  return createUserSession(user.id, user.email, user.role, "/access/dashboard");
};

type t = ReturnType<typeof signIn>;
type t2 = Awaited<ReturnType<typeof signIn>>;

export default function SignIn() {
  const actionData = useActionData<ActionData>();
  return (
    <>
      <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
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
              {actionData?.formErrors?.formErrors ? (
                <div className="grid place-content-center">
                  <p
                    className="text-sm text-red-600"
                    role="alert"
                    id="form-error"
                  >
                    {actionData.formErrors.formErrors.join(". ")}
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
                    autoComplete="email"
                    defaultValue={actionData?.fieldValues?.email}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                {actionData?.formErrors?.fieldErrors.email ? (
                  <p
                    className="mt-2 text-sm text-red-600"
                    role="alert"
                    id="email-error"
                  >
                    {actionData.formErrors.fieldErrors.email}
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
                    autoComplete="current-password"
                    defaultValue={actionData?.fieldValues?.password}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                {actionData?.formErrors?.fieldErrors?.password ? (
                  <p
                    className="mt-2 text-sm text-red-600"
                    role="alert"
                    id="password-error"
                  >
                    {actionData.formErrors.fieldErrors.password}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
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
                  className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
