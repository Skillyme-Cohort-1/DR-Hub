const express = require('express');
const {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  downloadDocument,
  deleteDocument,
} = require('../controllers/documentController');
const { requireAuth } = require('../middleware/authMiddleware');
const { uploadDocument } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(requireAuth);

router.post('/', uploadDocument.single('document'), createDocument);
router.get('/', getAllDocuments);
router.get('/:id', getDocumentById);
router.get('/:id/download', downloadDocument);
router.patch('/:id', uploadDocument.single('document'), updateDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
