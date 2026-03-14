import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const userSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "USER"]),
});

export const invoiceSchema = z.object({
  customerName: z.string().min(1, "Customer Name is required"),
  phone: z.string().min(1, "Phone Number is required"),
  brideName: z.string().optional(),
  groomName: z.string().optional(),
  modelNumber: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  date: z.string().or(z.date()).optional(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitRate: z.coerce.number().min(0, "Unit rate must be positive"),
  advancePaid: z.boolean().default(false),
  advanceAmount: z.coerce.number().optional(),
  advanceMode: z.enum(["ONLINE", "CASH"]).optional().nullable(),
  balanceMode: z.enum(["ONLINE", "CASH"]).optional().nullable(),
  estimatedDesignTime: z.string().optional(),
  estimatedPrintTime: z.string().optional(),
  packing: z.enum(["WITH_PACKING", "WITHOUT_PACKING"]),
  printingColor: z.string().optional(),
  designer: z.string().optional(),
  printer: z.string().optional(),
  additionalNotes: z.string().optional(),
  contentConfirmedOn: z.string().or(z.date()).optional().nullable(),
  finalDeliveryDate: z.string().or(z.date()).optional().nullable(),
  assigneeId: z.string().min(1, "Assignee is required"),
});

export const leadSchema = z.object({
  customerName: z.string().min(1, "Customer Name is required"),
  phone: z.string().min(1, "Phone Number is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  assignedToId: z.string().min(1, "Assignee is required"),
  estimatedBillValue: z.coerce.number().min(0, "Must be positive"),
  status: z.enum(["NEW", "CONTACTED", "NEGOTIATING", "CONVERTED", "LOST"]).default("NEW"),
  notes: z.string().optional(),
});
