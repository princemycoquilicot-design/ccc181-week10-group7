// Part 2 (Member 3): the ONLY place that talks to the CampusConnect API.
// Components call login() and getMe() instead of calling fetch directly.

// The address comes from the project-root .env file (VITE_API_URL).
const API_URL: string | undefined = import.meta.env.VITE_API_URL;

const TOKEN_KEY = 'campusconnect_token';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface LoginResult {
  token: string;
  user: User;
}

// rejected = the API said no (400 or 401)
// network  = we could not reach the server at all
// server   = the API answered with a 5xx or with something unreadable
export type ApiErrorKind = 'rejected' | 'network' | 'server';

export class ApiError extends Error {
  kind: ApiErrorKind;

  constructor(kind: ApiErrorKind) {
    super(kind);
    this.kind = kind;
  }
}

// ---- Token (sessionStorage only: never in the URL, the code or the console)

export function saveToken(token: string): void {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Storage blocked: the user simply will not stay logged in on refresh.
  }
}

export function getToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing to delete.
  }
}

// ---- Helpers

// fetch() only throws when the network fails (server stopped, wrong address).
async function request(path: string, init?: RequestInit): Promise<Response> {
  if (!API_URL) {
    throw new ApiError('network');
  }
  try {
    return await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new ApiError('network');
  }
}

// A 200 reply that is not valid JSON is a server problem, not a success.
async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new ApiError('server');
  }
}

function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false;
  const user = value as Record<string, unknown>;
  return (
    typeof user.id === 'number' &&
    typeof user.name === 'string' &&
    typeof user.email === 'string'
  );
}

// ---- API functions

// POST /api/v1/sessions
export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  const response = await request('/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (response.status === 400 || response.status === 401) {
    throw new ApiError('rejected');
  }
  if (!response.ok) {
    throw new ApiError('server');
  }

  const body = (await readJson(response)) as Partial<LoginResult> | null;
  // Welcome screen only when the API really sent a token AND a user.
  if (!body || typeof body.token !== 'string' || !isUser(body.user)) {
    throw new ApiError('server');
  }
  return { token: body.token, user: body.user };
}

// GET /api/v1/users/me  (token goes in the Authorization header)
export async function getMe(token: string): Promise<User> {
  const response = await request('/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 400 || response.status === 401) {
    throw new ApiError('rejected');
  }
  if (!response.ok) {
    throw new ApiError('server');
  }

  const body = await readJson(response);
  if (!isUser(body)) {
    throw new ApiError('server');
  }
  return body;
}

// ---- Friendly messages (never show raw error text such as "Failed to fetch")

export function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.kind === 'rejected') return 'Wrong email or password.';
    if (error.kind === 'network') {
      return 'Cannot reach the server. Please try again.';
    }
  }
  return 'Something went wrong on our side. Please try again later.';
}
