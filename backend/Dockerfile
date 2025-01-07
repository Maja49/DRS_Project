# Odaberi baznu sliku sa Python-om
FROM python:3.10

# Instaliraj netcat-traditional (potrebno za čekanje na port)
RUN apt-get update && apt-get install -y netcat-traditional

# Preuzmi wait-for-it skriptu
RUN wget https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh \
    && chmod +x wait-for-it.sh


# Postavi radni direktorijum
WORKDIR /app

# Kopiraj sve fajlove u Docker container
COPY . /app

# Instaliraj Python zavisnosti
RUN pip install -r requirements.txt

# Pozovi wait-for-it skriptu koja čeka na MySQL servis da bude dostupan
CMD ["./wait-for-it.sh", "db:3306", "--", "python", "app.py"]
