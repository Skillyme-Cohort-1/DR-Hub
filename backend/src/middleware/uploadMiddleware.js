const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadsDir = path.join(process.cwd(), 'uploads', 'documents');
fs.mkdirSync(uploadsDir, { recursive: true });

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
    fileSize: 20 * 1024 * 1024,
  },
});

module.exports = {
  uploadDocument,
};
