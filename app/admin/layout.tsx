import { requireAdmin } from "@/src/lib/auth";
import { notFound } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();

    return <>{children}</>;
  } catch {
    notFound();
  }
}