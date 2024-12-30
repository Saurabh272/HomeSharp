#!/bin/bash

# Valid values for ENV
valid_environments=("DEV" "UAT" "PROD")

echo "🚀 Starting database backup script..."

# Convert input to uppercase
if [ -n "$1" ]; then
  ENV=$(echo "$1" | tr '[:lower:]' '[:upper:]')
  echo "📌 Environment specified: $ENV"
else
  # Default to "DEV" if no environment is provided
  ENV="DEV"
  echo "📌 No environment specified, defaulting to: $ENV"
fi

# Check if ENV is valid, otherwise exit
env_valid=false
for valid_env in "${valid_environments[@]}"; do
  if [ "$ENV" == "$valid_env" ]; then
    env_valid=true
    break
  fi
done

if ! $env_valid; then
  echo "❌ Invalid environment. Valid environments are: ${valid_environments[*]}" >&2
  exit 1
fi

echo "🔄 Loading environment variables..."
# Load environment variables from the .env file
source ../.env || { echo "❌ Error sourcing .env file"; exit 1; }

echo "✨ Setting up database connection variables for $ENV environment..."
DATABASE_HOST_VAR_NAME="BACKUP_${ENV}_DB_HOST"
DATABASE_PORT_VAR_NAME="BACKUP_${ENV}_DB_PORT"
DATABASE_NAME_VAR_NAME="BACKUP_${ENV}_DB_DATABASE"
DATABASE_USERNAME_VAR_NAME="BACKUP_${ENV}_DB_USERNAME"
DATABASE_PASSWORD_VAR_NAME="BACKUP_${ENV}_DB_PASSWORD"

DATABASE_HOST="${!DATABASE_HOST_VAR_NAME}"
DATABASE_PORT="${!DATABASE_PORT_VAR_NAME}"
DATABASE_NAME="${!DATABASE_NAME_VAR_NAME}"
DATABASE_USERNAME="${!DATABASE_USERNAME_VAR_NAME}"
DATABASE_PASSWORD="${!DATABASE_PASSWORD_VAR_NAME}"

RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-15}
echo "📅 Backup retention period: ${RETENTION_DAYS} days"

timestamp=$(date +"%Y-%m-%d_%H:%M:%S")

backup_dir="$SNAPSHOT_PATH"

echo "📂 Backup directory: $backup_dir"

if [ ! -d "$backup_dir" ]; then
  echo "📁 Creating backup directory..."
  mkdir -p "$backup_dir"
fi

file_name_timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
backup_filename="$backup_dir/directus_backup_${file_name_timestamp}.sql"
echo "📝 Preparing to create backup file: $backup_filename"

# Perform the database backup
echo "💾 Starting database dump..."
PGPASSWORD="${DATABASE_PASSWORD}" pg_dump -O --clean -U "${DATABASE_USERNAME}" -h "${DATABASE_HOST}" -p "${DATABASE_PORT}" -d "${DATABASE_NAME}" > "$backup_filename"

if [ $? -eq 0 ]; then
  echo "✅ Database snapshot successfully saved as $backup_filename"

  echo "🔍 Checking for snapshots table..."
  # Check if the "snapshots" table exists in the database
  if ! PGPASSWORD="${DATABASE_PASSWORD}" psql -U "${DATABASE_USERNAME}" -h "${DATABASE_HOST}" -p "${DATABASE_PORT}" -d "${DATABASE_NAME}" -tAc "SELECT 1 FROM pg_tables WHERE tablename = 'snapshots';" | grep -q 1; then
    echo "📊 Creating snapshots table..."
    # Create the "snapshots" table if it does not exist
    PGPASSWORD="${DATABASE_PASSWORD}" psql -U "${DATABASE_USERNAME}" -h "${DATABASE_HOST}" -p "${DATABASE_PORT}" -d "${DATABASE_NAME}" -c "
    CREATE TABLE snapshots (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP NOT NULL,
        file_name VARCHAR(255) NOT NULL
    );"
    echo "✅ Created 'snapshots' table in the database"
  fi

  echo "📝 Recording backup in snapshots table..."
  # Create an SQL script file for inserting the backup file path
  sql_script=$(mktemp)
  echo "INSERT INTO snapshots (timestamp, file_name) VALUES ('${timestamp}', '${backup_filename}');" > "${sql_script}"

  PGPASSWORD="${DATABASE_PASSWORD}" psql -U "${DATABASE_USERNAME}" -h "${DATABASE_HOST}" -p "${DATABASE_PORT}" -d "${DATABASE_NAME}" -f "${sql_script}"

  if [ $? -eq 0 ]; then
    echo "✅ Backup file path successfully recorded in the 'snapshots' table"

    echo "🧹 Cleaning up old backups..."
    # Delete old backups in PostgreSQL
    PGPASSWORD="${DATABASE_PASSWORD}" psql -U "${DATABASE_USERNAME}" -h "${DATABASE_HOST}" -p "${DATABASE_PORT}" -d "${DATABASE_NAME}" -c "
    DELETE FROM snapshots WHERE timestamp < NOW() - INTERVAL '${RETENTION_DAYS} days';"

    # Delete old backups locally
    find "${backup_dir}" -name "directus_backup_*.sql" -type f -mtime +"${RETENTION_DAYS}" -exec rm {} \;

    echo "✨ Old backups successfully cleaned up (older than ${RETENTION_DAYS} days)"
  else
    echo "❌ Error inserting backup file path into the 'snapshots' table"
    exit 1
  fi

  # Ensure the temporary SQL script file is securely deleted after use
  echo "🧹 Cleaning up temporary files..."
  rm -f "${sql_script}"
  echo "✅ Backup process completed successfully!"
else
  echo "❌ Error creating database snapshot"
  exit 1
fi
