/**
 * Seeder Orchestrator (FIXED VERSION)
 * - Auto detect seeders
 * - Safe model lookup
 * - Better error handling
 * - No hard dependency on file naming
 */

const fs = require('fs');
const path = require('path');
const db = require('../models');
const Sequelize = require('sequelize');

const SEEDERS_DIR = __dirname;

// ================= SAFE MODEL RESOLVER =================
function getModel(modelName) {
  const models = db.sequelize.models;

  // try exact match
  if (models[modelName]) return models[modelName];

  // try lowercase
  const lower = modelName.toLowerCase();
  for (const key of Object.keys(models)) {
    if (key.toLowerCase() === lower) return models[key];
  }

  return null;
}

// ================= AUTO LOAD SEEDERS =================
function loadSeeders() {
  const files = fs
    .readdirSync(SEEDERS_DIR)
    .filter(f =>
      f.endsWith('-seeder.js') &&
      f !== 'index.js'
    )
    .sort(); // ensure order by name

  return files.map(file => ({
    name: file.replace('.js', ''),
    filePath: path.join(SEEDERS_DIR, file)
  }));
}

// ================= TRUNCATE SAFELY =================
async function truncateAll() {
  console.log('\n📋 Truncating tables...\n');

  const models = db.sequelize.models;

  for (const modelName of Object.keys(models)) {
    try {
      await models[modelName].destroy({
        where: {},
        truncate: true,
        cascade: true,
        force: true
      });

      console.log(`✓ Truncated ${modelName}`);
    } catch (err) {
      console.log(`⚠ Skip ${modelName}: ${err.message}`);
    }
  }

  console.log('');
}

// ================= RUN SINGLE SEEDER =================
async function runSeeder(filePath, name) {
  const seeder = require(filePath);

  if (!seeder.up) {
    throw new Error(`${name} missing "up" function`);
  }

  const queryInterface = db.sequelize.getQueryInterface();

  await seeder.up(queryInterface, Sequelize);
}

// ================= MAIN RUNNER =================
async function runAll() {
  console.log('\n====================================');
  console.log('🌱 SEEDER ORCHESTRATOR (FIXED)');
  console.log('====================================\n');

  const seeders = loadSeeders();

  console.log(`📦 Found ${seeders.length} seeders\n`);

  try {
    // STEP 1: truncate
    await truncateAll();

    // STEP 2: run seeders
    for (let i = 0; i < seeders.length; i++) {
      const s = seeders[i];

      console.log(`[${i + 1}/${seeders.length}] Seeding: ${s.name}`);

      const start = Date.now();

      await runSeeder(s.filePath, s.name);

      const time = ((Date.now() - start) / 1000).toFixed(2);
      console.log(`✓ Done in ${time}s\n`);
    }

    console.log('\n🎉 ALL SEEDERS COMPLETED SUCCESSFULLY\n');

  } catch (err) {
    console.error('\n❌ SEEDING FAILED');
    console.error(err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await db.sequelize.close();
  }
}

// RUN
runAll();