from flask import Blueprint, render_template

todo = Blueprint('todo', __name__, url_prefix='/todo')

@todo.route('/')
def index():
  return render_template('todo/index.html')
