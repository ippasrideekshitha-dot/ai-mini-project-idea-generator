# AI Mini Project Idea Generator — IdeaSpark

IdeaSpark is a beginner-friendly full-stack web application that helps B.Tech students discover mini-project ideas based on domain, difficulty, preferred technology, and a keyword. Students can create an account and save a private shortlist.

> **Important honesty note:** The project name says “AI”, but the core generator uses a transparent, local rule-based scoring system. It does not call an AI model or any external API. This keeps the project free to run and easy to explain in a first-year demonstration. It is an idea recommendation tool, not a generative AI model.

## 1. Problem and objectives

Students often struggle to choose a mini project that matches their current skills and available time. IdeaSpark makes discovery easier by:
- recommending practical ideas by domain, skill level, technology, and keyword;
- showing a short implementation plan for each idea;
- letting each signed-in user save and remove ideas from a personal shortlist;
- demonstrating HTML/CSS/JavaScript, Express REST APIs, authentication, validation, and PostgreSQL persistence.

## 2. Users and features

There is one role: a registered student. Users can register, log in, generate/filter ideas, view suggested implementation steps, save ideas, list their saved ideas, and remove their own saved ideas. Each user can only view and delete their own saved records.

No administrator role is needed for this MVP.

## 3. Technology stack

- HTML5, CSS3, vanilla browser JavaScript
- Node.js 20+ and Express 5
- Supabase PostgreSQL
- npm packages: `@supabase/supabase-js` (database client), `bcryptjs` (password hashing), `jsonwebtoken` (signed login token), `express-validator` (request validation), `dotenv` (local configuration), `helmet` (security headers), and `express-rate-limit` (request rate limiting).

The app does not require a paid plan, external AI API, frontend framework, or remote image assets. Google Fonts is an optional visual enhancement; the page has fallback fonts.

## 4. Folder structure

```text
ai-mini-project-idea-generator/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── ideas.js
│   ├── server.js
│   ├── supabase.js
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   └── .gitignore
├── database/
│   └── schema.sql
├── .gitignore
└── README.md
```

`package-lock.json` is created when you run `npm install`. It should be committed to Git once generated. `backend/.env` is a local-only template and must never be committed.

## 5. Prerequisites

Install:
- Visual Studio Code: https://code.visualstudio.com/
- Node.js LTS (npm is included): https://nodejs.org/
- Git: https://git-scm.com/downloads
- A free Supabase account: https://supabase.com/

Verify installations in a new terminal:
```bash
node --version
npm --version
git --version
```
Use Node.js 20 or newer.

## 6. Set up Supabase

1. Sign in to Supabase and create a new project.
2. Choose a project name and a strong database password; store the password securely.
3. Wait until the database finishes provisioning.
4. Open **SQL Editor** in the Supabase dashboard.
5. Open `database/schema.sql` in VS Code, copy the entire file, paste it into a new SQL Editor query, and click **Run**.
6. In **Table Editor**, confirm `app_users` and `saved_ideas` exist.
7. Open **Project Settings → API** (the exact menu wording may change). Copy the project URL and the server-side service role/secret key. Use the service-role key only on your local backend. Never put it in `frontend/app.js`, HTML, GitHub, or screenshots.

This implementation uses a custom account table and a signed server-side JWT, not Supabase Auth. The backend hashes passwords with bcrypt and checks record ownership on every saved-idea request. RLS is enabled with no browser policies because the browser never connects to Supabase directly; Express uses the privileged server key and must keep its ownership checks. Do not create an endpoint that trusts a browser-provided user ID.

## 7. Environment configuration

Open `backend/.env`. Replace the placeholders:

```dotenv
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_REAL_SERVER_ONLY_KEY
JWT_SECRET=YOUR_RANDOM_SECRET_OF_AT_LEAST_32_CHARACTERS
```

- `SUPABASE_URL`: URL from your Supabase project.
- `SUPABASE_SERVICE_ROLE_KEY`: privileged server-side key. Never expose or commit it.
- `JWT_SECRET`: signs login tokens. Generate one from the **backend** directory using:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
  Copy the printed value into `.env`. Keep it private.
- `PORT`: local HTTP port.
- `NODE_ENV`: use `development` locally.

`.env.example` documents variable names and safe placeholders; `.env` contains your private local values. `.gitignore` excludes `.env`.

## 8. Install and run

Open the VS Code terminal in the project root, then:

```bash
cd backend
npm install
npm run check
npm start
```

Expected startup message:
```text
IdeaSpark is running at http://localhost:3000
```

Open http://localhost:3000. The browser frontend is served by Express from the `frontend/` directory. Keep the terminal running while you use the site. For development with automatic restart on supported Node versions, use `npm run dev`.

Check the API health endpoint at http://localhost:3000/api/health. Expected JSON:
```json
{"status":"ok","service":"IdeaSpark API"}
```

## 9. Architecture and workflow

1. Browser HTML/CSS/JavaScript collects preferences and renders ideas.
2. The local rule-based catalogue ranks ideas; no external AI service is called.
3. `fetch()` sends account and saved-idea requests to Express.
4. Express validates request data and verifies the JWT on private routes.
5. The Supabase client writes/reads PostgreSQL records.
6. Every saved-idea query is scoped to the authenticated user's ID.

