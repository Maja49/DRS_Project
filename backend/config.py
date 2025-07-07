import os

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'drs_clean')
DB_USER = os.getenv('DB_USER', 'drs_user')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'drs_pass')

SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret_key')

MAIL_SERVER = os.getenv('MAIL_SERVER', '')
MAIL_PORT = os.getenv('MAIL_PORT', '')
MAIL_USERNAME = os.getenv('MAIL_USERNAME', '')
MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', '')
MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', '')


DB_SSLMODE = os.getenv('DB_SSLMODE', 'disable')
