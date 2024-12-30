# Scripts

## Backup Script

Run the below command in scripts folder:

```
sh backup-script.sql dev
```

## Restore Script

Navigate to scripts folder and run the below command to restore the specified file in your local database

```
psql --host="localhost" --port="5432" --username="postgres" --dbname="directus" --file="./directus_backup_2024-04-11_18-25-53.sql"
```
