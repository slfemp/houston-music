-- Migration number: 0001    2026-08-26
-- HMAB network graph + admin auth

-- The graph. Every musician, venue, org, event, program is a node;
-- relationships are edges. New node kinds are a row, never a schema change.
CREATE TABLE nodes (
  id         TEXT PRIMARY KEY,              -- kebab-case slug
  type       TEXT NOT NULL,                 -- person|org|venue|event|program|musician|...
  name       TEXT NOT NULL,
  data       TEXT NOT NULL DEFAULT '{}',    -- JSON: everything type-specific
  status     TEXT NOT NULL DEFAULT 'active',-- active|proposed|archived
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_nodes_type ON nodes(type);
CREATE INDEX idx_nodes_status ON nodes(status);

CREATE TABLE edges (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  from_id    TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  to_id      TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  relation   TEXT NOT NULL,                 -- member-of|runs|hosted-at|involved|owned-by|funded-by|...
  data       TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(from_id, to_id, relation)
);
CREATE INDEX idx_edges_from ON edges(from_id);
CREATE INDEX idx_edges_to ON edges(to_id);

-- Private contact channels. Admin-eyes only — never rendered publicly.
CREATE TABLE contacts (
  node_id    TEXT PRIMARY KEY REFERENCES nodes(id) ON DELETE CASCADE,
  emails     TEXT NOT NULL DEFAULT '[]',    -- JSON array
  phones     TEXT NOT NULL DEFAULT '[]',    -- JSON array
  notes      TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Auth: allowlisted admins, magic links, sessions.
CREATE TABLE admins (
  email      TEXT PRIMARY KEY,              -- lowercase
  name       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE magic_links (
  token      TEXT PRIMARY KEY,
  email      TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE sessions (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE rate_limits (
  key          TEXT PRIMARY KEY,
  count        INTEGER NOT NULL DEFAULT 0,
  window_start INTEGER NOT NULL
);

-- Launch allowlist
INSERT INTO admins (email, name) VALUES
  ('mike@slfemp.com', 'Michael "Frost" Moore'),
  ('gracie@bombontexas.com', 'Gracie Chávez');
