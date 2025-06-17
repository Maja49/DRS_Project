# Konfiguracija za povezivanje sa bazom putem SQLAlchemy
'''DB_HOST = 'localhost'  # Ime servisa baze u docker-compose.yml (ne localhost)
DB_USER = 'root'  # Korisničko ime baze
DB_PASSWORD = '2310'  # Lozinka za bazu
DB_NAME = 'drs'  # Naziv tvoje baze'''

'''
DB_HOST = 'localhost'
DB_USER = 'drs_user'         # novi korisnik
DB_PASSWORD = 'drs_pass'     # nova lozinka
DB_NAME = 'drs_clean'        # nova baza
'''

import os

DB_HOST = os.getenv('DB_HOST', 'db')
DB_USER = os.getenv('DB_USER', 'drs_user')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'drs_pass')
DB_NAME = os.getenv('DB_NAME', 'drs_clean')


# Flask konfiguracije
SECRET_KEY = 'a#4h!r3d89D09$2faHf!sd83F@#s'  # Tajni ključ za Flask aplikaciju

# Postavke za slanje emailova
MAIL_SERVER = 'smtp.gmail.com'
MAIL_PORT = 587
MAIL_USE_TLS = True
MAIL_USERNAME = 'celicdorde@gmail.com'
MAIL_PASSWORD = 'vppl jsvi kurr fhrt'
MAIL_DEFAULT_SENDER = 'celicdorde@gmail.com'
