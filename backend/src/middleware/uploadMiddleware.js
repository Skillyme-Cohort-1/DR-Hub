const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadsDir = path.join(process.cwd(), 'uploads', 'documents');
fs.mkdirSync(uploadsDir, { recursive: true });
const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname || '');
    const safeBase = path
      .basename(file.originalname || 'document', extension)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .slice(0, 50);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${safeBase || 'document'}-${unique}${extension}`);
  },
});

const uploadDocument = multer({
  storage,
  limits: {
    fileSize: MAX_DOCUMENT_SIZE_BYTES,
  },
});

function uploadBookingDocuments(req, res, next) {
  const uploader = uploadDocument.fields([
    { name: 'documents', maxCount: 10 },
    { name: 'documents[]', maxCount: 10 }
  ]);

  uploader(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: 'Each document must be 10MB or less.'
        });
      }

      return res.status(400).json({
        message: `Upload error: ${error.message}`
      });
    }

    return next(error);
  });
}

module.exports = {
  uploadDocument,
  uploadBookingDocuments,
  MAX_DOCUMENT_SIZE_BYTES
};
