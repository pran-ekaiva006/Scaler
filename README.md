# Postman

A functional clone of Postman built with Next.js and FastAPI, featuring a request builder, a real backend proxy, collections, environments, and history.

## What this actually does

This application allows you to build and send real HTTP requests to external servers. Instead of making requests directly from the browser, they are routed through a FastAPI backend proxy to bypass CORS restrictions. The app organizes requests into collections and folders, resolves `{{variables}}` using active environments, and logs all executed requests to a history tab. Everything is persisted locally using an SQLite database with a custom schema designed specifically for this project.

## Screenshots

Screenshots below — add a GIF of the send flow if you have time, it does more than three paragraphs would.
<!-- TODO: add screenshot/gif here -->

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (App Router) | React foundation with fast hot-reloading |
| State Management | Zustand | Lightweight, predictable local state without Redux boilerplate |
| UI Framework | React Resizable Panels | Easy implementation of draggable, resizable layout panes |
| Backend | FastAPI | Async support, pairs cleanly with httpx for the proxy |
| Database | SQLite + SQLAlchemy | Zero-config persistent storage, perfect for a local desktop-like app |
| HTTP Client | httpx | Async HTTP requests for the backend proxy |

## Architecture

The application relies on a backend proxy pattern. The frontend never makes HTTP requests directly to the target URL; instead, it sends the request payload to the backend. The backend executes the request using `httpx`, logs the result into the local SQLite database, and returns the response to the frontend. This bypasses browser CORS restrictions entirely and ensures that all request history and persistence logic is safely handled on the server side.

```text
backend/
├── app/
│   ├── models/        # SQLAlchemy schemas
│   ├── routers/       # API endpoints (collections, proxy, etc.)
│   ├── schemas/       # Pydantic validation models
│   ├── services/      # Business logic (request building, sending)
│   ├── config.py
│   ├── database.py
│   └── main.py
└── requirements.txt

frontend/
├── public/
├── src/
│   ├── app/           # Next.js app router pages
│   ├── components/    # UI components (layout, tabs, editors)
│   ├── lib/           # API clients and utilities
│   └── store/         # Zustand state stores
├── package.json
└── next.config.ts
```

## Database Schema

The database uses SQLite with 6 tables. The relationships feature cascading deletes (deleting a collection deletes its folders and requests) and nullable foreign keys (allowing history to track both saved requests and ad-hoc unsaved requests).

```python
class Collection(Base):
    __tablename__ = "collections"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    folders: Mapped[List["Folder"]] = relationship(cascade="all, delete-orphan")
    requests: Mapped[List["Request"]] = relationship(cascade="all, delete-orphan")

class Folder(Base):
    __tablename__ = "folders"
    id: Mapped[int] = mapped_column(primary_key=True)
    collection_id: Mapped[int] = mapped_column(ForeignKey("collections.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(255))
    requests: Mapped[List["Request"]] = relationship(cascade="all, delete-orphan")

class Request(Base):
    __tablename__ = "requests"
    id: Mapped[int] = mapped_column(primary_key=True)
    collection_id: Mapped[Optional[int]] = mapped_column(ForeignKey("collections.id"))
    folder_id: Mapped[Optional[int]] = mapped_column(ForeignKey("folders.id"))
    name: Mapped[str] = mapped_column(String(255))
    method: Mapped[str] = mapped_column(String(10))
    url: Mapped[str] = mapped_column(String(2048))
    # Params, Headers, Body, Auth stored as JSON
    history: Mapped[List["History"]] = relationship(cascade="all, delete-orphan")

class Environment(Base):
    __tablename__ = "environments"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    variables: Mapped[List["EnvironmentVariable"]] = relationship(cascade="all, delete-orphan")

class EnvironmentVariable(Base):
    __tablename__ = "environment_variables"
    id: Mapped[int] = mapped_column(primary_key=True)
    environment_id: Mapped[int] = mapped_column(ForeignKey("environments.id", ondelete="CASCADE"))
    key: Mapped[str] = mapped_column(String(255))
    value: Mapped[str] = mapped_column(Text)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)

class History(Base):
    __tablename__ = "history"
    id: Mapped[int] = mapped_column(primary_key=True)
    request_id: Mapped[Optional[int]] = mapped_column(ForeignKey("requests.id", ondelete="SET NULL"))
    name: Mapped[str] = mapped_column(String(255))
    # Stores exact request payload + response payload, status, time, and size
```

## API Reference

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/proxy/send` | The actual request runner. Proxies HTTP requests to target servers (not a mock). |
| GET / POST | `/api/collections` | Fetch or create collections. |
| PUT / DELETE | `/api/collections/{id}` | Update or delete a collection. |
| POST | `/api/collections/{id}/folders` | Create a folder inside a collection. |
| PUT / DELETE | `/api/folders/{id}` | Update or delete a folder. |
| POST | `/api/collections/{id}/requests` | Create a saved request. |
| GET / PUT / DELETE | `/api/requests/{id}` | Fetch, update, or delete a saved request. |
| GET / POST | `/api/environments` | Fetch or create environments. |
| PUT / DELETE | `/api/environments/{id}` | Update or delete an environment. |
| POST | `/api/environments/{id}/variables` | Add a variable to an environment. |
| PUT / DELETE | `/api/environments/variables/{var_id}`| Update or delete an environment variable. |
| GET / DELETE | `/api/history` | Fetch all history or clear history. |
| GET / DELETE | `/api/history/{id}` | Fetch or delete a specific history record. |

## Setup & Installation

The database auto-seeds on the first run; no manual migration or seed step is needed.

**Backend Setup**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Design Decisions & Tradeoffs

- **No Monaco/code-editor dependency for JSON highlighting:** Built a custom lightweight regex-based highlighter instead, avoiding a massive bundle dependency for a relatively small UI need.
- **Folders are single-level under a collection, not infinitely nested:** Keeps the database schema and the UI tree simple, satisfying the assignment's 'folders optional' requirement without overbuilding.
- **No real auth:** Uses a single implied default user context, as explicitly allowed by the assignment spec.
- **SQLite with SQLAlchemy but no Alembic:** Since this is a local app meant to run out of the box, `Base.metadata.create_all` auto-creates tables on startup, avoiding manual migration steps and complexity.
- **Zustand over Redux:** Provided a very simple way to manage complex interconnected states (Tabs, Environments, Collections) with minimal boilerplate.
- **Backend proxy pattern instead of browser fetch:** Completely bypasses CORS restrictions and guarantees that all request/response history is securely executed and logged on the server.

## What's Mocked / Not Implemented

- **Mock Servers:** Placeholder "Coming Soon" screen.
- **Monitors:** Placeholder "Coming Soon" screen.
- **API Documentation:** Placeholder "Coming Soon" screen.
- **Team Workspaces:** Placeholder "Coming Soon" screen.

## If I Had More Time

- Pre-request scripts and test assertions for dynamic workflows.
- Postman Collection import/export capabilities (parsing JSON to SQLite).
- A responsive mobile layout (the current layout assumes a desktop-class screen).
- Code snippet generation (cURL, Python, JS) for saved requests.

## Built with AI assistance

AI tools were used heavily for implementation per the assignment's explicit allowance. Every line of code generated was reviewed for architectural soundness and can be fully explained during the evaluation interview.
