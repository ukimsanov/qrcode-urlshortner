# Database Schema

## Tables

### `urls` - URL Storage & Metadata

```sql
CREATE TABLE urls (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  short_code    VARCHAR(16) UNIQUE NOT NULL,
  long_url      TEXT NOT NULL,
  alias         VARCHAR(32) UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ,
  qr_status     VARCHAR(16),
  qr_url        TEXT,
  content_type  VARCHAR(32) DEFAULT 'url',
  qr_config     JSONB
);
```

**Indexes:**
- Primary key on `id` (UUID v4)
- Unique constraint on `short_code` (collision prevention)
- Unique constraint on `alias` (custom short codes)

**New fields:**
- `content_type`: Type of QR content (`url`, `vcard`, `wifi`, `email`, `sms`)
- `qr_config`: JSONB field for QR customization (colors, error correction, size)

---

### `click_totals` - Analytics

```sql
CREATE TABLE click_totals (
  short_code    VARCHAR(16) PRIMARY KEY REFERENCES urls(short_code) ON DELETE CASCADE,
  total_clicks  BIGINT NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Relationships:**
- Foreign key to `urls(short_code)` with CASCADE DELETE
- 1:1 relationship with urls table

**Atomic upsert pattern:**
```sql
INSERT INTO click_totals (short_code, total_clicks, updated_at)
VALUES ($1, 1, NOW())
ON CONFLICT (short_code)
DO UPDATE SET
  total_clicks = click_totals.total_clicks + 1,
  updated_at = NOW();
```

---

## Extensions

- **uuid-ossp** - Enables `uuid_generate_v4()` for auto-generated UUIDs
