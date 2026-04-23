# Sports Court Booking System - Seeder Guide

## 📋 Overview

This seeder system generates ~1.1 million fake records across 15 tables for testing and performance benchmarking. The data includes complete relationships and realistic values for a Vietnamese sports court booking platform.

## 📊 Generated Record Summary

| Table | Records | Purpose |
|-------|---------|---------|
| **Master Data** |  |  |
| `monchois` | 7 | Game types (Bóng đá, Tennis, Cầu lông, etc.) |
| `santhethaos` | 750 | Sports courts across Da Nang & nearby provinces |
| `vitrisans` | 3,500 | Court positions/spots (5-10 per court) |
| `dichvus` | 1,500 | Court services (food, towels, coaching, etc.) |
| `magiamgias` | 250 | Discount codes & promotions |
| **Users** |  |  |
| `chusans` | 500 | Court owners |
| `nhanviens` | 1,500 | Court staff (2-3 per court) |
| `nguoidungs` | 30,000 | End users for testing login/search |
| `admins` | 5 | System administrators |
| **Transactions** |  |  |
| `datsans` | 300,000 | Court bookings (70% confirmed, 30% pending) |
| `datsandichvus` | 500,000 | Booking-service relationships |
| `danhgias` | 75,000 | Reviews/ratings (~25% of bookings) |
| `lichsuthanhtoans` | ~210,000 | Payment history (confirmed bookings only) |
| **Supporting** |  |  |
| `sukiens` | 500 | Events (tournaments, special hours) |
| `thongbaos` | 1,500 | Announcements from courts |
| | | |
| **TOTAL** | **~1.1 million** | **Full dataset for performance testing** |

## 🚀 Quick Start

### Prerequisites

1. **PostgreSQL database** - Must be running and configured
2. **Environment variables** - Must be set in `.env` file
3. **Node.js modules** - `faker.js` already installed

### Step 1: Verify Database Configuration

Ensure your `.env` file contains:

```
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_HOST=localhost
DB_PORT=5432
DB_DIALECT=postgres
```

### Step 2: Run Migrations (if not already done)

```bash
npx sequelize-cli db:migrate
```

### Step 3: Run the Seeder

From the project root:

```bash
node seeders/index.js
```

**Expected output:**
- Truncates all tables
- Seeds in 5 phases (~5-10 minutes depending on hardware)
- Shows progress for each table
- Summary at the end with record counts

## 📈 Execution Timeline

| Phase | Tables | Duration | Purpose |
|-------|--------|----------|---------|
| 1 | monchois, chusans, admins, nguoidungs | ~30s | Foundation tables |
| 2 | santhetha, nhanviens | ~20s | Dependencies on Phase 1 |
| 3 | vitrisan, dichvu, magiamgia, sukien, thongbao | ~2m | Facility master data |
| 4 | datsans (300k records) | ~2-3m | **BATCH PROCESSING - largest table** |
| 5 | datsandichvu (500k), danhgia, lichsuthanhtoan | ~3-4m | **BATCH PROCESSING - biggest table** |
| | **TOTAL** | **~8-10 minutes** | Full seed complete |

### Why It Takes Time
- **10-datsan-seeder.js**: 300,000 records × 1,000 per batch = 300 batches
- **11-datsandichvu-seeder.js**: 500,000 records × 5,000 per batch = 100 batches
- Batch processing prevents memory exhaustion on large datasets

## 🔍 Verification

After seeding completes, verify data integrity:

```sql
-- Check record counts
SELECT COUNT(*) FROM monchois;              -- Should be: 7
SELECT COUNT(*) FROM santhethaos;           -- Should be: 750
SELECT COUNT(*) FROM vitrisans;             -- Should be: 3,500
SELECT COUNT(*) FROM datsans;               -- Should be: 300,000
SELECT COUNT(*) FROM datsandichvus;         -- Should be: 500,000

-- Check foreign key relationships
SELECT COUNT(*) FROM vitrisans WHERE id_san NOT IN (SELECT id FROM santhethaos);
-- Should return: 0 (no orphaned records)

SELECT COUNT(*) FROM datsans WHERE id_vi_tri_dat_san NOT IN (SELECT id FROM vitrisans);
-- Should return: 0 (no orphaned records)

-- Check unique constraints
SELECT email, COUNT(*) FROM nguoidungs GROUP BY email HAVING COUNT(*) > 1;
-- Should return: empty (no duplicates)

-- Check date ranges
SELECT MIN(ngay_dat), MAX(ngay_dat) FROM datsans;
-- Should show: past 3 months to future 3 months
```

## 📚 File Structure

```
seeders/
├── utils.js                       # Shared utilities & helpers
│   ├── generateEmail()            # Deterministic email generation
│   ├── generatePhone()            # Deterministic phone generation
│   ├── randomDateBetween()        # Date utilities
│   ├── batchInsert()              # Batch processing for large tables
│   └── ... (20+ helper functions)
│
├── 01-monchoi-seeder.js          # Game types (7 records)
├── 02-santhetha-seeder.js        # Sports courts (750 records)
├── 03-vitrisan-seeder.js         # Court positions (3,500 records)
├── 04-dichvu-seeder.js           # Services (1,500 records)
├── 05-magiamgia-seeder.js        # Discounts (250 records)
├── 06-admin-seeder.js            # Admins (5 records)
├── 07-chusan-seeder.js           # Court owners (500 records)
├── 08-nhanvien-seeder.js         # Staff (1,500 records)
├── 09-nguoidung-seeder.js        # Users (30,000 records)
├── 10-datsan-seeder.js           # Bookings (300,000 records) [BATCH]
├── 11-datsandichvu-seeder.js     # Booking-services (500,000) [BATCH]
├── 12-danhgia-seeder.js          # Reviews (75,000 records)
├── 13-sukien-seeder.js           # Events (500 records)
├── 14-thongbao-seeder.js         # Announcements (1,500 records)
├── 15-lichsuthanhtoan-seeder.js  # Payment history (210,000)
│
└── index.js                       # Orchestrator (runs all seeders in order)
```

