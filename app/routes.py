from flask import Blueprint, render_template

vault = Blueprint('vault', __name__)

@vault.route('/')
def index():
  return render_template('index.html')
