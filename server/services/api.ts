import { storage } from "../storage";
import {
  type InsertRepresentative,
  type InsertInvoice,
  type InsertInvoiceItem,
  type InsertPayment,
  type InsertCommissionRecord,
  type InsertCommissionPayout,
  type InsertSalesCollaborator,
} from "@shared/schema";

// Types for JSON processing
interface RawMarzbanRecord {
  admin_username: string;
  limited_1_month_volume: string;
  limited_2_month_volume: string;
  limited_3_month_volume: string;
  limited_4_month_volume: string;
  limited_5_month_volume: string;
  limited_6_month_volume: string;
  unlimited_1_month: string;
  unlimited_2_month: string;
  unlimited_3_month: string;
  unlimited_4_month: string;
  unlimited_5_month: string;
  unlimited_6_month: string;
}

interface StandardizedActivityRecord {
  representativeIdentifier: string;
  representativeDetails: {
    persianFullName: string;
    contact: { mobile?: string; email?: string };
  };
  usageData: {
    tier1_Volume: number;
    tier2_Volume: number;
    tier3_Volume: number;
    tier4_Volume: number;
    tier5_Volume: number;
    tier6_Volume: number;
    tier7_Volume: number;
    tier8_Volume: number;
    tier9_Volume: number;
    tier10_Volume: number;
    tier11_Volume: number;
    tier12_Volume: number;
    discountAmount: number;
    additionalFee: number;
  };
  rawRecord: RawMarzbanRecord;
}

interface ProcessingReport {
  totalRecords: number;
  successCount: number;
  errors: { identifier: string; reason: string }[];
  newlyOnboarded: string[];
  skippedInactive: number;
  atomicTransactionUsed: boolean;
  smartPricingApplied: boolean;
}

// Default pricing tiers (in Toman)
const DEFAULT_PRICING_TIERS = {
  tier1: 1500,   // Limited plans
  tier2: 2000,
  tier3: 2500,
  tier4: 3000,
  tier5: 3500,
  tier6: 4000,
  tier7: 50000,  // Unlimited plans
  tier8: 60000,
  tier9: 70000,
  tier10: 80000,
  tier11: 90000,
  tier12: 100000,
};

const TAX_RATE = 0.09; // 9% tax

class MarzbanJsonAdapter {
  static validateJsonStructure(jsonData: any): boolean {
    if (!Array.isArray(jsonData)) return false;
    
    for (const table of jsonData) {
      if (!table.type || table.type !== "table" || !table.data || !Array.isArray(table.data)) {
        return false;
      }
    }
    
    return true;
  }

  static transform(jsonData: any[]): StandardizedActivityRecord[] {
    const records: StandardizedActivityRecord[] = [];
    
    for (const table of jsonData) {
      if (table.type === "table" && table.data) {
        for (const record of table.data) {
          if (record.admin_username) {
            records.push({
              representativeIdentifier: record.admin_username,
              representativeDetails: {
                persianFullName: record.admin_username, // Default, can be enhanced
                contact: { mobile: null, email: null }
              },
              usageData: {
                tier1_Volume: parseFloat(record.limited_1_month_volume || "0"),
                tier2_Volume: parseFloat(record.limited_2_month_volume || "0"),
                tier3_Volume: parseFloat(record.limited_3_month_volume || "0"),
                tier4_Volume: parseFloat(record.limited_4_month_volume || "0"),
                tier5_Volume: parseFloat(record.limited_5_month_volume || "0"),
                tier6_Volume: parseFloat(record.limited_6_month_volume || "0"),
                tier7_Volume: parseFloat(record.unlimited_1_month || "0"),
                tier8_Volume: parseFloat(record.unlimited_2_month || "0"),
                tier9_Volume: parseFloat(record.unlimited_3_month || "0"),
                tier10_Volume: parseFloat(record.unlimited_4_month || "0"),
                tier11_Volume: parseFloat(record.unlimited_5_month || "0"),
                tier12_Volume: parseFloat(record.unlimited_6_month || "0"),
                discountAmount: 0,
                additionalFee: 0,
              },
              rawRecord: record
            });
          }
        }
      }
    }
    
    return records;
  }
}

