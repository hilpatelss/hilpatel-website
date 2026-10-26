# Hil Patel — Full-Stack Portfolio & CMS

A complete, production-ready, full-stack portfolio website built with a **React 18** frontend and a **Django 5+ REST Framework** backend CMS.

Every important piece of portfolio content, narrative copy, project showcase, credential, and design setting is manageable through the **Django Admin CMS** without editing code.

---

## Architecture & Technology Stack

```
portfolio-project/
├── frontend/                     # React 18 + Vite Frontend Application
│   ├── src/
│   │   ├── components/           # Reusable UI components (Navbar, Footer, Graphics)
│   │   ├── sections/             # Modular portfolio sections (Hero, About, Projects, etc.)
│   │   ├── services/             # Centralized API client (api.js)
│   │   ├── hooks/                # Data fetching & CSS variable sync hook (usePortfolioData)
│   │   ├── styles/               # Design system stylesheet (styles.css)
│   │   ├── App.jsx               # Dynamic CMS-driven composition root
│   │   └── main.jsx              # React DOM mounting point
│   ├── public/                   # Static assets (favicons, placeholder resume PDF)
│   ├── .env.example              # Frontend environment template
│   └── package.json              # React dependencies & scripts
├── backend/                      # Django & Django REST Framework CMS
│   ├── config/                   # Core Django project configuration & settings
│   │   ├── settings.py           # Dev (SQLite) & Prod (PostgreSQL) configuration
│   │   ├── urls.py               # Root URL router & media file serving
│   │   ├── wsgi.py / asgi.py     # Production WSGI/ASGI gateways
│   ├── apps/
│   │   ├── core/                 # Abstract models, validators, seeder commands
│   │   ├── site_settings/        # Singleton SiteSettings & DesignSettings (CSS variables)
│   │   ├── portfolio/            # Skills, Education, Certifications, Ticker, Stats
│   │   ├── projects/             # Projects CRUD, Highlights, Categories, Media Gallery
│   │   └── contact/              # Secure contact submissions with honeypot & throttling
│   ├── tests/                    # Automated test suite (API, Contact, Permissions)
│   ├── manage.py                 # Django management CLI
│   ├── requirements.txt          # Python dependencies
│   └── .env.example              # Backend environment template
├── media/                        # User-uploaded thumbnails, screenshots, resumes, certificates
├── .gitignore
└── README.md
```

### Highlights
* **Zero Hardcoded Data as Truth:** Public endpoints provide live data directly from the Django database. If the backend is temporarily offline, safe fallback defaults preserve site uptime and appearance.
* **Live CMS Theme Editing:** Accent colors (`--accent`, `--accent2`), dark/light palettes, and fonts can be edited in Django Admin under **Design Settings** and update dynamically in React via CSS variables.
* **Flexible Project Visuals:** Supports both custom animated data charts (KPI bars, donut sparklines, billing charts) and uploaded thumbnail/screenshot galleries.
* **Spam-Protected Contact Form:** Built-in honeypot detection, IP rate limiting (`ScopedRateThrottle`), length validation, and safe admin email notifications.
* **Dual Database Support:** Instant zero-config SQLite for local development and standard PostgreSQL configuration via `DATABASE_URL` for production.

---

## Prerequisites

1. **Python:** 3.10, 3.11, 3.12, 3.13, or 3.15+
2. **Node.js:** 18+ or 20+ (with `npm`)
3. **Database:** SQLite (included with Python) or PostgreSQL (production)

---

## Quickstart Guide (Local Development)

### 1. Backend Setup

```bash
cd portfolio-project/backend

# 1. Create and activate a Python virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create your .env file
cp .env.example .env

# 4. Run database migrations
python manage.py migrate

# 5. Seed initial authentic portfolio data
python manage.py seed_portfolio

# 6. Create the initial Django Admin user (default: admin / admin12345)
python manage.py create_admin

# 7. Start the Django development server
python manage.py runserver
```
The Django API will be live at `http://127.0.0.1:8000/api/v1/` and Django Admin at `http://127.0.0.1:8000/admin/`.

---

### 2. Frontend Setup

```bash
cd portfolio-project/frontend

# 1. Install dependencies
npm install

# 2. Create your .env file
cp .env.example .env

# 3. Start the Vite React development server
npm run dev
```
Open `http://localhost:5173` in your browser. The frontend will automatically consume data from the Django API.

---

## Django Admin CMS Capabilities


### 1. Global Website & Hero Settings (`Site Global Settings`)
* **Identity:** Change owner name, professional headline, location, and contact email.
* **Hero Content:** Edit greeting (`Hi, I'm Hil.`), headlines (`I make data`, `make sense`), intro, and summary.
* **Buttons:** Configure button labels and links (e.g. download resume link or anchor).
* **Media:** Upload a PDF resume file to immediately serve direct downloads at `/api/v1/site-settings/`.
* **Social Links:** Update GitHub, LinkedIn, and external portfolio URLs.
* **Footer:** Edit copyright notice, tagline, and location.

