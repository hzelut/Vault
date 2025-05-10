import os
import datetime
import jwt
import click
from flask import request, g, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from .database import query_db

SECRET_KEY = os.getenv('JWT_SECRET_KEY')
JWT_ALG = os.getenv('JWT_ALG')
ADMIN_NAME = os.getenv('ADMIN_NAME')

PUBLIC_PATHS = {'/static', '/blog'}

def login_admin(name, passwd):
  if name != ADMIN_NAME:
    return None

  admin = query_db('SELECT * FROM admin WHERE name=?', [name], True)
  if not admin:
    return None

  if not check_password_hash(admin['passwd'], passwd):
    return None

  token = generate_token(name)
  update_token(name, token)

  return token

def generate_token(name):
  payload = {
    'name': name,
    'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
  }
  return jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALG)

def decode_token(token):
  try:
    return jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALG])
  except jwt.ExpiredSignatureError:
    admin = query_db('SELECT * FROM admin WHERE token=?', [token], True)
    if admin:
      new_token = generate_token(admin['name'])
      update_token(admin['name'], new_token)
      print('Refresh token')
      return jwt.decode(new_token, SECRET_KEY, algorithms=[JWT_ALG])
  except jwt.InvalidTokenError:
    return None

  return None

def update_token(name, token):
  query_db('UPDATE admin SET token=? WHERE name=? RETURNING name', [token, name], True)
  g.new_token = token

@click.command('reset-passwd')
@click.argument('passwd')
def reset_passwd(passwd):
  hashed = generate_password_hash(passwd)

  res = query_db('UPDATE admin SET passwd=? WHERE name=? RETURNING name', [hashed, ADMIN_NAME], True)
  if res:
    click.echo(f'Updated password {passwd}')
  else:
    query_db('INSERT INTO admin (name, passwd) VALUES (?,?) RETURNING name', [ADMIN_NAME, hashed])
    click.echo(f'Create admin')

def auth_middleware(app):
  @app.before_request
  def check_auth():
    if any(request.path.startswith(path) for path in PUBLIC_PATHS):
      return

    res = redirect(url_for('blog.index'))

    token = request.cookies.get('token')
    if not token:
      return res

    admin = decode_token(token)
    if not admin or admin['name'] != ADMIN_NAME:
      return res

  @app.after_request
  def refresh_cookie(res):
    if hasattr(g, 'new_token'):
      res.set_cookie(
        'token', g.new_token,
        httponly=True,
        secure=True,
        samesite='Lax',
        path='/',
        max_age=7*24*3600
      )
    return res