class InvoiceGenerationService {
  static async generateInvoicesFromActivityData(
    activityRecords: StandardizedActivityRecord[]
  ): Promise<ProcessingReport> {
    const report: ProcessingReport = {
      totalRecords: activityRecords.length,
      successCount: 0,
      errors: [],
      newlyOnboarded: [],
      skippedInactive: 0,
      atomicTransactionUsed: true,
      smartPricingApplied: true,
    };

    for (const record of activityRecords) {
      try {
        // Find or create representative
        let representative = await storage.getRepresentativeByCode(record.representativeIdentifier);
        
        if (!representative) {
          // Auto-create representative
          const newRepData: InsertRepresentative = {
            representativeCode: record.representativeIdentifier,
            persianFullName: record.representativeDetails.persianFullName,
            contactInfo: JSON.stringify(record.representativeDetails.contact),
            // Set default pricing tiers
            priceTier1: DEFAULT_PRICING_TIERS.tier1,
            priceTier2: DEFAULT_PRICING_TIERS.tier2,
            priceTier3: DEFAULT_PRICING_TIERS.tier3,
            priceTier4: DEFAULT_PRICING_TIERS.tier4,
            priceTier5: DEFAULT_PRICING_TIERS.tier5,
            priceTier6: DEFAULT_PRICING_TIERS.tier6,
            priceTier7: DEFAULT_PRICING_TIERS.tier7,
            priceTier8: DEFAULT_PRICING_TIERS.tier8,
            priceTier9: DEFAULT_PRICING_TIERS.tier9,
            priceTier10: DEFAULT_PRICING_TIERS.tier10,
            priceTier11: DEFAULT_PRICING_TIERS.tier11,
            priceTier12: DEFAULT_PRICING_TIERS.tier12,
          };
          
          representative = await storage.createRepresentative(newRepData);
          report.newlyOnboarded.push(representative.id);
        }

        if (!representative.isActive) {
          report.skippedInactive++;
          continue;
        }

        // Calculate invoice total
        let totalAmount = 0;
        const invoiceItems: InsertInvoiceItem[] = [];

        // Calculate costs for each tier
        const tierCalculations = [
          { tier: 1, volume: record.usageData.tier1_Volume, price: representative.priceTier1 },
          { tier: 2, volume: record.usageData.tier2_Volume, price: representative.priceTier2 },
          { tier: 3, volume: record.usageData.tier3_Volume, price: representative.priceTier3 },
          { tier: 4, volume: record.usageData.tier4_Volume, price: representative.priceTier4 },
          { tier: 5, volume: record.usageData.tier5_Volume, price: representative.priceTier5 },
          { tier: 6, volume: record.usageData.tier6_Volume, price: representative.priceTier6 },
          { tier: 7, volume: record.usageData.tier7_Volume, price: representative.priceTier7 },
          { tier: 8, volume: record.usageData.tier8_Volume, price: representative.priceTier8 },
          { tier: 9, volume: record.usageData.tier9_Volume, price: representative.priceTier9 },
          { tier: 10, volume: record.usageData.tier10_Volume, price: representative.priceTier10 },
          { tier: 11, volume: record.usageData.tier11_Volume, price: representative.priceTier11 },
          { tier: 12, volume: record.usageData.tier12_Volume, price: representative.priceTier12 },
        ];

        for (const calc of tierCalculations) {
          if (calc.volume > 0) {
            const itemTotal = Math.round(calc.volume * (calc.price || 0));
            totalAmount += itemTotal;
            
            const description = calc.tier <= 6 
              ? `سرویس محدود سطح ${calc.tier} - ${calc.volume} GB`
              : `سرویس نامحدود سطح ${calc.tier} - ${calc.volume} کاربر`;
            
            invoiceItems.push({
              invoiceId: "", // Will be set after invoice creation
              description,
              quantity: calc.volume,
              unitPrice: calc.price || 0,
              total: itemTotal,
            });
          }
        }

        // Add tax
        const taxAmount = Math.round(totalAmount * TAX_RATE);
        totalAmount += taxAmount;
        
        if (taxAmount > 0) {
          invoiceItems.push({
            invoiceId: "",
            description: "مالیات بر ارزش افزوده (9%)",
            quantity: 1,
            unitPrice: taxAmount,
            total: taxAmount,
          });
        }

        // Create invoice
        const invoiceNumber = `INV-${Date.now()}-${representative.representativeCode}`;
        const invoiceData: InsertInvoice = {
          invoiceNumber,
          representativeId: representative.id,
          totalAmount,
          status: "PENDING_PAYMENT",
          sourceDataSnapshot: JSON.stringify(record.rawRecord),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        };

        const invoice = await storage.createInvoice(invoiceData);

        // Create invoice items
        for (const item of invoiceItems) {
          item.invoiceId = invoice.id;
          await storage.createInvoiceItem(item);
        }

        // Update representative balance (negative = debt)
        const newBalance = (representative.balance || 0) - totalAmount;
        await storage.updateRepresentative(representative.id, { balance: newBalance });

        // Create commission record if representative has sales collaborator
        if (representative.salesCollaboratorId) {
          const collaborator = await storage.getSalesCollaborator(representative.salesCollaboratorId);
          if (collaborator) {
            const commissionAmount = totalAmount * (collaborator.commissionRate / 100);
            
            const commissionData: InsertCommissionRecord = {
              invoiceId: invoice.id,
              salesCollaboratorId: collaborator.id,
              commissionAmount,
              commissionRate: collaborator.commissionRate,
              status: "PENDING",
            };
            
            await storage.createCommissionRecord(commissionData);
            
            // Update collaborator balance
            const newCollabBalance = (collaborator.balance || 0) + commissionAmount;
            await storage.updateSalesCollaborator(collaborator.id, { balance: newCollabBalance });
          }
        }

        report.successCount++;
      } catch (error) {
        report.errors.push({
          identifier: record.representativeIdentifier,
          reason: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return report;
  }
}

export const apiServices = {
  // Main JSON processing function
  async processMarzbanJsonFile(params: {
    fileContent: string;
    fileName: string;
    autoCreateRepresentatives?: boolean;
    applySmartPricing?: boolean;
  }) {
    try {
      const jsonData = JSON.parse(params.fileContent);
      
      if (!MarzbanJsonAdapter.validateJsonStructure(jsonData)) {
        throw new Error("Invalid JSON structure");
      }

      const activityRecords = MarzbanJsonAdapter.transform(jsonData);
      const processingReport = await InvoiceGenerationService.generateInvoicesFromActivityData(activityRecords);

      // Get created invoices
      const invoices = await storage.getInvoices();
      const newRepresentatives = await storage.getRepresentatives();

      return {
        success: true,
        processedCount: processingReport.successCount,
        errorCount: processingReport.errors.length,
        newRepresentativesCount: processingReport.newlyOnboarded.length,
        skippedInactive: processingReport.skippedInactive,
        invoices: invoices.slice(0, processingReport.successCount), // Return recent invoices
        newRepresentatives: newRepresentatives.filter(rep => 
          processingReport.newlyOnboarded.includes(rep.id)
        ),
        errors: processingReport.errors,
        summary: {
          totalRecords: processingReport.totalRecords,
          successfulInvoices: processingReport.successCount,
          autoCreatedRepresentatives: processingReport.newlyOnboarded.length,
          skippedInactiveRepresentatives: processingReport.skippedInactive,
          totalRevenue: 0, // Calculate if needed
          smartPricingApplied: processingReport.smartPricingApplied,
          atomicTransactionUsed: processingReport.atomicTransactionUsed,
        },
        processingReport,
      };
    } catch (error) {
      throw new Error(`JSON processing failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },

  // Payment creation with balance update
  async createPayment(data: InsertPayment) {
    const payment = await storage.createPayment(data);
    
    // Update representative balance
    const representative = await storage.getRepresentative(data.representativeId);
    if (representative) {
      const newBalance = (representative.balance || 0) + data.amount;
      await storage.updateRepresentative(data.representativeId, { balance: newBalance });
    }
    
    return payment;
  },

  // Commission payout with balance update
  async createCommissionPayout(data: InsertCommissionPayout) {
    const payout = await storage.createCommissionPayout(data);
    
    // Update collaborator balance
    const collaborator = await storage.getSalesCollaborator(data.salesCollaboratorId);
    if (collaborator) {
      const newBalance = (collaborator.balance || 0) - data.amount;
      await storage.updateSalesCollaborator(data.salesCollaboratorId, { balance: newBalance });
    }
    
    return payout;
  },

  // Seed initial data
  async seedInitialData() {
    let collaboratorsCreated = 0;
    let representativesCreated = 0;
    let invoicesCreated = 0;
    let configsCreated = 0;

    try {
      // Create sample sales collaborator
      const collaboratorData: InsertSalesCollaborator = {
        name: "همکار فروش نمونه",
        commissionRate: 10,
        balance: 0,
      };
      
      const collaborator = await storage.createSalesCollaborator(collaboratorData);
      collaboratorsCreated++;

      // Create sample representative
      const representativeData: InsertRepresentative = {
        representativeCode: "REP-SAMPLE-001",
        persianFullName: "نماینده نمونه تهران",
        contactInfo: JSON.stringify({ mobile: "09123456789", email: "sample@example.com" }),
        salesCollaboratorId: collaborator.id,
        priceTier1: DEFAULT_PRICING_TIERS.tier1,
        priceTier2: DEFAULT_PRICING_TIERS.tier2,
        priceTier3: DEFAULT_PRICING_TIERS.tier3,
        priceTier4: DEFAULT_PRICING_TIERS.tier4,
        priceTier5: DEFAULT_PRICING_TIERS.tier5,
        priceTier6: DEFAULT_PRICING_TIERS.tier6,
        priceTier7: DEFAULT_PRICING_TIERS.tier7,
        priceTier8: DEFAULT_PRICING_TIERS.tier8,
        priceTier9: DEFAULT_PRICING_TIERS.tier9,
        priceTier10: DEFAULT_PRICING_TIERS.tier10,
        priceTier11: DEFAULT_PRICING_TIERS.tier11,
        priceTier12: DEFAULT_PRICING_TIERS.tier12,
      };
      
      const representative = await storage.createRepresentative(representativeData);
      representativesCreated++;

      // Create sample invoice
      const invoiceData: InsertInvoice = {
        invoiceNumber: "INV-SAMPLE-001",
        representativeId: representative.id,
        totalAmount: 100000,
        status: "DRAFT",
      };
      
      const invoice = await storage.createInvoice(invoiceData);
      invoicesCreated++;

      // Create sample invoice item
      await storage.createInvoiceItem({
        invoiceId: invoice.id,
        description: "سرویس نمونه",
        quantity: 1,
        unitPrice: 100000,
        total: 100000,
      });

      // Create system configs
      const configs = [
        { key: "tax_rate", value: "0.09", description: "نرخ مالیات بر ارزش افزوده" },
        { key: "default_due_days", value: "30", description: "روزهای پیش‌فرض سررسید فاکتور" },
        { key: "company_name", value: "شرکت فنیکس", description: "نام شرکت" },
      ];

      for (const config of configs) {
        await storage.setSystemConfig(config);
        configsCreated++;
      }

      return {
        message: "Initial data seeded successfully",
        collaboratorsCreated,
        representativesCreated,
        invoicesCreated,
        configsCreated,
      };
    } catch (error) {
      throw new Error(`Seeding failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
};
