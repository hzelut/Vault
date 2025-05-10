import os
from flask import Flask
from dotenv import load_dotenv

load_dotenv()

def create_app():
  app = Flask(__name__,
              template_folder='',
              static_folder='',
              static_url_path='/static'
              )
  app.secret_key = os.getenv('FLASK_SECRET_KEY')
  ADMIN_NAME = os.getenv('ADMIN_NAME')

  ## Routes
  from .blog.routes import blog
  app.register_blueprint(blog)
  from .routes import vault
  app.register_blueprint(vault)
  from .todo.routes import todo
  app.register_blueprint(todo)

  ## CLI
  from .lib.auth import reset_passwd
  app.cli.add_command(reset_passwd)

  from .lib.auth import auth_middleware
  auth_middleware(app)
  from .lib.database import init_db
  init_db(app)

  return app
