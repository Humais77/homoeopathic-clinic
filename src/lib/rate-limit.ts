import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = Redis.fromEnv();

export const loginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix: "auth:login",
});

export const registerRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: true,
  prefix: "auth:register",
});

export const verificationRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix: "auth:verification",
});

export const resendVerificationRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "15 m"),
  analytics: true,
  prefix: "auth:resend-verification",
});

export const forgotPasswordRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "15 m"),
  analytics: true,
  prefix: "auth:forgot-password",
});

export const resetPasswordRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix: "auth:reset-password",
});