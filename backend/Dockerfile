# Odaberi baznu sliku sa Python-om
FROM python:3.10

# Instaliraj netcat-traditional
RUN apt-get update && apt-get install -y netcat-traditional

# Postavi radni direktorijum
WORKDIR /app

# Preuzmi wait-for-it skriptu unutar /app
RUN wget -O /app/wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh \
    && chmod +x /app/wait-for-it.sh

# Kopiraj sve fajlove u Docker container
COPY . /app

# Instaliraj Python zavisnosti
RUN pip install -r requirements.txt

# Pokreni wait-for-it pre nego što startuje aplikaciju
CMD ["/app/wait-for-it.sh", "db:3306", "--", "python", "app.py"]
