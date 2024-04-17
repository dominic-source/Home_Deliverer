from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv
# To Include migration for our database updates
from flask_migrate import Migrate

# import redis server
from redis import Redis

# integrate flask session
from flask_session import Session

# integrate password hashing
from flask_bcrypt import Bcrypt

# Create an instance of flask app
app = Flask(__name__)

# initialize bcrypt for password hashing
bcrypt = Bcrypt(app)

# Loads the environmental variable from the .env file
load_dotenv()

# Get environmental variable that contains info for our database connection
DELIVER_MYSQL_HOST = os.environ.get('DELIVER_MYSQL_HOST')
DELIVER_MYSQL_DB = os.environ.get('DELIVER_MYSQL_DB')
DELIVER_MYSQL_USER = os.environ.get('DELIVER_MYSQL_USER')
DELIVER_MYSQL_PWD = os.environ.get('DELIVER_MYSQL_PWD')
DELIVER_MYSQL_ENV = os.environ.get('DELIVER_MYSQL_ENV')
DELIVER_MYSQL_PORT = os.environ.get('DELIVER_MYSQL_PORT')

# Set up secret key for signing sessions
# import secrets
# secrets.token_hex() will generate a new token
app.config['SECRET'] = os.environ.get('SECRET_KEY')

# Setup mysql server uri
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql://{DELIVER_MYSQL_USER}:{DELIVER_MYSQL_PWD}@{DELIVER_MYSQL_HOST}:{DELIVER_MYSQL_PORT}/{DELIVER_MYSQL_DB}'

# Session configuration
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_REDIS'] = Redis(host='localhost', port=6379)
Session(app)

# Instantiate flask_sqlalchemy database
db = SQLAlchemy(app)

# migrating application
migrate = Migrate(app, db)

# Configure the file upload
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
