import { Prisma } from "@prisma/client";
import {
  ActionFunction,
  LoaderFunction,
  redirect,
  useActionData,
  useLocation,
} from "remix";
import { db } from "~/utils/db.server";
import {
  comparePasswordResetTokenAndHash,
  hashPassword,
} from "~/utils/session.server";
import { Main, SettingsForm, SettingsFormField } from "~/components/lib";
import { z, ZodError } from "zod";

const SearchParams = z
  .object({
    email: z.string().min(1).email(),
    token: z.string().min(32),
  })
  .strict();
type SearchParams = z.infer<typeof SearchParams>;

async function validateSearchParams(request: Request) {
  const url = new URL(request.url);
  const parseResult = SearchParams.safeParse(
    Object.fromEntries(url.searchParams)
  );
  if (!parseResult.success) {
    console.error({ resetPassword: parseResult.error });
    throw new Response("Invalid reset password link.", { status: 400 });
  }
  const user = await db.user.findUnique({
    where: {
      email: parseResult.data.email,
    },
    rejectOnNotFound: true,
  });
  if (
    !user.resetPasswordHash ||
    !user.resetPasswordExpireAt ||
    user.resetPasswordExpireAt.getTime() < Date.now() ||
    !(await comparePasswordResetTokenAndHash(
      parseResult.data.token,
      user.resetPasswordHash
    ))
  ) {
    throw new Response("Invalid or expired password reset.", { status: 400 });
  }
  return { user };
}

type LoaderData = Awaited<ReturnType<typeof validateSearchParams>>;

export const loader: LoaderFunction = async ({
  request,
}): Promise<LoaderData> => {
  return await validateSearchParams(request);
};

const FieldValues = z
  .object({
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
  const { user } = await validateSearchParams(request);
  // WARNING: Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(await request.formData());
  const parseResult = FieldValues.safeParse(fieldValues);
  if (!parseResult.success) {
    return { formErrors: parseResult.error.formErrors, fieldValues };
  }
  await db.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(parseResult.data.password),
      resetPasswordHash: null,
      resetPasswordExpireAt: null,
    },
  });
  return redirect(`/signin`);
};

export default function RouteComponent() {
  const actionData = useActionData<ActionData>();
  const location = useLocation();

  return (
    <Main>
      <div className="mt-8">
        <SettingsForm
          replace
          action={`${location.pathname}${location.search}`}
          method="post"
          title="Reset Password"
          formErrors={actionData?.formErrors?.formErrors}
        >
          <SettingsFormField
            id="password"
            label="Password"
            errors={actionData?.formErrors?.fieldErrors?.password}
          >
            <input
              type="password"
              name="password"
              id="password"
              defaultValue={
                actionData?.fieldValues ? actionData.fieldValues.password : ""
              }
            />
          </SettingsFormField>
        </SettingsForm>
      </div>
    </Main>
  );
}
