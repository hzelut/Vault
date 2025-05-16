CREATE TABLE IF NOT EXISTS admin (
  name TEXT PRIMARY KEY,
  passwd TEXT NOT NULL,
  token TEXT,
  options TEXT
);

CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  memo TEXT,
  done INTEGER,
  date INTEGER,
  repeat_interval INTEGER,
  repeat_unit TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS finances (
  id INTEGER PRIMARY KEY,
  category TEXT NOT NULL,
  amount INTEGER NOT NULL,
  date INTEGER NOT NULL,
  memo TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS budgets (
  id INTEGER PRIMARY KEY,
  category TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY,
  status TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tag_links (
  id INTEGER PRIMARY KEY,
  tag_id INTEGER NOT NULL,
  item_type TEXT NOT NULL,
  item_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY(tag_id) REFERENCES tags(id)
);
