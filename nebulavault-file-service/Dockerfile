FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN if [ -f requirements.txt ]; then pip install -r requirements.txt; else pip install flask gunicorn; fi
EXPOSE 5000
CMD ["gunicorn","-b","0.0.0.0:5000","wsgi:app"]
