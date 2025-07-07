# Koristimo službeni Python image
FROM python:3.12-slim

# Setuj radni dir
WORKDIR /app

# Kopiraj requirements i instaliraj
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Kopiraj samo backend kod
COPY . .

# Izloži port na kojem aplikacija radi
EXPOSE 5000

# Definiši komandu za pokretanje aplikacije
CMD ["python", "-u", "./app.py"]