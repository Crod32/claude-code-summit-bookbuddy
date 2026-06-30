# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # Start server on port 3001 (or $PORT)
npm run seed     # Seed SQLite database with sample books and reviews
```

There are no tests or lint commands.

## Architecture

BookBuddy is a server-rendered Express + EJS app backed by SQLite (better-sqlite3).

**Startup flow:** `server.js` creates the database, runs `CREATE TABLE IF NOT EXISTS` for `books` and `reviews`, mounts `routes/books.js` at `/books` and `routes/reviews.js` at `/reviews`, then redirects `/` → `/books`.

**Database:** `bookbuddy.db` is created on first run (WAL mode). Foreign key constraints are enabled. Schema lives inline in `server.js`. `seed.js` populates 6 books and 13 reviews inside a transaction — run it after wiping the db file.

**Routes pattern:** All mutations use `POST` (no `PUT`/`DELETE`). Book deletion cascades to reviews manually (`DELETE FROM reviews WHERE book_id = ?` before deleting the book). Rating aggregates are computed on-the-fly with `AVG(rating)` — there is no denormalized rating column.

**Views:** EJS templates in `views/`. `header.ejs` and `footer.ejs` are included via `<%- include(...) %>` in every page template. Static assets are served from `public/`.

**Error handling is inconsistent:** `routes/reviews.js` wraps the create handler in try/catch; `routes/books.js` does not for most handlers.
