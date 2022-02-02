import bcrypt from "bcrypt";
import { createCookieSessionStorage, redirect } from "remix";
import { z } from "zod";
import { db } from "./db.server";
import * as crypto from "crypto";

const BCRYPT_ROUNDS = 10;

type SignInForm = {
  email: string;
  password: string;
};

export async function register({ email, password }: SignInForm) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  return db.user.create({
    data: { email, passwordHash, role: "customer" },
  });
}

export async function signIn({ email, password }: SignInForm) {
  // await bcrypt.hash(password, 10)
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return null;

  const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isCorrectPassword) return null;
  return user;
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "AC_session",
      secure: true,
      secrets: [sessionSecret],
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
    },
  });

export function getUserSession(request: Request) {
  return getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (typeof userId !== "number") return null;
  return userId;
}

export async function requireUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (typeof userId !== "number") throw redirect("/signin");
  return userId;
}

const SessionData = z
  .object({
    userId: z.number(),
    email: z.string().min(1),
    role: z.string().min(1),
  })
  .strict();
type SessionData = z.infer<typeof SessionData>;

export async function requireUserSession(
  request: Request,
  role: "customer" | "admin"
) {
  const session = await getUserSession(request);
  const parseResult = SessionData.safeParse(session.data);
  if (!parseResult.success) {
    console.error(parseResult.error);
    throw redirect("/signin");
  }
  if (parseResult.data.role !== role) {
    throw new Response("Unauthorized access.", { status: 401 });
  }
  return parseResult.data;
}

export async function signOut(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/", {
    headers: { "Set-Cookie": await destroySession(session) },
  });
}

export async function createUserSession(
  userId: number,
  email: string,
  role: string,
  redirectTo: string
) {
  const session = await getSession();
  session.set("userId", userId);
  session.set("email", email);
  session.set("role", role);
  return redirect(redirectTo, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export async function generatePasswordResetTokenAndHash() {
  const token = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(token, BCRYPT_ROUNDS);
  return { token, hash };
}

export async function comparePasswordResetTokenAndHash(
  token: string,
  hash: string
) {
  return await bcrypt.compare(token, hash);
}
