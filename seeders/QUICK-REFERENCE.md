# 🌱 Seeder Quick Reference Card

## One-Command Start

```bash
node seeders/index.js
```

**Duration**: ~8-10 minutes for full dataset (300k+ records)

---

## Expected Record Counts

```
✓ monchois: 7
✓ santhethaos: 750
✓ vitrisans: 3,500
✓ dichvus: 1,500
✓ magiamgias: 250
✓ chusans: 500
✓ nhanviens: 1,500
✓ nguoidungs: 30,000
✓ admins: 5
✓ datsans: 300,000        [BATCH: 1k records]
✓ datsandichvus: 500,000  [BATCH: 5k records]
✓ danhgias: 75,000
✓ sukiens: 500
✓ thongbaos: 1,500
✓ lichsuthanhtoans: ~210,000

TOTAL: ~1.1 million records
```

---

## Test Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin0@sportsbook.vn` | `Admin@123456` |
| Court Owner | `chusan0@sportsbook.vn` | `Owner@123456` |
| Staff | `nhanvien0@sportsbook.vn` | `Staff@123456` |
| User | `user0@sportsbook.vn` | `User@123456` |

*Replace `0` with any number up to: admins (4), chusans (499), nhanviens (1499), users (29999)*

---

## Dependency Order

```
Phase 1 (Foundation)
├─ monchois (7)
├─ chusans (500)
├─ admins (5)
└─ nguoidungs (30,000)

Phase 2 (Facilities)
├─ santhetha (750) ← needs chusans
└─ nhanviens (1,500) ← needs santhetha

Phase 3 (Court Setup)
├─ vitrisans (3,500) ← needs santhetha, monchois
├─ dichvus (1,500) ← needs santhetha
├─ magiamgias (250) ← needs santhetha
├─ sukiens (500) ← needs santhetha
└─ thongbaos (1,500) ← needs santhetha

Phase 4 (Bookings)
└─ datsans (300,000) ← needs vitrisans, nguoidungs [BATCH]

Phase 5 (Transactions)
├─ datsandichvus (500,000) ← needs datsans, dichvus [BATCH]
├─ danhgias (75,000) ← needs vitrisans, nguoidungs
└─ lichsuthanhtoans (210,000) ← needs datsans
```

---

## Verify Seeding Success

```sql
-- All tables present
SELECT COUNT(*) as total FROM (
  SELECT COUNT(*) FROM monchois UNION ALL
  SELECT COUNT(*) FROM santhethaos UNION ALL
  SELECT COUNT(*) FROM vitrisans UNION ALL
  SELECT COUNT(*) FROM datsans
) t;

-- Check referential integrity
SELECT COUNT(*) FROM vitrisans v 
WHERE v.id_san NOT IN (SELECT id FROM santhethaos);
-- Should return: 0

-- Check unique constraints
SELECT COUNT(*) FROM (
  SELECT email FROM nguoidungs GROUP BY email HAVING COUNT(*) > 1
) t;
-- Should return: 0
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Database not found | Check `.env` database name matches `DB_NAME` |
| Foreign key error | Run migrations first: `npx sequelize-cli db:migrate` |
| Duplicate key error | Clear and restart: `node seeders/index.js` (auto truncates) |
| Out of memory | Increase Node.js memory: `node --max-old-space-size=4096 seeders/index.js` |
| Connection timeout | Verify PostgreSQL is running: `psql -U postgres -c "SELECT 1"` |

---

## File Components

- **utils.js** - 25+ helper functions for data generation
- **01-05** - Master data (monchois, santhetha, vitrisan, dichvu, magiamgia)
- **06-09** - Users (admin, chusan, nhanvien, nguoidung)
- **10-12** - Transactions (datsan, datsandichvu, danhgia)
- **13-15** - Supporting (sukien, thongbao, lichsuthanhtoan)
- **index.js** - Orchestrator (controls execution order, error handling)

---

## Performance Notes

- **10k records/second** - Small tables (monchois, admins)
- **1k records/second** - Medium tables (dichvu, nhanvien)
- **300 records/second** - Large tables with batch processing (datsans)
- **Total duration** - 8-10 minutes for ~1.1 million records

Hardware requirements:
- Min 4GB RAM
- SSD recommended for 50% faster execution
- PostgreSQL on same machine reduces network latency

---

## Key Features

✅ **Deterministic** - Same results every run  
✅ **Batch Processing** - Handles 300k+ records without memory issues  
✅ **Error Recovery** - Continues if one seeder fails  
✅ **Referential Integrity** - All foreign keys properly linked  
✅ **Realistic Data** - Vietnamese names, locations, prices  
✅ **Uniqueness** - No duplicate emails or phone numbers  
✅ **Date Distribution** - Mix of past, present, future dates  
✅ **Status Tracking** - Progress logging for large tables  

---

## Advanced: Custom Record Counts

Edit seeder files to change record generation:

```javascript
// 09-nguoidung-seeder.js
const totalRecords = 50000; // Change from 30,000

// 10-datsan-seeder.js
const totalRecords = 500000; // Change from 300,000

// 11-datsandichvu-seeder.js
const totalRecords = 1000000; // Change from 500,000
```

Then run: `node seeders/index.js`

---

## SQL Queries for Testing

```sql
-- Find bookings by date range
SELECT COUNT(*) FROM datsans 
WHERE ngay_dat BETWEEN '2026-02-01' AND '2026-04-30';

-- Get user booking history
SELECT ds.id, ds.ngay_dat, ds.thanh_tien, m.ten_mon
FROM datsans ds
JOIN vitrisans v ON ds.id_vi_tri_dat_san = v.id
JOIN monchois m ON v.id_mon_choi = m.id
WHERE ds.id_nguoi_dung = 5000
ORDER BY ds.ngay_dat DESC;

-- Service usage statistics
SELECT d.ten_dich_vu, COUNT(*) as usage_count
FROM datsandichvus ds_dv
JOIN dichvus d ON ds_dv.id_dich_vu = d.id
GROUP BY d.ten_dich_vu
ORDER BY usage_count DESC
LIMIT 10;

-- Review ratings distribution
SELECT so_sao, COUNT(*) as count
FROM danhgias
GROUP BY so_sao
ORDER BY so_sao DESC;
```

---

**Need help?** Check `seeders/README.md` for detailed documentation
