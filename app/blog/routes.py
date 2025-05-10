from flask import Blueprint, render_template, make_response, redirect, url_for, flash, request
from app.lib.auth import login_admin

blog = Blueprint('blog', __name__, url_prefix='/blog')

@blog.route('/')
def index():
  return render_template('blog/index.html')

@blog.route('/login', methods=['GET', 'POST'])
def login():
  if request.method == 'POST':
    name = request.form.get('name')
    passwd = request.form.get('passwd')

    token = login_admin(name, passwd)
    if token:
      return make_response(redirect(url_for('vault.index')))
    else:
      flash('Failed login')
      return redirect(url_for('blog.index'))

  return render_template('blog/login.html')
