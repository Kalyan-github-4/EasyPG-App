import type { PaymentStatus, TenantStatus } from "@/src/data/mock-tenants";

export const PAYMENT_STYLE: Record<
  PaymentStatus,
  { label: string; bg: string; fg: string; dot: string }
> = {
  paid: { label: "Paid", bg: "#ECFDF5", fg: "#047857", dot: "#10B981" },
  due: { label: "Due", bg: "#FFFBEB", fg: "#92400E", dot: "#F59E0B" },
  overdue: { label: "Overdue", bg: "#FEF2F2", fg: "#991B1B", dot: "#EF4444" },
};

export const TENANT_STATUS_STYLE: Record<
  TenantStatus,
  { label: string; bg: string; fg: string }
> = {
  active: { label: "Active", bg: "#ECFDF5", fg: "#047857" },
  notice: { label: "On notice", bg: "#FFFBEB", fg: "#92400E" },
  past: { label: "Past tenant", bg: "#F1F5F9", fg: "#475569" },
};
