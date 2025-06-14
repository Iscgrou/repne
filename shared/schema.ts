import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  real,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const salesCollaborators = pgTable("sales_collaborators", {
  id: varchar("id").primaryKey().default("cuid()"),
  name: varchar("name").notNull().unique(),
  commissionRate: real("commission_rate").default(0),
  balance: real("balance").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const representatives = pgTable("representatives", {
  id: varchar("id").primaryKey().default("cuid()"),
  representativeCode: varchar("representative_code").notNull().unique(),
  persianFullName: varchar("persian_full_name").notNull(),
  contactInfo: text("contact_info"), // JSON serialized
  balance: real("balance").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  salesCollaboratorId: varchar("sales_collaborator_id"),
  // Pricing tiers
  priceTier1: integer("price_tier1").default(0),
  priceTier2: integer("price_tier2").default(0),
  priceTier3: integer("price_tier3").default(0),
  priceTier4: integer("price_tier4").default(0),
  priceTier5: integer("price_tier5").default(0),
  priceTier6: integer("price_tier6").default(0),
  priceTier7: integer("price_tier7").default(0),
  priceTier8: integer("price_tier8").default(0),
  priceTier9: integer("price_tier9").default(0),
  priceTier10: integer("price_tier10").default(0),
  priceTier11: integer("price_tier11").default(0),
  priceTier12: integer("price_tier12").default(0),
});

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default("cuid()"),
  invoiceNumber: varchar("invoice_number").notNull().unique(),
  representativeId: varchar("representative_id").notNull(),
  issueDate: timestamp("issue_date").defaultNow(),
  dueDate: timestamp("due_date"),
  totalAmount: real("total_amount").notNull(),
  paidAmount: real("paid_amount").default(0),
  status: varchar("status").default("DRAFT"),
  notes: text("notes"),
  cancellationReason: text("cancellation_reason"),
  sourceDataSnapshot: text("source_data_snapshot"), // JSON serialized
  telegramDispatchStatus: text("telegram_dispatch_status"), // JSON serialized
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: varchar("id").primaryKey().default("cuid()"),
  invoiceId: varchar("invoice_id").notNull(),
  description: text("description").notNull(),
  quantity: real("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),
  total: integer("total").notNull(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default("cuid()"),
  representativeId: varchar("representative_id").notNull(),
  amount: real("amount").notNull(),
  paymentDate: timestamp("payment_date").defaultNow(),
  paymentMethod: varchar("payment_method").notNull(),
  referenceNumber: varchar("reference_number"),
  description: text("description"),
  isConfirmed: boolean("is_confirmed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const paymentAllocations = pgTable("payment_allocations", {
  id: varchar("id").primaryKey().default("cuid()"),
  paymentId: varchar("payment_id").notNull(),
  invoiceId: varchar("invoice_id").notNull(),
  amount: real("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const commissionRecords = pgTable("commission_records", {
  id: varchar("id").primaryKey().default("cuid()"),
  invoiceId: varchar("invoice_id").notNull().unique(),
  salesCollaboratorId: varchar("sales_collaborator_id").notNull(),
  commissionAmount: real("commission_amount").notNull(),
  commissionRate: real("commission_rate").notNull(),
  status: varchar("status").default("PENDING"),
  calculatedAt: timestamp("calculated_at").defaultNow(),
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
});

export const commissionPayouts = pgTable("commission_payouts", {
  id: varchar("id").primaryKey().default("cuid()"),
  salesCollaboratorId: varchar("sales_collaborator_id").notNull(),
  amount: real("amount").notNull(),
  payoutDate: timestamp("payout_date").defaultNow(),
  description: text("description"),
  referenceNumber: varchar("reference_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const crmInteractions = pgTable("crm_interactions", {
  id: varchar("id").primaryKey().default("cuid()"),
  representativeId: varchar("representative_id").notNull(),
  interactionType: varchar("interaction_type").notNull(),
  subject: varchar("subject").notNull(),
  description: text("description"),
  interactionDate: timestamp("interaction_date").defaultNow(),
  followUpDate: timestamp("follow_up_date"),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const systemConfigs = pgTable("system_configs", {
  id: varchar("id").primaryKey().default("cuid()"),
  key: varchar("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const salesCollaboratorsRelations = relations(salesCollaborators, ({ many }) => ({
  representatives: many(representatives),
  commissionRecords: many(commissionRecords),
  commissionPayouts: many(commissionPayouts),
}));

export const representativesRelations = relations(representatives, ({ one, many }) => ({
  salesCollaborator: one(salesCollaborators, {
    fields: [representatives.salesCollaboratorId],
    references: [salesCollaborators.id],
  }),
  invoices: many(invoices),
  payments: many(payments),
  crmInteractions: many(crmInteractions),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  representative: one(representatives, {
    fields: [invoices.representativeId],
    references: [representatives.id],
  }),
  items: many(invoiceItems),
  paymentAllocations: many(paymentAllocations),
  commissionRecord: one(commissionRecords),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  representative: one(representatives, {
    fields: [payments.representativeId],
    references: [representatives.id],
  }),
  allocations: many(paymentAllocations),
}));

export const paymentAllocationsRelations = relations(paymentAllocations, ({ one }) => ({
  payment: one(payments, {
    fields: [paymentAllocations.paymentId],
    references: [payments.id],
  }),
  invoice: one(invoices, {
    fields: [paymentAllocations.invoiceId],
    references: [invoices.id],
  }),
}));

export const commissionRecordsRelations = relations(commissionRecords, ({ one }) => ({
  invoice: one(invoices, {
    fields: [commissionRecords.invoiceId],
    references: [invoices.id],
  }),
  salesCollaborator: one(salesCollaborators, {
    fields: [commissionRecords.salesCollaboratorId],
    references: [salesCollaborators.id],
  }),
}));

export const commissionPayoutsRelations = relations(commissionPayouts, ({ one }) => ({
  salesCollaborator: one(salesCollaborators, {
    fields: [commissionPayouts.salesCollaboratorId],
    references: [salesCollaborators.id],
  }),
}));

export const crmInteractionsRelations = relations(crmInteractions, ({ one }) => ({
  representative: one(representatives, {
    fields: [crmInteractions.representativeId],
    references: [representatives.id],
  }),
}));

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type SalesCollaborator = typeof salesCollaborators.$inferSelect;
export type InsertSalesCollaborator = typeof salesCollaborators.$inferInsert;

export type Representative = typeof representatives.$inferSelect;
export type InsertRepresentative = typeof representatives.$inferInsert;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = typeof invoiceItems.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

export type PaymentAllocation = typeof paymentAllocations.$inferSelect;
export type InsertPaymentAllocation = typeof paymentAllocations.$inferInsert;

export type CommissionRecord = typeof commissionRecords.$inferSelect;
export type InsertCommissionRecord = typeof commissionRecords.$inferInsert;

export type CommissionPayout = typeof commissionPayouts.$inferSelect;
export type InsertCommissionPayout = typeof commissionPayouts.$inferInsert;

export type CrmInteraction = typeof crmInteractions.$inferSelect;
export type InsertCrmInteraction = typeof crmInteractions.$inferInsert;

export type SystemConfig = typeof systemConfigs.$inferSelect;
export type InsertSystemConfig = typeof systemConfigs.$inferInsert;

// Zod schemas
export const insertSalesCollaboratorSchema = createInsertSchema(salesCollaborators).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRepresentativeSchema = createInsertSchema(representatives).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommissionPayoutSchema = createInsertSchema(commissionPayouts).omit({
  id: true,
  createdAt: true,
});
