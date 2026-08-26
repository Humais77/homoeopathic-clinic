import { z } from "zod";

export const createAppointmentSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(100),

    email: z
      .string()
      .trim()
      .email()
      .max(255),

    meetingType: z.enum([
      "clinic",
      "video",
      "voice",
      "online",
    ]),

    appointmentDate: z
      .string()
      .datetime(),

    appointmentTime: z
      .string()
      .trim()
      .min(1)
      .max(30),

    concerns: z
      .string()
      .trim()
      .min(3)
      .max(2000),

    doctorId: z
      .string()
      .min(1),
  });

export type CreateAppointmentInput =
  z.infer<
    typeof createAppointmentSchema
  >;