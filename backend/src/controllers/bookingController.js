const bookingService = require('../services/bookingService');
const fs = require('fs');
const path = require('path');
const {
    createBookingSchema,
    createNonUserBookingSchema,
    createAdminUserBookingSchema,
    availabilitySchema,
    cancelBookingSchema,
    validate
} = require('../validators/bookingValidator');

const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;
const uploadsDir = path.join(process.cwd(), 'uploads', 'documents');
fs.mkdirSync(uploadsDir, { recursive: true });

function isAdmin(authUser) {
    return authUser && authUser.role === 'ADMIN';
}

function safeFileName(name, fallback = 'document') {
    return String(name || fallback)
        .replace(/[^a-zA-Z0-9._-]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80);
}

function normalizeBase64Input(value) {
    const raw = String(value || '').trim();
    const parts = raw.split(',');
    return parts.length > 1 ? parts[parts.length - 1] : raw;
}

async function mapBodyDocumentsToStoredFiles(documents) {
    if (!Array.isArray(documents)) return [];

    const normalized = [];
    for (const doc of documents) {
        if (!doc || typeof doc !== 'object') continue;

        if (doc.documentName && doc.documentFile) {
            normalized.push({
                documentName: String(doc.documentName).trim(),
                documentFile: String(doc.documentFile).trim()
            });
            continue;
        }

        const documentName = String(doc.name || doc.documentName || 'Document').trim();
        const contentBase64 = doc.contentBase64;

        if (!contentBase64) continue;

        let buffer;
        try {
            buffer = Buffer.from(normalizeBase64Input(contentBase64), 'base64');
        } catch (_error) {
            throw new Error('INVALID_DOCUMENT_BASE64');
        }

        if (!buffer || buffer.length === 0) {
            throw new Error('INVALID_DOCUMENT_BASE64');
        }

        if (buffer.length > MAX_DOCUMENT_SIZE_BYTES) {
            throw new Error('DOCUMENT_TOO_LARGE');
        }

        const originalName = safeFileName(doc.fileName || `${documentName}.bin`);
        const extension = path.extname(originalName);
        const baseName = path.basename(originalName, extension) || 'document';
        const fileName = `${baseName}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
        const filePath = path.join(uploadsDir, fileName);

        await fs.promises.writeFile(filePath, buffer);

        normalized.push({
            documentName,
            documentFile: `/uploads/documents/${fileName}`
        });
    }

    return normalized;
}

// Check availability
async function checkAvailability(req, res, next) {
    try {
        const query = { ...req.query };

        const { success, data, errors } = validate(availabilitySchema, query);
        if (!success) {
            return res.status(400).json({ message: 'Validation failed.', errors });
        }

        const result = await bookingService.checkAvailability(data);

        return res.status(200).json({
            message: 'Availability checked successfully.',
            available: result.available,
            roomId: result.roomId,
            date: result.date,
            slot: result.slot,
            ...(result.reason && { reason: result.reason })
        });
    } catch (error) {
        return next(error);
    }
}

// Create booking
async function createBooking(req, res, next) {
    try {
        const { success, data, errors } = validate(createBookingSchema, req.body);
        if (!success) {
            return res.status(400).json({ message: 'Validation failed.', errors });
        }

        const booking = await bookingService.createBooking({
            ...data,
            userId: req.authUser.id
        });

        return res.status(201).json({
            message: 'Booking created successfully.',
            booking
        });
    } catch (error) {
        if (error.message === 'ROOM_NOT_FOUND') {
            return res.status(404).json({ message: 'Room not found.' });
        }
        if (error.message === 'ROOM_INACTIVE') {
            return res.status(400).json({ message: 'This room is no longer available for booking.' });
        }
        if (error.message === 'SLOT_UNAVAILABLE') {
            return res.status(409).json({ message: 'This slot is already booked.' });
        }
        if (error.message === 'SLOT_NOT_FOUND') {
            return res.status(404).json({ message: 'Slot not found for this room.' });
        }
        if (error.message === 'SLOT_DATE_MISMATCH') {
            return res.status(400).json({ message: 'Selected slot does not belong to the provided booking date.' });
        }
        if (error.message === 'SLOT_BLOCKED') {
            return res.status(400).json({ message: 'Selected slot is currently blocked.' });
        }
        if (error.message === 'USER_NOT_ACTIVE') {
            return res.status(403).json({ message: 'Your account is not active. Please contact support.' });
        }
        if (error.message === 'USER_NOT_FOUND') {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (error.message === 'NO_APPROVED_DOCUMENT') {
            return res.status(403).json({ message: 'You must have an approved qualification document before booking.' });
        }
        if (error.message === 'INVALID_TOTAL_COST') {
            return res.status(400).json({ message: 'Provided totalCost does not match the room cost.' });
        }
        if (error.message === 'ROOM_COST_NOT_SET') {
            return res.status(400).json({ message: 'This room does not have a price set. Please contact support.' });
        }
        return next(error);
    }
}

async function nonUserBooking(req, res, next) {
    try {
        let parsedDocumentsFromBody = [];
        if (typeof req.body.documents === 'string') {
            try {
                parsedDocumentsFromBody = JSON.parse(req.body.documents);
            } catch (_error) {
                return res.status(400).json({ message: 'documents must be a valid JSON array.' });
            }
        } else if (Array.isArray(req.body.documents)) {
            parsedDocumentsFromBody = req.body.documents;
        }

        const uploadedFiles = Array.isArray(req.files)
            ? req.files
            : [
                ...((req.files && req.files.documents) || []),
                ...((req.files && req.files['documents[]']) || [])
            ];

        const uploadedDocuments = uploadedFiles.map((file) => ({
            documentName: file.originalname || 'Document',
            documentFile: `/uploads/documents/${file.filename}`
        }));

        const storedBodyDocuments = await mapBodyDocumentsToStoredFiles(parsedDocumentsFromBody);

        const payload = {
            ...req.body,
            documents: [...storedBodyDocuments, ...uploadedDocuments]
        };

        const { success, data, errors } = validate(createNonUserBookingSchema, payload);
        if (!success) {
            return res.status(400).json({ message: 'Validation failed.', errors });
        }

        const booking = await bookingService.createNonUserBooking(data);

        return res.status(201).json({
            message: 'Booking created successfully.',
            booking
        });
    } catch (error) {
        if (error.message === 'INVALID_DOCUMENT_BASE64') {
            return res.status(400).json({ message: 'One or more documents have invalid base64 content.' });
        }
        if (error.message === 'DOCUMENT_TOO_LARGE') {
            return res.status(400).json({ message: 'Each document must be 10MB or less.' });
        }
        if (error.message === 'ROOM_NOT_FOUND') {
            return res.status(404).json({ message: 'Room not found.' });
        }
        if (error.message === 'ROOM_INACTIVE') {
            return res.status(400).json({ message: 'This room is no longer available for booking.' });
        }
        if (error.message === 'SLOT_NOT_FOUND') {
            return res.status(404).json({ message: 'Slot not found for this room and date.' });
        }
        if (error.message === 'SLOT_DATE_MISMATCH') {
            return res.status(400).json({ message: 'Selected slot does not belong to the provided booking date.' });
        }
        if (error.message === 'SLOT_UNAVAILABLE') {
            return res.status(409).json({ message: 'This slot is already booked.' });
        }
        if (error.message === 'PHONE_NUMBER_IN_USE') {
            return res.status(409).json({ message: 'Phone number is already associated with another account.' });
        }
        return next(error);
    }
}

async function adminUserBooking(req, res, next) {
    try {
        const { success, data, errors } = validate(createAdminUserBookingSchema, req.body);
        if (!success) {
            return res.status(400).json({ message: 'Validation failed.', errors });
        }

        const booking = await bookingService.createAdminUserBooking(data);

        return res.status(201).json({
            message: 'Booking created successfully.',
            booking
        });
    } catch (error) {
        if (error.message === 'ROOM_NOT_FOUND') {
            return res.status(404).json({ message: 'Room not found.' });
        }
        if (error.message === 'ROOM_INACTIVE') {
            return res.status(400).json({ message: 'This room is no longer available for booking.' });
        }
        if (error.message === 'USER_NOT_FOUND') {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (error.message === 'USER_NOT_ACTIVE') {
            return res.status(400).json({ message: 'Selected user is not active.' });
        }
        if (error.message === 'SLOT_NOT_FOUND') {
            return res.status(404).json({ message: 'Slot not found for this room.' });
        }
        if (error.message === 'SLOT_DATE_MISMATCH') {
            return res.status(400).json({ message: 'Selected slot does not belong to the provided booking date.' });
        }
        if (error.message === 'SLOT_UNAVAILABLE') {
            return res.status(409).json({ message: 'This slot is already booked.' });
        }
        return next(error);
    }
}

// Get my bookings
async function getMyBookings(req, res, next) {
    try {
        const userId = req.authUser.id;
        const bookings = await bookingService.getBookingsByUser(userId);

        return res.status(200).json({
            message: 'Bookings fetched successfully.',
            count: bookings.length,
            bookings
        });
    } catch (error) {
        return next(error);
    }
}

// Get booking by ID
async function getBookingById(req, res, next) {
    try {
        const { id } = req.params;
        const booking = await bookingService.getBookingById(id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        // Ownership check
        if (!isAdmin(req.authUser) && booking.userId !== req.authUser.id) {
            return res.status(403).json({
                message: 'You do not have permission to view this booking.'
            });
        }

        return res.status(200).json({
            message: 'Booking fetched successfully.',
            booking
        });
    } catch (error) {
        return next(error);
    }
}

// Cancel booking
async function cancelBooking(req, res, next) {
    try {
        const { id } = req.params;

        const { success, data, errors } = validate(cancelBookingSchema, req.body);
        if (!success) {
            return res.status(400).json({ message: 'Validation failed.', errors });
        }

        const existing = await bookingService.getBookingById(id);
        if (!existing) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        // Ownership check
        if (!isAdmin(req.authUser) && existing.userId !== req.authUser.id) {
            return res.status(403).json({
                message: 'You do not have permission to cancel this booking.'
            });
        }

        const booking = await bookingService.cancelBooking({
            bookingId: id,
            reason: data.reason,
            cancelledBy: req.authUser.id
        });

        return res.status(200).json({
            message: 'Booking cancelled successfully.',
            booking
        });
    } catch (error) {
        if (error.message === 'BOOKING_ALREADY_CANCELLED') {
            return res.status(400).json({ message: 'This booking is already cancelled.' });
        }
        if (error.message === 'BOOKING_COMPLETED') {
            return res.status(400).json({ message: 'A completed booking cannot be cancelled.' });
        }
        if (error.message === 'CANCELLATION_WINDOW_EXPIRED') {
            return res.status(400).json({ message: 'This booking can no longer be cancelled. Contact DR Hub directly.' });
        }
        return next(error);
    }
}

// Get all bookings - Admin only
async function getAllBookings(req, res, next) {
    try {
        const { status, roomId, date } = { ...req.query };

        const bookings = await bookingService.getAllBookings({
            status,
            roomId,
            date
        });

        return res.status(200).json({
            message: 'Bookings fetched successfully.',
            count: bookings.length,
            bookings
        });
    } catch (error) {
        return next(error);
    }
}

// Update booking status - Admin only
async function updateBookingStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = bookingService.BOOKING_STATUSES;
        const normalizedStatus = bookingService.normalizeBookingStatus(status);
        if (!normalizedStatus || !allowedStatuses.includes(normalizedStatus)) {
            return res.status(400).json({
                message: `status must be one of: ${allowedStatuses.join(', ')}`
            });
        }

        const existing = await bookingService.getBookingById(id);
        if (!existing) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        const booking = await bookingService.updateBookingStatus({
            bookingId: id,
            status: normalizedStatus,
            updatedBy: req.authUser.id
        });

        return res.status(200).json({
            message: 'Booking status updated successfully.',
            booking
        });
    } catch (error) {
        if (error.message === 'BOOKING_NOT_FOUND') {
            return res.status(404).json({ message: 'Booking not found.' });
        }
        if (error.message === 'INVALID_BOOKING_STATUS') {
            return res.status(400).json({
                message: `status must be one of: ${bookingService.BOOKING_STATUSES.join(', ')}`
            });
        }
        if (error.message === 'INVALID_STATUS_TRANSITION') {
            return res.status(400).json({ message: 'This status transition is not allowed.' });
        }
        return next(error);
    }
}

module.exports = {
    checkAvailability,
    createBooking,
    nonUserBooking,
    adminUserBooking,
    getMyBookings,
    getBookingById,
    cancelBooking,
    getAllBookings,
    updateBookingStatus
};
