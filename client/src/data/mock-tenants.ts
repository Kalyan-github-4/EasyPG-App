// Mock tenant data — swap for backend API once Phase 6 (SaaS Tenant Module) lands.
// All `getTenantsForProperty(propertyId)` calls currently return the full mock list
// regardless of propertyId, so the UI has data even though no real tenants table exists.

export type PaymentStatus = "paid" | "due" | "overdue";
export type TenantStatus = "active" | "notice" | "past";
export type BedType = "Single" | "Double" | "Triple";

export type PaymentRecord = {
  month: string; // e.g. "Apr 2026"
  amount: number;
  status: PaymentStatus;
  paidOn?: string; // ISO date string
};

export type EmergencyContact = {
  name: string;
  phone: string;
  relation: string;
};

export type IdProof = {
  type: string; // "Aadhaar", "PAN", "Driving License"
  verified: boolean;
};

export type Tenant = {
  id: string;
  propertyId: string;
  name: string;
  initial: string;
  phone: string;
  email?: string;
  roomNumber: string;
  bedType: BedType;
  joinedOn: string;
  rent: number;
  status: TenantStatus;
  currentPayment: PaymentStatus;
  emergencyContact?: EmergencyContact;
  idProof?: IdProof;
  paymentHistory: PaymentRecord[];
};

const TENANTS: Tenant[] = [
  {
    id: "t1",
    propertyId: "*",
    name: "Aarav Mehta",
    initial: "A",
    phone: "+91 98765 43210",
    email: "aarav.mehta@example.com",
    roomNumber: "201",
    bedType: "Double",
    joinedOn: "2025-08-15",
    rent: 9200,
    status: "active",
    currentPayment: "paid",
    emergencyContact: {
      name: "Priya Mehta",
      phone: "+91 98765 11111",
      relation: "Mother",
    },
    idProof: { type: "Aadhaar", verified: true },
    paymentHistory: [
      { month: "Apr 2026", amount: 9200, status: "paid", paidOn: "2026-04-03" },
      { month: "Mar 2026", amount: 9200, status: "paid", paidOn: "2026-03-04" },
      { month: "Feb 2026", amount: 9200, status: "paid", paidOn: "2026-02-02" },
      { month: "Jan 2026", amount: 9200, status: "paid", paidOn: "2026-01-05" },
    ],
  },
  {
    id: "t2",
    propertyId: "*",
    name: "Sneha Roy",
    initial: "S",
    phone: "+91 98765 43211",
    email: "sneha.roy@example.com",
    roomNumber: "104",
    bedType: "Single",
    joinedOn: "2025-11-02",
    rent: 11500,
    status: "active",
    currentPayment: "due",
    emergencyContact: {
      name: "Rajesh Roy",
      phone: "+91 98765 22222",
      relation: "Father",
    },
    idProof: { type: "Aadhaar", verified: true },
    paymentHistory: [
      { month: "Apr 2026", amount: 11500, status: "due" },
      { month: "Mar 2026", amount: 11500, status: "paid", paidOn: "2026-03-08" },
      { month: "Feb 2026", amount: 11500, status: "paid", paidOn: "2026-02-06" },
    ],
  },
  {
    id: "t3",
    propertyId: "*",
    name: "Rahul Kumar",
    initial: "R",
    phone: "+91 98765 43212",
    roomNumber: "305",
    bedType: "Triple",
    joinedOn: "2026-01-20",
    rent: 7500,
    status: "active",
    currentPayment: "paid",
    emergencyContact: {
      name: "Anita Kumar",
      phone: "+91 98765 33333",
      relation: "Mother",
    },
    idProof: { type: "Aadhaar", verified: false },
    paymentHistory: [
      { month: "Apr 2026", amount: 7500, status: "paid", paidOn: "2026-04-01" },
      { month: "Mar 2026", amount: 7500, status: "paid", paidOn: "2026-03-02" },
      { month: "Feb 2026", amount: 7500, status: "paid", paidOn: "2026-02-04" },
    ],
  },
  {
    id: "t4",
    propertyId: "*",
    name: "Meera Iyer",
    initial: "M",
    phone: "+91 98765 43213",
    email: "meera.iyer@example.com",
    roomNumber: "108",
    bedType: "Single",
    joinedOn: "2025-06-10",
    rent: 11500,
    status: "notice",
    currentPayment: "paid",
    emergencyContact: {
      name: "Karthik Iyer",
      phone: "+91 98765 44444",
      relation: "Brother",
    },
    idProof: { type: "Aadhaar", verified: true },
    paymentHistory: [
      { month: "Apr 2026", amount: 11500, status: "paid", paidOn: "2026-04-02" },
      { month: "Mar 2026", amount: 11500, status: "paid", paidOn: "2026-03-03" },
      { month: "Feb 2026", amount: 11500, status: "paid", paidOn: "2026-02-01" },
    ],
  },
  {
    id: "t5",
    propertyId: "*",
    name: "Vikram Singh",
    initial: "V",
    phone: "+91 98765 43214",
    email: "vikram.s@example.com",
    roomNumber: "207",
    bedType: "Double",
    joinedOn: "2025-09-25",
    rent: 9200,
    status: "active",
    currentPayment: "overdue",
    emergencyContact: {
      name: "Kiran Singh",
      phone: "+91 98765 55555",
      relation: "Father",
    },
    idProof: { type: "PAN", verified: true },
    paymentHistory: [
      { month: "Apr 2026", amount: 9200, status: "overdue" },
      { month: "Mar 2026", amount: 9200, status: "overdue" },
      { month: "Feb 2026", amount: 9200, status: "paid", paidOn: "2026-02-09" },
      { month: "Jan 2026", amount: 9200, status: "paid", paidOn: "2026-01-04" },
    ],
  },
  {
    id: "t6",
    propertyId: "*",
    name: "Ananya Sharma",
    initial: "A",
    phone: "+91 98765 43215",
    email: "ananya.sharma@example.com",
    roomNumber: "112",
    bedType: "Single",
    joinedOn: "2026-02-14",
    rent: 11500,
    status: "active",
    currentPayment: "paid",
    emergencyContact: {
      name: "Suresh Sharma",
      phone: "+91 98765 66666",
      relation: "Father",
    },
    idProof: { type: "Aadhaar", verified: true },
    paymentHistory: [
      { month: "Apr 2026", amount: 11500, status: "paid", paidOn: "2026-04-04" },
      { month: "Mar 2026", amount: 11500, status: "paid", paidOn: "2026-03-05" },
      { month: "Feb 2026", amount: 11500, status: "paid", paidOn: "2026-02-15" },
    ],
  },
  {
    id: "t7",
    propertyId: "*",
    name: "Karthik Nair",
    initial: "K",
    phone: "+91 98765 43216",
    roomNumber: "310",
    bedType: "Triple",
    joinedOn: "2026-03-08",
    rent: 7500,
    status: "active",
    currentPayment: "due",
    emergencyContact: {
      name: "Lakshmi Nair",
      phone: "+91 98765 77777",
      relation: "Mother",
    },
    idProof: { type: "Aadhaar", verified: false },
    paymentHistory: [
      { month: "Apr 2026", amount: 7500, status: "due" },
      { month: "Mar 2026", amount: 7500, status: "paid", paidOn: "2026-03-12" },
    ],
  },
];

export function getTenantsForProperty(_propertyId: string): Tenant[] {
  // Returns the full mock list regardless of propertyId until backend lands.
  return TENANTS;
}

export function getTenantById(id: string): Tenant | undefined {
  return TENANTS.find((t) => t.id === id);
}
