import sqlite3
import os
from flask import g

DB_PATH = os.getenv('DB_PATH')

def get_db():
  db = getattr(g, '_database', None)
  if db is None:
    db = g._database = sqlite3.connect(DB_PATH)
    db.execute('PRAGMA foreign_keys = ON;')
    db.row_factory = make_dicts
  return db

def query_db(query, args=(), one=False):
  db = get_db()
  cur = db.execute(query, args)
  rv = cur.fetchall()

  if query.strip().startswith(('INSERT', 'UPDATE', 'DELETE')):
    db.commit()

  cur.close()
  return (rv[0] if rv else None) if one else rv

def init_db(app):
  with app.app_context():
    db = get_db()
    with app.open_resource('schema.sql', mode='r') as f:
      db.cursor().executescript(f.read())
    db.commit()
  app.teardown_appcontext(close_db)

def close_db(e=None):
  db = getattr(g, '_database', None)
  if db is not None:
    db.close()

def make_dicts(cursor, row):
  return dict((cursor.description[idx][0], value)
              for idx, value in enumerate(row))
