const { z } = require('zod');

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
  name: z.string({
    required_error: 'name is required'
  }).min(2, { message: 'name must be at least 2 characters' })
    .max(100, { message: 'name cannot exceed 100 characters' }),

  email: z.string({
    required_error: 'email is required'
  }).email({ message: 'Invalid email address' }),

  roomId: z.string({
    required_error: 'roomId is required'
  }).cuid({ message: 'Invalid roomId format' }),

  date: BookingDate,

  slot: TimeSlot
});

const createNonUserBookingSchema = z.object({
  roomId: z.string({
    required_error: 'roomId is required'
  }).cuid({ message: 'Invalid roomId format' }),
  slotId: z.string({
    required_error: 'slotId is required'
  }).cuid({ message: 'Invalid slotId format' }),
  bookingDate: BookingDate,
  totalCost: z.coerce.number({
    required_error: 'totalCost is required'
  }).int({ message: 'totalCost must be a whole number' }).positive({ message: 'totalCost must be greater than 0' }),
  fullName: z.string({
    required_error: 'fullName is required'
  }).min(2, { message: 'fullName must be at least 2 characters' })
    .max(100, { message: 'fullName cannot exceed 100 characters' }),
  email: z.string({
    required_error: 'email is required'
  }).email({ message: 'Invalid email address' }),
  phoneNumber: z.string({
    required_error: 'phoneNumber is required'
  }).min(7, { message: 'phoneNumber must be at least 7 characters' })
    .max(20, { message: 'phoneNumber cannot exceed 20 characters' }),
  numberOfAttendees: z.coerce.number({
    required_error: 'numberOfAttendees is required'
  }).int({ message: 'numberOfAttendees must be a whole number' }).positive({ message: 'numberOfAttendees must be greater than 0' }),
  documents: z.array(z.object({
    documentName: z.string().min(1, { message: 'documentName is required' }),
    documentFile: z.string().min(1, { message: 'documentFile is required' })
  })).optional()
});

const createAdminUserBookingSchema = z.object({
  roomId: z.string({
    required_error: 'roomId is required'
  }).cuid({ message: 'Invalid roomId format' }),
  slotId: z.string({
    required_error: 'slotId is required'
  }).cuid({ message: 'Invalid slotId format' }),
  userId: z.string({
    required_error: 'userId is required'
  }).cuid({ message: 'Invalid userId format' }),
  bookingDate: BookingDate,
  totalCost: z.number({
    required_error: 'totalCost is required'
  }).int({ message: 'totalCost must be a whole number' }).positive({ message: 'totalCost must be greater than 0' }),
  numberOfAttendees: z.number({
    required_error: 'numberOfAttendees is required'
  }).int({ message: 'numberOfAttendees must be a whole number' }).positive({ message: 'numberOfAttendees must be greater than 0' })
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
  createNonUserBookingSchema,
  createAdminUserBookingSchema,
  availabilitySchema,
  cancelBookingSchema,
  validate
};