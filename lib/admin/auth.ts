import "server-only";
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "thrift_admin_session";
const lifetimeSeconds = 12 * 60 * 60;

export function adminConfigured() {
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD_HASH && (process.env.ADMIN_SESSION_SECRET?.length || 0) >= 32);
}

export function verifyPassword(username: string, password: string) {
  const stored = process.env.ADMIN_PASSWORD_HASH || "";
  const [salt, expectedHex] = stored.split(":");
  if (!salt || !expectedHex || !/^[a-f0-9]{128}$/i.test(expectedHex)) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  const namesMatch = username === process.env.ADMIN_USERNAME;
  return timingSafeEqual(actual, expected) && namesMatch;
}

function signature(payload: string) {
  return createHmac("sha256", `${process.env.ADMIN_SESSION_SECRET}:${process.env.ADMIN_PASSWORD_HASH}`)
    .update(payload).digest("hex");
}

export async function isAdmin() {
  if (!adminConfigured()) return false;
  const value = (await cookies()).get(cookieName)?.value;
  if (!value) return false;
  const [username, expiryText, mac] = value.split(".");
  if (!username || !expiryText || !mac || username !== process.env.ADMIN_USERNAME) return false;
  const expiry = Number(expiryText);
  if (!Number.isSafeInteger(expiry) || expiry < Date.now()) return false;
  const expected = Buffer.from(signature(`${username}.${expiryText}`), "hex");
  const received = Buffer.from(mac, "hex");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function setAdminSession() {
  if (!adminConfigured()) throw new Error("Admin credentials are not configured.");
  const expiry = Date.now() + lifetimeSeconds * 1000;
  const payload = `${process.env.ADMIN_USERNAME}.${expiry}`;
  (await cookies()).set(cookieName, `${payload}.${signature(payload)}`, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: lifetimeSeconds,
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(cookieName);
}