The browser keeps the short-lived token in `sessionStorage`, which is cleared when the tab session ends. This is a simple educational trade-off; for production, consider secure HttpOnly cookies, CSRF protection, email verification, password reset, and a more complete account lifecycle.

## 10. REST API

All responses are JSON. Private routes require `Authorization: Bearer <token>`.

| Method | Path | Purpose | Body / access | Success |
|---|---|---|---|---|
| GET | `/api/health` | Check server | Public | `200 {status, service}` |
| POST | `/api/auth/register` | Create account | `{name,email,password}`; public | `201 {token,user}` |
| POST | `/api/auth/login` | Sign in | `{email,password}`; public | `200 {token,user}` |
| GET | `/api/auth/me` | Get current account | Bearer token | `200 {user}` |
| GET | `/api/ideas` | List current user's saved ideas | Bearer token | `200 {ideas: []}` |
| POST | `/api/ideas` | Save an idea | Bearer token; title, description, domain, difficulty, technologies, steps, optional catalogId | `201 {idea}` |
| DELETE | `/api/ideas/:id` | Remove a saved idea | Bearer token; UUID path parameter | `200 {message}` |

Common errors: `400` invalid fields, `401` missing/invalid login, `409` duplicate email or saved catalogue idea, `404` missing saved idea/API route, `413` request too large, `429` rate limit, `500` server/database failure. The server logs a brief diagnostic; raw database errors are not returned to the browser.

## 11. Try the app

1. Select **Create account** and enter a name, email, and password of at least 8 characters.
2. Select a domain and difficulty; optionally choose a technology and enter a keyword.
3. Click **Generate ideas**.
4. Click **View plan** to see the steps in a message, or **Save idea** to add it to your shortlist.
5. Remove an item from the shortlist and confirm the action.
6. Log out and log back in. Saved ideas should still be present because they are stored in PostgreSQL.

## 12. Testing checklist

- `/api/health` returns status `ok`.
- Registration with valid data creates an account and returns a token.
- Registration with the same email returns `409`.
- Invalid email or short password returns `400`.
- Wrong login credentials return `401`.
- Authenticated user can save and list an idea.
- Saving the same catalogue idea twice returns `409`.
- Missing/invalid token cannot list, save, or delete ideas.
- User A cannot see or delete User B's saved ideas.
- Invalid idea UUID returns `400`; deleting a nonexistent/non-owned record returns `404`.
- Refresh the browser or log out/in; saved ideas persist in the database.
- Test mobile, tablet, and desktop widths.
- Stop Supabase connectivity or use invalid credentials in a local test environment; the UI should show a friendly failure and the server terminal should contain diagnostic context.

Syntax check:
```bash
cd backend
npm run check
```
This checks JavaScript syntax only. It does not prove that your Supabase project or browser setup is working.

## 13. Troubleshooting

- **Server says environment variables are missing:** verify `backend/.env` exists and contains real values; restart the server after edits.
- **Supabase `Invalid API key` / `401`:** copy the correct project URL and server-only key from the same Supabase project.
- **Relation/table not found:** run `database/schema.sql` in the correct Supabase project.
- **Port already in use:** change `PORT=3001` and visit `http://localhost:3001`.
- **`npm` or `node` not recognised:** install Node.js LTS and restart the terminal.
- **Cannot log in after changing JWT secret:** existing tokens are invalid; log in again.
- **Styles/scripts missing:** open the app through `http://localhost:3000`, not by double-clicking `index.html`.
- **Database request fails:** check Supabase project status, schema, and server terminal logs. Never paste credentials into a public issue.

## 14. Security notes and limitations

This is an educational MVP, not a production account system. It includes bcrypt password hashing, JWT expiry, input validation, security headers, rate limiting, database constraints, and server-side ownership checks. The Supabase service role bypasses RLS, so backend authorization is essential. The token is kept in `sessionStorage`, which can be exposed by a successful XSS attack; avoid injecting untrusted HTML and do not reuse this exact design for sensitive production data. Add HTTPS, secure HttpOnly cookies, CSRF protections where applicable, email verification, password reset, monitoring, and a reviewed account recovery design before production use.

The idea catalogue is static and rule-based. Ideas are not generated by a trained AI model. Future improvements could include a larger editable catalogue, a project detail page, export to PDF, tags, and optional AI integration if a teacher approves an API and its cost/privacy trade-offs.

## 15. GitHub upload

From the project root:
```bash
git init
git status
git add .
git status
git commit -m "Build AI Mini Project Idea Generator"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```
Replace the URL with your repository URL. Create an empty repository on https://github.com/ first. Before `git add .`, confirm `backend/.env` and `node_modules/` are ignored, and `backend/.env.example` is included. Never commit passwords, service-role keys, database exports, or private user data. If a secret was committed, `.gitignore` alone is not enough: rotate it immediately and remove it from repository history.

## 16. Final checklist

- [ ] Supabase tables `app_users` and `saved_ideas` exist.
- [ ] `backend/.env` has valid local credentials and is not committed.
- [ ] `npm install` and `npm run check` succeed.
- [ ] `/api/health` responds.
- [ ] Registration and login work.
- [ ] Ideas can be generated, saved, listed, and removed.
- [ ] Saved ideas persist after logout/login.
- [ ] Ownership checks prevent cross-user access.
- [ ] README and source code are in sync.
