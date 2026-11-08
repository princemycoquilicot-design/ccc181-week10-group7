# CampusConnect API Specification

Base address (development): `http://localhost:3000/api/v1`
Data format: JSON. Authentication: a token sent in the `Authorization` header.

## Endpoints

| Method | Endpoint | Purpose | Success | Errors |
|--------|----------|---------|---------|--------|
| GET | `/api/v1/health` | Checks that the API is running. | 200 OK | none |
| POST | `/api/v1/sessions` | Logs in. A session is the thing created when you log in. | 200 OK | 400, 401 |
| GET | `/api/v1/users/me` | Returns the logged-in user. Needs a token. | 200 OK | 401 |

Any other address returns `404` with `{ "error": "Not found." }`.
An unexpected server problem returns `500` with `{ "error": "Something went wrong." }`.

## GET /api/v1/health

**Response 200 OK**
```json
{ "status": "ok" }
```

## POST /api/v1/sessions

**Request body (JSON)**
```json
{ "email": "student@campusconnect.test", "password": "Campus26" }
```

**Response 200 OK** (login succeeded)
```json
{
  "token": "<a long token text>",
  "user": { "id": 1, "name": "Demo Student", "email": "student@campusconnect.test" }
}
```

**Response 400 Bad Request** (email or password missing, not text, or the email is badly formed)
```json
{ "error": "Email and password are required." }
```

**Response 401 Not logged in** (wrong password OR unknown email; the same message for both)
```json
{ "error": "Invalid email or password." }
```

The message is the same for both cases on purpose. A different message would let
an attacker find out which emails exist.

The token expires after 1 hour.

## GET /api/v1/users/me

**Request header**
```
Authorization: Bearer <token>
```

**Response 200 OK**
```json
{ "id": 1, "name": "Demo Student", "email": "student@campusconnect.test" }
```

**Response 401 Not logged in** (token missing, wrong, or expired)
```json
{ "error": "Not logged in." }
```

## Demo account

| Email | Password | Name |
|-------|----------|------|
| student@campusconnect.test | Campus26 | Demo Student |

Passwords are stored hashed with bcrypt. The password and its hash are never sent in any response.

## Status codes used

| Code | Meaning | Used when |
|------|---------|-----------|
| 200 | OK | Health check passed, login succeeded, or the user was returned |
| 400 | Bad Request | Email or password is missing or badly formed |
| 401 | Not logged in | Wrong login, or a missing, wrong or expired token |
| 404 | Not Found | The address does not exist |
| 500 | Internal Server Error | The server crashed while handling the request |

---

## Events (design only)

This section is a design on paper. It is not built. It follows the Week 12 rules:
plural nouns, no verbs in the address, the method is the verb, filters in the query
string, and the API is versioned.

| Method | Endpoint | What it does | Success | Errors |
|--------|----------|--------------|---------|--------|
| GET | `/api/v1/events` | List all events | 200 OK | none |
| GET | `/api/v1/events?month=11` | List only the events in November | 200 OK | 400 if `month` is not 1 to 12 |
| GET | `/api/v1/events/12` | Get one event | 200 OK | 404 if it does not exist |
| POST | `/api/v1/events` | Add a new event | 201 Created | 400 if a required field is missing, 401 if not logged in |
| PATCH | `/api/v1/events/12` | Change only some fields of event 12 | 200 OK | 400, 401, 404 |
| DELETE | `/api/v1/events/12` | Remove event 12 | 204 No Content | 401, 404 |

**Example event (JSON)**
```json
{
  "id": 12,
  "title": "CBIT Tech Talk",
  "date": "2026-11-20",
  "venue": "MSU-Naawan Auditorium",
  "organization": "CBIT"
}
```

**Example: POST /api/v1/events request body**
```json
{
  "title": "CBIT Tech Talk",
  "date": "2026-11-20",
  "venue": "MSU-Naawan Auditorium",
  "organization": "CBIT"
}
```

**Example: PATCH /api/v1/events/12 request body** (only the field that changes)
```json
{ "venue": "Gymnasium" }
```

Why these choices:
- `GET`, `POST`, `PATCH` and `DELETE` match Read, Create, Update and Delete.
- Adding, changing and deleting need a token, because they change data.
- A missing event returns 404, and a missing required field returns 400.
- The filter `?month=11` is a query string, not a new address like `/eventsInNovember`.
