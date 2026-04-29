const cron = require('node-cron');
const exportService = require('../services/exportService');

// Run export every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('🔄 Running scheduled data export...', new Date().toISOString());
  await exportService.exportAll();
});

// Run export every 6 hours (optional)
// cron.schedule('0 */6 * * *', async () => {
//   await exportService.exportAll();
// });

console.log('✅ Export scheduler started - will run daily at 2 AM');
