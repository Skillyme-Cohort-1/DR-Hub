const express = require('express');
const router = express.Router();
const exportService = require('../services/exportService');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.post('/all', requireAuth, requireAdmin, async (req, res) => {
  try {
    const results = await exportService.exportAll();
    res.json({ 
      success: true, 
      message: 'Export completed successfully',
      data: results 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;