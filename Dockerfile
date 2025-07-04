# official Python base image
FROM python:3.11-slim

# Install system dependencies required for pyodbc
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    apt-transport-https \
    curl \
    gnupg \
    && rm -rf /var/lib/apt/lists/*


# Install Microsoft ODBC Driver for SQL Server
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    curl https://packages.microsoft.com/config/debian/11/prod.list > /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update && ACCEPT_EULA=Y apt-get install -y \
    msodbcsql18 \
    unixodbc \
    unixodbc-dev && \
    rm -rf /var/lib/apt/lists/*




# Set the working directory 
WORKDIR /app

# Copy the requirements.txt file 
COPY requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code 
COPY app/ ./app/

# Expose port 8000
EXPOSE 8000

# run the FastAPI app using Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
