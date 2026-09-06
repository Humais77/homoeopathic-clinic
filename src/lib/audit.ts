
import { prisma } from "@/src/lib/prisma";
import { Prisma } from "../generated/prisma/client";

type AuditLogInput = {
  userId?: string | null;
  action: string;
  entity?: string | null;
  entityId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Prisma.InputJsonValue | null;
};

export async function createAuditLog({
  userId,
  action,
  entity,
  entityId,
  ipAddress,
  userAgent,
  metadata,
}: AuditLogInput) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: userId ?? null,
        action,
        entity: entity ?? null,
        entityId: entityId ?? null,
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
        metadata: metadata ?? undefined,
      },
    });
  } catch (error) {
    // Audit logging should never break the main application action.
    console.error("Audit log creation failed:", error);

    return null;
  }
}
