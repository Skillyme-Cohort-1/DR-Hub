const prisma = require('../lib/prisma');
const fs = require('fs');
const path = require('path');

const ALLOWED_DOCUMENT_STATUSES = ['APPROVED', 'PENDING', 'DECLINED'];

function buildAbsoluteUrl(req, value) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `${req.protocol}://${req.get('host')}${value}`;
}

function sanitizeDocument(document, req) {
  return {
    id: document.id,
    documentName: document.documentName,
    documentFile: document.documentFile,
    documentUrl: buildAbsoluteUrl(req, document.documentFile),
    downloadUrl: `${req.protocol}://${req.get('host')}/api/documents/${document.id}/download`,
    status: document.status,
    userId: document.userId,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

function isAdmin(authUser) {
  return authUser && authUser.role === 'ADMIN';
}

async function createDocument(req, res, next) {
  try {
    const { documentName, documentFile, status, userId } = req.body;

    const uploadedFilePath = req.file ? `/uploads/documents/${req.file.filename}` : null;
    const resolvedDocumentFile = uploadedFilePath || documentFile;

    if (!documentName || !resolvedDocumentFile) {
      return res.status(400).json({
        message: 'documentName and document file are required (send documentFile or upload document).',
      });
    }

    const ownerId = userId || req.authUser.id;
    if (!isAdmin(req.authUser) && ownerId !== req.authUser.id) {
      return res.status(403).json({ message: 'You cannot create documents for another user.' });
    }

    let normalizedStatus = 'PENDING';
    if (status !== undefined) {
      normalizedStatus = String(status).trim().toUpperCase();
      if (!ALLOWED_DOCUMENT_STATUSES.includes(normalizedStatus)) {
        return res.status(400).json({
          message: `status must be one of: ${ALLOWED_DOCUMENT_STATUSES.join(', ')}`,
        });
      }
    }

    const document = await prisma.userDocument.create({
      data: {
        documentName: String(documentName).trim(),
        documentFile: String(resolvedDocumentFile).trim(),
        status: normalizedStatus,
        userId: ownerId,
      },
    });

    return res.status(201).json({
      message: 'Document created successfully.',
      document: sanitizeDocument(document, req),
    });
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(400).json({ message: 'Invalid userId provided.' });
    }
    return next(error);
  }
}

async function getAllDocuments(req, res, next) {
  try {
    const { userId } = req.query;
    const where = {};

    if (isAdmin(req.authUser)) {
      if (userId) {
        where.userId = String(userId);
      }
    } else {
      where.userId = req.authUser.id;
    }

    const documents = await prisma.userDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      message: 'Documents fetched successfully.',
      count: documents.length,
      documents: documents.map((document) => sanitizeDocument(document, req)),
    });
  } catch (error) {
    return next(error);
  }
}

async function getDocumentById(req, res, next) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Document id is required.' });
    }

    const document = await prisma.userDocument.findUnique({ where: { id } });
    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    if (!isAdmin(req.authUser) && document.userId !== req.authUser.id) {
      return res.status(403).json({ message: 'You do not have permission to access this document.' });
    }

    return res.status(200).json({
      message: 'Document fetched successfully.',
      document: sanitizeDocument(document, req),
    });
  } catch (error) {
    return next(error);
  }
}

async function updateDocument(req, res, next) {
  try {
    const { id } = req.params;
    const { documentName, documentFile, status } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Document id is required.' });
    }

    const existing = await prisma.userDocument.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    if (!isAdmin(req.authUser) && existing.userId !== req.authUser.id) {
      return res.status(403).json({ message: 'You do not have permission to update this document.' });
    }

    const data = {};
    if (documentName !== undefined) data.documentName = String(documentName).trim();
    if (documentFile !== undefined) data.documentFile = String(documentFile).trim();
    if (req.file) data.documentFile = `/uploads/documents/${req.file.filename}`;
    if (status !== undefined) {
      const normalizedStatus = String(status).trim().toUpperCase();
      if (!ALLOWED_DOCUMENT_STATUSES.includes(normalizedStatus)) {
        return res.status(400).json({
          message: `status must be one of: ${ALLOWED_DOCUMENT_STATUSES.join(', ')}`,
        });
      }
      data.status = normalizedStatus;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Provide at least one field to update.' });
    }

    const document = await prisma.userDocument.update({
      where: { id },
      data,
    });

    if (req.file && existing.documentFile && existing.documentFile.startsWith('/uploads/documents/')) {
      const oldFilePath = path.join(process.cwd(), existing.documentFile.replace(/^\//, ''));
      fs.promises.unlink(oldFilePath).catch(() => {});
    }

    return res.status(200).json({
      message: 'Document updated successfully.',
      document: sanitizeDocument(document, req),
    });
  } catch (error) {
    return next(error);
  }
}

async function downloadDocument(req, res, next) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Document id is required.' });
    }

    const document = await prisma.userDocument.findUnique({ where: { id } });
    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    if (!isAdmin(req.authUser) && document.userId !== req.authUser.id) {
      return res.status(403).json({ message: 'You do not have permission to download this document.' });
    }

    if (!document.documentFile.startsWith('/uploads/documents/')) {
      return res.status(400).json({
        message: 'This document uses an external URL. Use documentUrl to download it.',
      });
    }

    const filePath = path.join(process.cwd(), document.documentFile.replace(/^\//, ''));
    const fileName = path.basename(filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Document file not found on server.' });
    }

    return res.download(filePath, fileName);
  } catch (error) {
    return next(error);
  }
}

async function deleteDocument(req, res, next) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Document id is required.' });
    }

    const existing = await prisma.userDocument.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    if (!isAdmin(req.authUser) && existing.userId !== req.authUser.id) {
      return res.status(403).json({ message: 'You do not have permission to delete this document.' });
    }

    await prisma.userDocument.delete({ where: { id } });

    if (existing.documentFile && existing.documentFile.startsWith('/uploads/documents/')) {
      const filePath = path.join(process.cwd(), existing.documentFile.replace(/^\//, ''));
      fs.promises.unlink(filePath).catch(() => {});
    }

    return res.status(200).json({ message: 'Document deleted successfully.' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  downloadDocument,
  deleteDocument,
};
