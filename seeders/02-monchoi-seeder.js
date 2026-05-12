/**
 * Seeder: Game Types (Môn Chơi)
 * Master data - 7 records
 * Dependencies: None
 */
const { getGameTypes } = require('./utils');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const games = getGameTypes();
    
    const records = games.map((game, index) => ({
      ten_mon: game.name,
      mo_ta: game.description,
      tinh_trang: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await queryInterface.bulkInsert('monchois', records);
    console.log(`✓ Seeded ${records.length} game types`);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('monchois', null, {});
  }
};
