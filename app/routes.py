from flask import Blueprint, render_template, make_response, redirect, url_for

vault = Blueprint('vault', __name__)

@vault.route('/')
def index():
  return render_template('index.html')

@vault.route('/logout')
def logout():
  res = make_response(redirect(url_for('blog.index')))
  res.set_cookie('token', '', expires=0)
  return res
