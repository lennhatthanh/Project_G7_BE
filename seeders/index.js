/**
 * Main Seeder Orchestrator
 * 
 * This script runs all seeders in the correct dependency order.
 * It handles:
 * - Truncating tables before seeding
 * - Sequential execution of seeders
 * - Batch processing for large datasets
 * - Error handling and progress tracking
 * 
 * Usage:
 *   node seeders/index.js
 * 
 * Duration: ~5-10 minutes for full dataset (300k+ bookings)
 */

const path = require('path');
const db = require('../models');
const Sequelize = require('sequelize');

// Define execution order based on dependencies
const SEEDER_EXECUTION_ORDER = [
  // Phase 1: No dependencies (master data foundations)
  { name: '01-monchoi-seeder', label: 'Game Types' },
  { name: '07-chusan-seeder', label: 'Court Owners' },
  { name: '06-admin-seeder', label: 'Administrators' },
  { name: '09-nguoidung-seeder', label: 'End Users' },

  // Phase 2: Depends on Phase 1
  { name: '02-santhetha-seeder', label: 'Sports Courts' },
  { name: '08-nhanvien-seeder', label: 'Court Staff' },

  // Phase 3: Depends on Phase 2
  { name: '03-vitrisan-seeder', label: 'Court Positions' },
  { name: '04-dichvu-seeder', label: 'Services' },
  { name: '05-magiamgia-seeder', label: 'Discount Codes' },
  { name: '13-sukien-seeder', label: 'Events' },
  { name: '14-thongbao-seeder', label: 'Announcements' },

  // Phase 4: Depends on Phase 3 + Phase 1 users
  { name: '10-datsan-seeder', label: 'Bookings (300k)' },

  // Phase 5: Depends on Phase 4
  { name: '11-datsandichvu-seeder', label: 'Booking-Services (500k)' },
  { name: '12-danhgia-seeder', label: 'Reviews' },
  { name: '15-lichsuthanhtoan-seeder', label: 'Payment History' }
];

// Models to truncate
const MODELS_TO_TRUNCATE = [
  'monchoi',
  'chusan',
  'admin',
  'nguoidung',
  'santhetha',
  'nhanvien',
  'vitrisan',
  'dichvu',
  'magiamgia',
  'sukien',
  'thongbao',
  'datsan',
  'datsandichvu',
  'danhgia',
  'lichsuthanhtoan'
];

/**
 * Truncate a table
 */
async function truncateTable(modelName) {
  try {
    const model = db[modelName];
    if (!model) {
      console.log(`⚠ Model ${modelName} not found, skipping truncate`);
      return;
    }
    await model.destroy({ where: {}, truncate: true, cascade: true });
    console.log(`✓ Truncated ${modelName}`);
  } catch (error) {
    console.error(`✗ Error truncating ${modelName}:`, error.message);
    throw error;
  }
}

/**
 * Run a single seeder
 */
async function runSeeder(seederFile) {
  try {
    const seederPath = path.join(__dirname, seederFile + '.js');
    const seeder = require(seederPath);
    
    // Get queryInterface from sequelize instance
    const queryInterface = db.sequelize.getQueryInterface();
    
    // Run the seeder's up function
    await seeder.up(queryInterface, Sequelize);
    
  } catch (error) {
    console.error(`✗ Error in seeder ${seederFile}:`, error.message);
    throw error;
  }
}

/**
 * Main orchestration function
 */
async function runAllSeeders() {
  const startTime = Date.now();
  let completed = 0;
  let failed = 0;

  try {
    console.log('\n' + '='.repeat(70));
    console.log('🌱 SPORTS COURT BOOKING SYSTEM - SEEDER ORCHESTRATOR');
    console.log('='.repeat(70) + '\n');

    // Phase 0: Truncate all tables
    console.log('📋 PHASE 0: Truncating existing data...\n');
    for (const modelName of MODELS_TO_TRUNCATE) {
      await truncateTable(modelName);
    }
    console.log('');

    // Phase 1-5: Run seeders in order
    for (let i = 0; i < SEEDER_EXECUTION_ORDER.length; i++) {
      const seederConfig = SEEDER_EXECUTION_ORDER[i];
      const phaseNum = Math.floor(i / 4) + 1;
      const phaseLabel = 
        phaseNum === 1 ? 'Master Data Foundations' :
        phaseNum === 2 ? 'Master Data Dependencies' :
        phaseNum === 3 ? 'Court Facilities' :
        phaseNum === 4 ? 'Booking Data' :
        phaseNum === 5 ? 'Transaction Data' :
        'Other';

      const stepNum = (i % 4) + 1;
      
      try {
        console.log(`[PHASE ${phaseNum}/${5}] (${stepNum}/4) 🔄 Seeding ${seederConfig.label}...`);
        const stepStart = Date.now();
        
        await runSeeder(seederConfig.name);
        
        const stepDuration = ((Date.now() - stepStart) / 1000).toFixed(2);
        console.log(`✅ Completed in ${stepDuration}s\n`);
        completed++;
      } catch (error) {
        console.error(`❌ Failed with error: ${error.message}\n`);
        failed++;
        // Continue to next seeder instead of stopping
      }
    }

    // Final summary
    const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
    console.log('='.repeat(70));
    console.log('📊 SEEDING SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Completed: ${completed}/${SEEDER_EXECUTION_ORDER.length}`);
    console.log(`❌ Failed: ${failed}/${SEEDER_EXECUTION_ORDER.length}`);
    console.log(`⏱️  Total Time: ${totalTime} minutes`);
    console.log('='.repeat(70) + '\n');

    if (failed === 0) {
      console.log('🎉 All seeders completed successfully!');
      console.log('\n📈 Expected Record Counts:');
      console.log('   - monchois: 7');
      console.log('   - santhethaos: 750');
      console.log('   - vitrisans: 3,500');
      console.log('   - dichvus: 1,500');
      console.log('   - magiamgias: 250');
      console.log('   - chusans: 500');
      console.log('   - nhanviens: 1,500');
      console.log('   - nguoidungs: 30,000');
      console.log('   - admins: 5');
      console.log('   - datsans: 300,000');
      console.log('   - datsandichvus: 500,000');
      console.log('   - danhgias: 75,000');
      console.log('   - sukiens: 500');
      console.log('   - thongbaos: 1,500');
      console.log('   - lichsuthanhtoans: ~210,000 (70% of confirmed bookings)');
      console.log('\n💾 Total Estimated Records: ~1.1 million');
      console.log('\n🧪 Verification Queries:');
      console.log('   SELECT COUNT(*) FROM monchois;');
      console.log('   SELECT COUNT(*) FROM datsans;');
      console.log('   SELECT COUNT(*) FROM datsandichvus;');
      console.log('');
    } else {
      console.log(`⚠️  Some seeders failed. Check errors above.`);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n🔴 FATAL ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Close database connection
    await db.sequelize.close();
  }
}

// Run the seeder
runAllSeeders();
