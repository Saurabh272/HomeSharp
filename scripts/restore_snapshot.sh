#!/bin/bash

# Load environment variables from the .env file
if [ "$1" = "--api" ]; then
  source .env
else
  source ../.env
fi

# Path to the backup file (if provided)
BACKUP_FILE="$1"

# Snapshot ID (if provided)
SNAPSHOT_ID="$2"

if [ -n "$BACKUP_FILE" ]; then
  BACKUP_FILE_PATH="$SNAPSHOT_PATH/$BACKUP_FILE"
  
  # Check if the backup file exists
  if [ ! -f "$BACKUP_FILE_PATH" ]; then
    echo "Backup file not found: $BACKUP_FILE_PATH"
    exit 1
  fi

  # ... existing code ...

# Add these lines before the restore attempt
echo "Creating database if it doesn't exist..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USERNAME -p $DB_PORT -d postgres -c "CREATE DATABASE terrasharp1;"

# Continue with existing restore code...

  # Restore the database from the provided backup file using psql
  echo "Restoring database from $BACKUP_FILE..."
  PGPASSWORD="$DB_PASSWORD" psql --host="$DB_HOST" --port="$DB_PORT" --username="$DB_USERNAME" --dbname="$DB_DATABASE" --file="$BACKUP_FILE_PATH" --no-password

  if [ $? -eq 0 ]; then
    echo "Database restore completed successfully."
  else
    echo "Error: Database restore failed."
    exit 1
  fi
elif [ -n "$SNAPSHOT_ID" ]; then
  # Fetch the data from the snapshot table based on the snapshot ID
  echo "Fetching data from snapshot table for snapshot ID: $SNAPSHOT_ID"
  
  SNAPSHOT_DATA=$(PGPASSWORD="$DB_PASSWORD" psql --host="$DB_HOST" --port="$DB_PORT" --username="$DB_USERNAME" --dbname="$DB_NAME" --no-password --tuples-only --command "SELECT content FROM public.snapshots WHERE id = $SNAPSHOT_ID;")

  echo "$SNAPSHOT_DATA"

  if [ $? -eq 0 ]; then
    if [ -n "$SNAPSHOT_DATA" ]; then
      # Restore the data from the snapshot into the target PostgreSQL database
      echo "Restoring data into PostgreSQL..."
      echo "$SNAPSHOT_DATA" | PGPASSWORD="$DB_PASSWORD" psql --host="$DB_HOST" --port="$DB_PORT" --username="$DB_USERNAME" --dbname="$DB_DATABASE" --no-password

      if [ $? -eq 0 ]; then
        echo "Data restore completed successfully."
      else
        echo "Error: Data restore into PostgreSQL failed."
        exit 1
      fi
    else
      echo "Error: No data found in the snapshot for ID: $SNAPSHOT_ID"
      exit 1
    fi
  else
    echo "Error: Failed to fetch data from the snapshot table."
    exit 1
  fi
else
  echo "Error: Either a backup file or a snapshot ID must be provided."
  exit 1
fi
