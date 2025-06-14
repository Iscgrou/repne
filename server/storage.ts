import {
  users,
  salesCollaborators,
  representatives,
  invoices,
  invoiceItems,
  payments,
  paymentAllocations,
  commissionRecords,
  commissionPayouts,
  crmInteractions,
  systemConfigs,
  type User,
  type UpsertUser,
  type SalesCollaborator,
  type InsertSalesCollaborator,
  type Representative,
  type InsertRepresentative,
  type Invoice,
  type InsertInvoice,
  type InvoiceItem,
  type InsertInvoiceItem,
  type Payment,
  type InsertPayment,
  type PaymentAllocation,
  type InsertPaymentAllocation,
  type CommissionRecord,
  type InsertCommissionRecord,
  type CommissionPayout,
  type InsertCommissionPayout,
  type CrmInteraction,
  type InsertCrmInteraction,
  type SystemConfig,
  type InsertSystemConfig,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, like, count, sum, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Sales Collaborators
  getSalesCollaborators(): Promise<SalesCollaborator[]>;
  getSalesCollaborator(id: string): Promise<SalesCollaborator | undefined>;
  createSalesCollaborator(data: InsertSalesCollaborator): Promise<SalesCollaborator>;
  updateSalesCollaborator(id: string, data: Partial<InsertSalesCollaborator>): Promise<SalesCollaborator>;
  deleteSalesCollaborator(id: string): Promise<void>;

  // Representatives
  getRepresentatives(): Promise<Representative[]>;
  getRepresentative(id: string): Promise<Representative | undefined>;
  getRepresentativeByCode(code: string): Promise<Representative | undefined>;
  createRepresentative(data: InsertRepresentative): Promise<Representative>;
  updateRepresentative(id: string, data: Partial<InsertRepresentative>): Promise<Representative>;
  deleteRepresentative(id: string): Promise<void>;

  // Invoices
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  getInvoicesByRepresentative(representativeId: string): Promise<Invoice[]>;
  createInvoice(data: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, data: Partial<InsertInvoice>): Promise<Invoice>;
  deleteInvoice(id: string): Promise<void>;

  // Invoice Items
  getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]>;
  createInvoiceItem(data: InsertInvoiceItem): Promise<InvoiceItem>;
  deleteInvoiceItems(invoiceId: string): Promise<void>;

  // Payments
  getPayments(): Promise<Payment[]>;
  getPaymentsByRepresentative(representativeId: string): Promise<Payment[]>;
  createPayment(data: InsertPayment): Promise<Payment>;
  updatePayment(id: string, data: Partial<InsertPayment>): Promise<Payment>;
  deletePayment(id: string): Promise<void>;

  // Payment Allocations
  createPaymentAllocation(data: InsertPaymentAllocation): Promise<PaymentAllocation>;
  getPaymentAllocations(paymentId: string): Promise<PaymentAllocation[]>;

  // Commission Records
  getCommissionRecords(): Promise<CommissionRecord[]>;
  createCommissionRecord(data: InsertCommissionRecord): Promise<CommissionRecord>;
  updateCommissionRecord(id: string, data: Partial<InsertCommissionRecord>): Promise<CommissionRecord>;

  // Commission Payouts
  getCommissionPayouts(): Promise<CommissionPayout[]>;
  createCommissionPayout(data: InsertCommissionPayout): Promise<CommissionPayout>;

  // CRM Interactions
  getCrmInteractions(representativeId?: string): Promise<CrmInteraction[]>;
  createCrmInteraction(data: InsertCrmInteraction): Promise<CrmInteraction>;

  // System Configs
  getSystemConfigs(): Promise<SystemConfig[]>;
  getSystemConfig(key: string): Promise<SystemConfig | undefined>;
  setSystemConfig(data: InsertSystemConfig): Promise<SystemConfig>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    monthlyRevenue: number;
    overdueInvoices: number;
    activeRepresentatives: number;
    paidCommissions: number;
    recentInvoices: Invoice[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Sales Collaborators
  async getSalesCollaborators(): Promise<SalesCollaborator[]> {
    return await db.select().from(salesCollaborators).orderBy(desc(salesCollaborators.createdAt));
  }

  async getSalesCollaborator(id: string): Promise<SalesCollaborator | undefined> {
    const [collaborator] = await db.select().from(salesCollaborators).where(eq(salesCollaborators.id, id));
    return collaborator;
  }

  async createSalesCollaborator(data: InsertSalesCollaborator): Promise<SalesCollaborator> {
    const [collaborator] = await db.insert(salesCollaborators).values(data).returning();
    return collaborator;
  }

  async updateSalesCollaborator(id: string, data: Partial<InsertSalesCollaborator>): Promise<SalesCollaborator> {
    const [collaborator] = await db
      .update(salesCollaborators)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(salesCollaborators.id, id))
      .returning();
    return collaborator;
  }

  async deleteSalesCollaborator(id: string): Promise<void> {
    await db.delete(salesCollaborators).where(eq(salesCollaborators.id, id));
  }

  // Representatives
  async getRepresentatives(): Promise<Representative[]> {
    return await db.select().from(representatives).orderBy(desc(representatives.createdAt));
  }

  async getRepresentative(id: string): Promise<Representative | undefined> {
    const [representative] = await db.select().from(representatives).where(eq(representatives.id, id));
    return representative;
  }

  async getRepresentativeByCode(code: string): Promise<Representative | undefined> {
    const [representative] = await db.select().from(representatives).where(eq(representatives.representativeCode, code));
    return representative;
  }

  async createRepresentative(data: InsertRepresentative): Promise<Representative> {
    const [representative] = await db.insert(representatives).values(data).returning();
    return representative;
  }

  async updateRepresentative(id: string, data: Partial<InsertRepresentative>): Promise<Representative> {
    const [representative] = await db
      .update(representatives)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(representatives.id, id))
      .returning();
    return representative;
  }

  async deleteRepresentative(id: string): Promise<void> {
    await db.delete(representatives).where(eq(representatives.id, id));
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async getInvoicesByRepresentative(representativeId: string): Promise<Invoice[]> {
    return await db.select().from(invoices).where(eq(invoices.representativeId, representativeId)).orderBy(desc(invoices.createdAt));
  }

  async createInvoice(data: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db.insert(invoices).values(data).returning();
    return invoice;
  }

  async updateInvoice(id: string, data: Partial<InsertInvoice>): Promise<Invoice> {
    const [invoice] = await db
      .update(invoices)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }

  async deleteInvoice(id: string): Promise<void> {
    await db.delete(invoices).where(eq(invoices.id, id));
  }

  // Invoice Items
  async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    return await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
  }

  async createInvoiceItem(data: InsertInvoiceItem): Promise<InvoiceItem> {
    const [item] = await db.insert(invoiceItems).values(data).returning();
    return item;
  }

  async deleteInvoiceItems(invoiceId: string): Promise<void> {
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
  }

  // Payments
  async getPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.paymentDate));
  }

  async getPaymentsByRepresentative(representativeId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.representativeId, representativeId)).orderBy(desc(payments.paymentDate));
  }

  async createPayment(data: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(data).returning();
    return payment;
  }

  async updatePayment(id: string, data: Partial<InsertPayment>): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  async deletePayment(id: string): Promise<void> {
    await db.delete(payments).where(eq(payments.id, id));
  }

  // Payment Allocations
  async createPaymentAllocation(data: InsertPaymentAllocation): Promise<PaymentAllocation> {
    const [allocation] = await db.insert(paymentAllocations).values(data).returning();
    return allocation;
  }

  async getPaymentAllocations(paymentId: string): Promise<PaymentAllocation[]> {
    return await db.select().from(paymentAllocations).where(eq(paymentAllocations.paymentId, paymentId));
  }

  // Commission Records
  async getCommissionRecords(): Promise<CommissionRecord[]> {
    return await db.select().from(commissionRecords).orderBy(desc(commissionRecords.calculatedAt));
  }

  async createCommissionRecord(data: InsertCommissionRecord): Promise<CommissionRecord> {
    const [record] = await db.insert(commissionRecords).values(data).returning();
    return record;
  }

  async updateCommissionRecord(id: string, data: Partial<InsertCommissionRecord>): Promise<CommissionRecord> {
    const [record] = await db
      .update(commissionRecords)
      .set(data)
      .where(eq(commissionRecords.id, id))
      .returning();
    return record;
  }

  // Commission Payouts
  async getCommissionPayouts(): Promise<CommissionPayout[]> {
    return await db.select().from(commissionPayouts).orderBy(desc(commissionPayouts.payoutDate));
  }

  async createCommissionPayout(data: InsertCommissionPayout): Promise<CommissionPayout> {
    const [payout] = await db.insert(commissionPayouts).values(data).returning();
    return payout;
  }

  // CRM Interactions
  async getCrmInteractions(representativeId?: string): Promise<CrmInteraction[]> {
    const query = db.select().from(crmInteractions);
    
    if (representativeId) {
      return await query.where(eq(crmInteractions.representativeId, representativeId)).orderBy(desc(crmInteractions.interactionDate));
    }
    
    return await query.orderBy(desc(crmInteractions.interactionDate));
  }

  async createCrmInteraction(data: InsertCrmInteraction): Promise<CrmInteraction> {
    const [interaction] = await db.insert(crmInteractions).values(data).returning();
    return interaction;
  }

  // System Configs
  async getSystemConfigs(): Promise<SystemConfig[]> {
    return await db.select().from(systemConfigs).orderBy(asc(systemConfigs.key));
  }

  async getSystemConfig(key: string): Promise<SystemConfig | undefined> {
    const [config] = await db.select().from(systemConfigs).where(eq(systemConfigs.key, key));
    return config;
  }

  async setSystemConfig(data: InsertSystemConfig): Promise<SystemConfig> {
    const [config] = await db
      .insert(systemConfigs)
      .values(data)
      .onConflictDoUpdate({
        target: systemConfigs.key,
        set: {
          value: data.value,
          description: data.description,
          updatedAt: new Date(),
        },
      })
      .returning();
    return config;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    monthlyRevenue: number;
    overdueInvoices: number;
    activeRepresentatives: number;
    paidCommissions: number;
    recentInvoices: Invoice[];
  }> {
    // Get current month start
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Monthly revenue (paid invoices this month)
    const monthlyRevenueResult = await db
      .select({ total: sum(invoices.paidAmount) })
      .from(invoices)
      .where(and(
        eq(invoices.status, "PAID"),
        // @ts-ignore - Drizzle date comparison
        invoices.issueDate >= monthStart
      ));

    // Overdue invoices count
    const overdueInvoicesResult = await db
      .select({ count: count() })
      .from(invoices)
      .where(and(
        eq(invoices.status, "PENDING_PAYMENT"),
        // @ts-ignore - Drizzle date comparison  
        invoices.dueDate < now
      ));

    // Active representatives count
    const activeRepresentativesResult = await db
      .select({ count: count() })
      .from(representatives)
      .where(eq(representatives.isActive, true));

    // Paid commissions this month
    const paidCommissionsResult = await db
      .select({ total: sum(commissionPayouts.amount) })
      .from(commissionPayouts)
      .where(
        // @ts-ignore - Drizzle date comparison
        commissionPayouts.payoutDate >= monthStart
      );

    // Recent invoices
    const recentInvoices = await db
      .select()
      .from(invoices)
      .orderBy(desc(invoices.createdAt))
      .limit(5);

    return {
      monthlyRevenue: Number(monthlyRevenueResult[0]?.total || 0),
      overdueInvoices: overdueInvoicesResult[0]?.count || 0,
      activeRepresentatives: activeRepresentativesResult[0]?.count || 0,
      paidCommissions: Number(paidCommissionsResult[0]?.total || 0),
      recentInvoices,
    };
  }
}

export const storage = new DatabaseStorage();
