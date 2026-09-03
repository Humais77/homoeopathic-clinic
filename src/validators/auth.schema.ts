import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(254),

  password: z
    .string()
    .min(1, "Password is required")
    .max(128),
});

export const userRegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name is too short")
    .max(100, "Name is too long"),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(254),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters"),

  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .nullable(),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(254),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128),

    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),

    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128),

    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type UserRegisterInput = z.infer<typeof userRegisterSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;