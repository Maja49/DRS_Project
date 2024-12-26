# Konfiguracija za povezivanje sa bazom putem SQLAlchemy
DB_HOST = 'db'  # Ime servisa baze u docker-compose.yml (ne localhost)
DB_USER = 'root'  # Korisničko ime baze
DB_PASSWORD = '2310'  # Lozinka za bazu
DB_NAME = 'drs'  # Naziv tvoje baze

# Flask konfiguracije
SECRET_KEY = 'a#4h!r3d89D09$2faHf!sd83F@#s'  # Tajni ključ za Flask aplikaciju

# Postavke za slanje emailova
MAIL_SERVER = 'smtp.gmail.com'
MAIL_PORT = 587
MAIL_USE_TLS = True
MAIL_USERNAME = 'celicdorde@gmail.com'
MAIL_PASSWORD = 'vppl jsvi kurr fhrt'
MAIL_DEFAULT_SENDER = 'celicdorde@gmail.com'
