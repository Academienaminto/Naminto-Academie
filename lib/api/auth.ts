// Appels API centralisés pour le domaine auth — STACK TECHNIQUE §19.
// N'appelle jamais fetch("/api/...") directement depuis un composant.

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

async function post<T>(path: string, body?: unknown): Promise<ApiResult<T>> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export function registerRequest(input: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}) {
  return post("/api/v1/auth/register", input);
}

export interface PublicUser {
  id: string;
  email: string;
  phone: string | null;
  language: string;
  status: string;
  accountStatus: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  isSeuil: boolean;
}

export function loginRequest(input: { email: string; password: string }) {
  return post<PublicUser>("/api/v1/auth/login", input);
}

export function logoutRequest() {
  return post("/api/v1/auth/logout");
}

export function deleteOwnAccountRequest() {
  return post<{ status: string }>("/api/v1/account/delete");
}

export function restoreOwnAccountRequest(input: { email: string; password: string }) {
  return post<{ status: string }>("/api/v1/account/restore", input);
}

export function verifyEmailRequest(token: string) {
  return post<PublicUser>("/api/v1/auth/verify-email", { token });
}

export function resendVerificationRequest(email: string) {
  return post<{ sent: boolean }>("/api/v1/auth/resend-verification", { email });
}

export function forgotPasswordRequest(email: string) {
  return post<{ sent: boolean }>("/api/v1/auth/forgot-password", { email });
}

export function resetPasswordRequest(input: { token: string; password: string }) {
  return post<PublicUser>("/api/v1/auth/reset-password", input);
}
