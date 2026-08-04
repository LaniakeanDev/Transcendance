Prisma

choose how you want to set up your database:

CONNECT EXISTING DATABASE:

1. Configure your DATABASE_URL in prisma.config.ts
2. Run prisma db pull to introspect your database.

CREATE NEW DATABASE:
Local: npx prisma dev (runs Postgres locally in your terminal)
Cloud: npx create-db (creates a free Prisma Postgres database)

Then, define your models in prisma/schema.prisma and run prisma migrate dev to apply your schema.

Learn more: https://pris.ly/getting-started




```mermaid
erDiagram
  USER ||--o{ POST : creates
  USER ||--o{ LIKE : gives
  POST ||--o{ LIKE : receives
  USER ||--o{ COMMENT : writes
  POST ||--o{ COMMENT : has
  USER ||--o{ MESSAGE : sends
  USER ||--o{ MESSAGE : receives

  USER {
    uuid id PK
    string username
    string email
    string password_hash
    string bio
    string avatar_url
    timestamp created_at
  }
  POST {
    uuid id PK
    uuid user_id FK
    string image_url
    string caption
    timestamp created_at
  }
  LIKE {
    uuid id PK
    uuid user_id FK
    uuid post_id FK
    timestamp created_at
  }
  COMMENT {
    uuid id PK
    uuid user_id FK
    uuid post_id FK
    string text
    timestamp created_at
  }
  MESSAGE {
    uuid id PK
    uuid sender_id FK
    uuid receiver_id FK
    string content
    timestamp created_at
    timestamp read_at
  }
```