### 2. Live Theme & Design Settings (`Design & Theme Settings`)
* Change the signature **Accent Color** (default `#c7ff5e`) and **Secondary Accent** (`#8de0b7`).
* Adjust Dark Mode and Light Mode backgrounds, surface colors, text colors, and line colors.
* Set main typography (`'Manrope', sans-serif`) and monospace font (`'DM Mono', monospace`).
* Changes immediately reflect on the frontend upon refresh without code changes.

### 3. Projects Management (`Projects`)
* Add, edit, reorder, publish, or hide projects.
* Select visual display type:
  * `Animated KPI & Bar Chart` (Digital Wellbeing style)
  * `Donut & Sparkline Chart` (BMI & Risk style)
  * `Billing Revenue Bar Chart` (Smart Bill style)
  * `Uploaded Screenshot / Thumbnail Image`
* Upload preview thumbnails and multiple screenshot gallery images.
* Assign categories (Power BI, Full-stack, Machine Learning) and technology tags.
* Add bullet-point highlight items.

### 4. Skills & Toolkit Management (`Skill Categories` & `Skills / Tools`)
* Create tool groups (Languages, Data analysis, Visualization, Databases, Tools & development).
* Add individual tools with ordering and optional proficiency levels.

### 5. Education & Certifications
* **Education:** Manage degrees, institutions, completion years, and status badges.
* **Certifications:** Filter by category, add credential verification links, and upload certificate PDFs/images.

### 6. Contact Inquiries (`Contact Messages`)
* Review incoming messages from the contact form.
* Update status (`New / Unread`, `In Progress`, `Responded / Closed`, `Spam`).
* Add internal administrative notes for follow-up tracking.
* View sender IP address and submission timestamp.

---

## REST API Specification (`/api/v1/`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/site-settings/bootstrap/` | Consolidated settings, design tokens, navigation, and section configs |
| `GET` | `/api/v1/site-settings/` | Global website identity, owner info, and resume download link |
| `GET` | `/api/v1/site-settings/design/` | Design tokens for CSS root variables |
| `GET` | `/api/v1/site-settings/navigation/` | Public header navigation links |
| `GET` | `/api/v1/site-settings/sections/` | Section visibility and display ordering |
| `GET` | `/api/v1/ticker/` | Marquee keyword list |
| `GET` | `/api/v1/about-stats/` | Stat counter cards for the About section |
| `GET` | `/api/v1/skills/` | Grouped skill categories and tool pills |
| `GET` | `/api/v1/education/` | Academic history entries |
| `GET` | `/api/v1/certifications/` | Credentials (supports `?category=...` and `?search=...`) |
| `GET` | `/api/v1/achievements/` | Milestones and outcome cards |
| `GET` | `/api/v1/projects/` | Published projects (supports `?category=...`, `?tag=...`, `?featured=true`) |
| `GET` | `/api/v1/projects/<slug>/` | Detailed project case study with gallery screenshots |
| `POST` | `/api/v1/contact/` | Contact submission with honeypot and rate limiting |

---

## Security & Anti-Spam Measures

1. **Honeypot Protection:** The contact serializer inspects a hidden `website` field. Automated bots filling this field are instantly blocked without polluting the database.
2. **Server-Side Rate Limiting:** Contact submissions are protected with `ScopedRateThrottle` (default: 15 submissions per hour per IP).
3. **Restricted Admin Access:** Public endpoints are strictly read-only (`IsAuthenticatedOrReadOnly`). Contact messages and administrative notes cannot be read via public APIs.
4. **Validation:** All inputs (name, email format, message length) are validated on the backend.
5. **Safe Media Uploads:** File extensions and sizes are enforced (max 8MB for images, 15MB for documents).

---

## Running Backend Tests

The automated test suite verifies public API responses, draft vs. published project filtering, contact validation, honeypot spam detection, and endpoint permissions:

```bash
cd portfolio-project/backend
python manage.py test tests
```

---

## Production Deployment Checklist

1. **Environment Variables:**
   * Set `DEBUG=False` in `.env`.
   * Generate a secure random `SECRET_KEY`.
   * Set `ALLOWED_HOSTS` to your domain (e.g. `hilpatel.com,www.hilpatel.com`).
   * Set `CORS_ALLOWED_ORIGINS` to your frontend production domain.
2. **Database:**
   * Provide a PostgreSQL connection string in `DATABASE_URL`:
     `DATABASE_URL=postgres://user:password@hostname:5432/dbname`
3. **Static & Media Files:**
   * Run `python manage.py collectstatic --noinput`.
   * Static files are automatically compressed and served using WhiteNoise.
   * For persistent media uploads on platforms with ephemeral filesystems (Heroku, Render, Railway), configure AWS S3, Cloudinary, or persistent disk volumes.
4. **Frontend Build:**
   * Run `npm run build` inside `frontend/`.
   * Deploy the generated `dist/` directory to Vercel, Netlify, Cloudflare Pages, or serve directly via Nginx.

