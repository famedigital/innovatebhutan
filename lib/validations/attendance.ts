import { z } from "zod";

// ==================== ATTENDANCE SCHEMAS ====================

export const createAttendanceSchema = z.object({
  employeeId: z.number().int().positive("Employee ID is required"),
  date: z.coerce.date().optional(),
  checkIn: z.coerce.date().optional(),
  checkOut: z.coerce.date().optional(),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    ip: z.string().optional(),
  }).optional(),
});

export const updateAttendanceSchema = z.object({
  checkIn: z.coerce.date().optional(),
  checkOut: z.coerce.date().optional(),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    ip: z.string().optional(),
  }).optional(),
});

export const checkInSchema = z.object({
  employeeId: z.number().int().positive("Employee ID is required"),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    ip: z.string().optional(),
  }).optional(),
});

export const checkOutSchema = z.object({
  attendanceId: z.number().int().positive("Attendance ID is required"),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    ip: z.string().optional(),
  }).optional(),
});

export const attendanceQuerySchema = z.object({
  employeeId: z.coerce.number().int().positive().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(31),
});

export const attendanceReportSchema = z.object({
  employeeId: z.coerce.number().int().positive().optional(),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
});

// ==================== EXPORT TYPES ====================

export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>;
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;
export type AttendanceQueryInput = z.infer<typeof attendanceQuerySchema>;
export type AttendanceReportInput = z.infer<typeof attendanceReportSchema>;