## 🔐 Test Account Credentials

After seeding, you can use these test accounts to verify the system:

### Administrator
- Email: `admin0@sportsbook.vn`
- Password: `Admin@123456`

### Court Owner
- Email: `chusan0@sportsbook.vn`
- Password: `Owner@123456`

### Staff
- Email: `nhanvien0@sportsbook.vn`
- Password: `Staff@123456`

### End User
- Email: `user0@sportsbook.vn`
- Password: `User@123456`

**Pattern**: Replace `0` with `1`, `2`, `3`, ... up to `499` (chusans), `1499` (nhanviens), `29999` (users)

## 🧪 Performance Testing

### Before/After Index Comparison

Run these queries to see the impact of indexes:

#### Query 1: Find all bookings for a specific date
```sql
-- WITH INDEX: <100ms
-- WITHOUT INDEX: >1000ms
SELECT * FROM datsans 
WHERE ngay_dat = '2026-04-15' 
LIMIT 100;
```

#### Query 2: Find user by email
```sql
-- WITH INDEX: <10ms
-- WITHOUT INDEX: >500ms
SELECT * FROM nguoidungs 
WHERE email = 'user1000@sportsbook.vn';
```

#### Query 3: Get booking history for a user
```sql
-- WITH INDEX: <50ms
-- WITHOUT INDEX: >2000ms
SELECT ds.*, v.so_san, m.ten_mon
FROM datsans ds
JOIN vitrisans v ON ds.id_vi_tri_dat_san = v.id
JOIN monchois m ON v.id_mon_choi = m.id
WHERE ds.id_nguoi_dung = 1000
ORDER BY ds.ngay_dat DESC;
```

## 🛠️ Advanced Usage

### Reseed Only Specific Tables

Edit `seeders/index.js` and modify `SEEDER_EXECUTION_ORDER`:

```javascript
const SEEDER_EXECUTION_ORDER = [
  { name: '10-datsan-seeder', label: 'Court Bookings' },
  // Remove other seeders to skip them
];
```

### Adjust Record Counts

Edit individual seeder files. Example for `09-nguoidung-seeder.js`:

```javascript
const totalRecords = 50000; // Change from 30,000 to 50,000
```

### Custom Batch Size

Edit `datsandichvu-seeder.js`:

```javascript
const batchSize = 10000; // Increase from 5,000 if your system has more RAM
```

## ⚙️ System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 4GB | 8GB+ |
| Disk Space | 5GB | 10GB+ |
| Database Storage | 2GB | 5GB+ |
| Execution Time | 15 minutes | 8-10 minutes (SSD + 8GB RAM) |

**Note**: First run with 30k users/300k bookings takes ~10min. Subsequent runs are faster due to warm disk cache.

## 🐛 Troubleshooting

### Error: "No chusans found. Please seed chusans first."

**Problem**: Seeders ran out of order or were interrupted

**Solution**: 
```bash
# Clear database and restart
npx sequelize-cli db:seed:undo:all
node seeders/index.js
```

### Error: "duplicate key value violates unique constraint"

**Problem**: Seeder ran twice without truncating tables

**Solution**: The orchestrator truncates tables automatically. If issue persists:
```sql
-- Manual cleanup
DELETE FROM datsandichvus;
DELETE FROM datsans;
DELETE FROM nguoidungs;
DELETE FROM vitrisans;
DELETE FROM santhethaos;
DELETE FROM dichvus;
DELETE FROM magiamgias;
DELETE FROM nhanviens;
DELETE FROM chusans;
DELETE FROM sukiens;
DELETE FROM thongbaos;
DELETE FROM danhgias;
DELETE FROM lichsuthanhtoans;
DELETE FROM monchois;
DELETE FROM admins;
```

### Memory Issues on Windows

**Problem**: "JavaScript heap out of memory"

**Solution**: Increase Node.js memory limit
```bash
node --max-old-space-size=4096 seeders/index.js
```

## 📝 Customization Guide

### Add More Game Types

Edit `seeders/utils.js`:

```javascript
function getGameTypes() {
  return [
    // ... existing games
    { name: 'Pickleball', description: 'Trò chơi mới nổi' },
  ];
}
```

### Change Location Data

Edit `seeders/utils.js`:

```javascript
function getDistricts() {
  return [
    'Quận 1', // Ho Chi Minh
    'Quận 2',
    'Quận 3',
    // ... more districts
  ];
}
```

### Adjust Price Ranges

Edit `seeders/utils.js`:

```javascript
function randomPrice(type = 'court') {
  if (type === 'court') {
    return Math.floor(Math.random() * 200000 + 20000); // 20k-220k VND
  }
}
```

## 📞 Support

If you encounter issues:

1. Check database is running: `psql -U postgres -c "SELECT 1"`
2. Verify migrations: `npx sequelize-cli db:migrate:status`
3. Check `.env` configuration
4. Review error message in console for specific table
5. Inspect seeder files matching error message

## 🎯 Next Steps

After seeding:

1. ✅ Test login with seeded user accounts
2. ✅ Run booking query performance tests (with/without indexes)
3. ✅ Test search functionality (user search, booking search)
4. ✅ Verify relationships (join queries)
5. ✅ Check pagination on large result sets (datsans, datsandichvus)
6. ✅ Profile slow queries and add indexes if needed

---

**Last Updated**: April 23, 2026  
**Total Records**: ~1.1 million  
**Estimated Execution Time**: 8-10 minutes  
**Database Size**: ~2-3 GB
