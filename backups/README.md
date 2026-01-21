# Database Backups

This directory stores PostgreSQL database backups.

## How to Backup

### Automatic Backup Script (Windows)
```powershell
.\backup-database.ps1
```

### Manual Backup
```bash
# Create backup with timestamp
docker-compose exec -T db pg_dump -U postgres veri_analizi > backups/backup_$(date +%Y%m%d_%H%M%S).sql
```

## How to Restore

```bash
# Restore from a specific backup
cat backups/backup_20260121_120000.sql | docker-compose exec -T db psql -U postgres veri_analizi
```

## Backup Naming Convention

Backups are automatically named with timestamp:
- Format: `backup_YYYYMMDD_HHMMSS.sql`
- Example: `backup_20260121_143022.sql`

## Best Practices

1. **Regular Backups**: Run backups before major changes
2. **Test Restores**: Periodically test your backups
3. **Off-site Storage**: Copy important backups to external drive or cloud
4. **Cleanup**: Remove old backups to save space (keep last 30 days)

## Notes

- Backups are in SQL format (human-readable)
- Include database schema and all data
- Can be restored to any PostgreSQL instance
