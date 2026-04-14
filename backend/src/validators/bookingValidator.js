const { z } = require('zod');

// SLOT ENUM - Must match TimeSlot enum in schema.prisma exactly
const TimeSlot = z.enum(['MORNING', 'AFTERNOON', 'EVENING'], {
  errorMap: () => ({
    message: 'slot must be one of: MORNING, AFTERNOON, EVENING'
  })
});

// BOOKING DATE RULES
const BookingDate = z.string({
  required_error: 'date is required'
})
  .refine((val) => {
    // Rule 1 — must be a parseable date string
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, { message: 'Invalid date format. Use YYYY-MM-DD' })

  .refine((val) => {
    // Rule 2 — cannot book in the past
    const selected = new Date(val);
    const today    = new Date();
    today.setHours(0, 0, 0, 0);  
    return selected >= today;
  }, { message: 'Booking date cannot be in the past' })

  .refine((val) => {
    // Rule 3 — cannot book more than 90 days ahead
    const selected = new Date(val);
    const maxDate  = new Date();
    maxDate.setDate(maxDate.getDate() + 90);
    return selected <= maxDate;
  }, { message: 'Bookings cannot be made more than 90 days in advance' });

// CREATE BOOKING SCHEMA
const createBookingSchema = z.object({
  roomId: z.string({
    required_error: 'roomId is required'
  }).cuid({ message: 'Invalid roomId format' }),

  date: BookingDate,

  slot: TimeSlot
});

// AVAILABILITY CHECK SCHEMA
const availabilitySchema = z.object({
  roomId: z.string().cuid({ message: 'Invalid roomId format' }),
  date:   BookingDate,
  slot:   TimeSlot
});

// CANCEL BOOKING SCHEMA
const cancelBookingSchema = z.object({
  reason: z.string()
    .max(500, 'Cancellation reason cannot exceed 500 characters')
    .optional()
});

// VALIDATE HELPER
const validate = (schema, data) => {
  const result = schema.safeParse(data);

  if (!result.success) {
    // Guard against unexpected zod error shapes
    const rawErrors = result.error?.errors ?? [];
    const errors = rawErrors.map((err) => ({
      field:   err.path?.join('.') || 'unknown',
      message: err.message || 'Invalid value'
    }));
    return { success: false, errors };
  }

  return { success: true, data: result.data };
};

module.exports = {
  createBookingSchema,
  availabilitySchema,
  cancelBookingSchema,
  validate
};