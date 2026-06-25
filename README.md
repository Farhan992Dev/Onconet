# OncoNet

**همراه شما در مسیر آگاهی و درمان** — *With you on the path of awareness and treatment*

OncoNet is a digital health platform focused on cancer awareness, early guidance, and patient support. It combines a public website, a user health portal, and an admin panel for content and platform management.

## Overview

The platform serves three audiences:

- **Public visitors** — educational articles, risk tools, and contact resources without registration
- **Registered users** — health profiles, self-check logs, and personalized reminders
- **Admin staff** — articles, SEO, messages, users, roles, and in-panel notifications

See [features/README.md](features/README.md) for the full feature list and specifications.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend API | ASP.NET Core 8 (.NET 8) |
| Database | MySQL (Entity Framework Core + Pomelo) |
| Cache | Redis (OTP and session caching) |
| Auth | JWT Bearer tokens |
| SMS | Kavenegar |
| Go service | Go 1.25 (early-stage API scaffold in `go/`) |

## Project Structure

```
Onconet/
├── front/              # Next.js web app (public site, user panel, admin panel)
├── backend_dotnet/     # ASP.NET Core REST API
├── go/                 # Go API scaffold (work in progress)
├── features/           # Feature specs and implementation guides
├── Documents/          # Project instructions, design, and technical docs
├── logo/               # Brand assets
└── Financial/          # Project financial documents
```

## Prerequisites

- **Node.js** 18+ (for the frontend)
- **.NET SDK** 8.0 (for the backend)
- **MySQL** 8+
- **Redis** (for OTP caching)
- **Go** 1.25+ (optional, only if working on `go/`)

## Getting Started

### Backend (.NET)

1. Configure local settings in `backend_dotnet/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "server=localhost;port=3306;database=onconet;user=root;password=YOUR_PASSWORD;",
    "RedisConnection": "localhost:6379"
  },
  "JwtSettings": {
    "Secret": "YourSecretKeyAtLeast32CharactersLong!",
    "Issuer": "onconet",
    "Audience": "PortalClients"
  }
}
```

2. Apply database migrations:

```bash
cd backend_dotnet
dotnet ef database update
```

3. Run the API:

```bash
dotnet run
```

In Development, Swagger is available at `/swagger` (see `Properties/launchSettings.json` for the local URL).

### Frontend (Next.js)

1. Install dependencies:

```bash
cd front
npm install
```

2. Create `front/.env.local`:

```env
BACKEND_URL=http://localhost:60848
```

Adjust the port to match your backend launch profile.

3. Start the dev server:

```bash
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000). API requests to `/api/*` are proxied to the backend via Next.js rewrites.

**Production build:**

```bash
npm run build
npm start
```

### Go API (optional)

The Go service in `go/` is a scaffold and not yet wired into the main application flow.

```bash
cd go
go run ./cmd/api
```

## Main Routes

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/articles` | Articles and journal |
| `/calculator` | Risk calculator |
| `/about` | About page |
| `/contact` | Contact form |
| `/user` | User panel |
| `/admin` | Admin panel |

## API Overview

The .NET backend exposes REST endpoints under `/api`, including:

- `AuthController` — OTP and password login
- `ArticlesController` — public and admin article management
- `PatientController` — user profile and self-check logs
- `MessagesController` — contact form and admin inbox
- `SeoController` — page SEO settings
- `AdminUsersController` / `AdminRolesController` — staff and permissions

Use Swagger in Development for the full API reference.

## Documentation

| Document | Description |
|----------|-------------|
| [Documents/INSTRUCTIONS.md](Documents/INSTRUCTIONS.md) | System overview and implementation guide |
| [features/README.md](features/README.md) | Feature inventory and development order |
| [Documents/Technical/Technical.md](Documents/Technical/Technical.md) | Technical conventions |
| [Documents/design/DESIGN.md](Documents/design/DESIGN.md) | Design guidelines |

## Development Notes

- Keep secrets and local config out of git. Use `appsettings.Development.json` and `front/.env.local` (both are gitignored).
- The frontend uses standalone Next.js output for deployment.
- Admin actions should enforce role-based policies on the backend.
- API inputs use DTOs, not database models directly.

## License

Proprietary — Salman & Ali (50/50 ownership).
