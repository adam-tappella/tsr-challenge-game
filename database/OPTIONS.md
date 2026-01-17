# Database Options

This document provides guidance on choosing and setting up a database for your project.

## Quick Comparison

| Feature | PostgreSQL | SQLite | No Database |
|---------|------------|--------|-------------|
| **Best For** | Production apps, complex queries | Prototypes, simple apps | Static sites, APIs |
| **Setup Complexity** | Medium | Low | None |
| **Scalability** | High | Low | N/A |
| **Concurrent Users** | Many | Few | N/A |
| **Cloud Options** | AWS Aurora, RDS, Supabase | File-based | N/A |

## Option 1: PostgreSQL (Recommended for Production)

### When to Use
- Production applications
- Multiple concurrent users
- Complex queries and relationships
- Need for transactions
- Team collaboration

### Local Development Setup

Use Docker Compose for local PostgreSQL:

```bash
cd deployment/docker
docker-compose -f docker-compose.dev.yml up postgres
```

Or install directly:
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb myapp_dev
```

### Connection Configuration

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp_dev
DB_USER=postgres
DB_PASSWORD=postgres
```

### Node.js Client

Use the `pg` library:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Query example
const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
```

See `code-templates/backend/DATABASE_CLIENT_TEMPLATE.ts` for a full implementation.

### Production Options

| Service | Description | Cost |
|---------|-------------|------|
| **AWS Aurora PostgreSQL** | Managed, highly available | $$ |
| **AWS RDS PostgreSQL** | Managed, single instance | $ |
| **Supabase** | PostgreSQL with API | Free tier + |
| **Railway** | Managed PostgreSQL | Free tier + |
| **Render** | Managed PostgreSQL | Free tier + |

---

## Option 2: SQLite

### When to Use
- Prototypes and demos
- Single-user applications
- Embedded databases
- Simple data storage needs
- Quick development

### Setup

No server needed - SQLite uses a file:

```bash
npm install better-sqlite3
# or
npm install sql.js  # for browser/Node.js
```

### Node.js Example

```typescript
import Database from 'better-sqlite3';

const db = new Database('myapp.db');

// Create table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE
  )
`);

// Insert
const insert = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
insert.run('John Doe', 'john@example.com');

// Query
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(1);
```

### Limitations

- Not suitable for high concurrency
- No network access (local file only)
- Limited data types
- No user management

---

## Option 3: No Database (API/Static)

### When to Use
- Static websites
- Frontend-only applications
- Data fetched from external APIs
- Serverless functions with external storage

### Data Storage Alternatives

| Method | Use Case |
|--------|----------|
| **Local Storage** | User preferences, small data |
| **Session Storage** | Temporary session data |
| **IndexedDB** | Larger client-side data |
| **External API** | Fetch data from services |
| **JSON Files** | Static data, configuration |

---

## Database Design Best Practices

### Naming Conventions

- Tables: `snake_case`, plural (e.g., `user_accounts`)
- Columns: `snake_case` (e.g., `created_at`)
- Primary keys: `id` (auto-increment or UUID)
- Foreign keys: `[table]_id` (e.g., `user_id`)

### Common Patterns

#### Timestamps

Always include:
```sql
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
```

#### Soft Deletes

Instead of deleting:
```sql
deleted_at TIMESTAMP WITH TIME ZONE NULL
```

#### UUIDs for External IDs

```sql
id SERIAL PRIMARY KEY,
uuid UUID DEFAULT gen_random_uuid() UNIQUE
```

### Migration Strategy

1. Use migration files for schema changes
2. Version control all migrations
3. Test migrations before production
4. Always include rollback scripts

Example migration structure:
```
migrations/
  001_create_users.sql
  001_create_users_down.sql
  002_add_user_email.sql
  002_add_user_email_down.sql
```

---

## Related Templates

- `code-templates/backend/DATABASE_CLIENT_TEMPLATE.ts` - PostgreSQL client
- `deployment/docker/docker-compose.dev.yml` - Local PostgreSQL
- `config-templates/backend/env.example.template` - Environment variables

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Node-postgres (pg) Library](https://node-postgres.com/)
- [better-sqlite3 Library](https://github.com/WiseLibs/better-sqlite3)
