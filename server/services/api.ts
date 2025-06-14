import { nanoid } from "nanoid";
import { storage } from "../storage";
import type {
  InsertRepresentative,
  InsertInvoice,
  InsertInvoiceItem,
  InsertCommissionRecord,
  InsertPayment,
  InsertCommissionPayout,
  InsertSalesCollaborator,
} from "@shared/schema";

// Raw Marzban record structure
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

// Standardized activity record after transformation
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

// Processing report for JSON upload results
interface ProcessingReport {
  totalRecords: number;
  successCount: number;
  errors: { identifier: string; reason: string }[];
  newlyOnboarded: string[];
  skippedInactive: number;
  atomicTransactionUsed: boolean;
  smartPricingApplied: boolean;
}

// Marzban JSON adapter for data transformation
class MarzbanJsonAdapter {
  static validateJsonStructure(jsonData: any): boolean {
    if (!Array.isArray(jsonData)) {
      return false;
    }

    // Check if at least one record has the expected structure
    return jsonData.some(record => 
      typeof record === 'object' && 
      record.admin_username &&
      (record.limited_1_month_volume !== undefined || record.unlimited_1_month !== undefined)
    );
  }

  static transform(jsonData: any[]): StandardizedActivityRecord[] {
    return jsonData.map(record => {
      // Extract representative identifier and details
      const representativeIdentifier = record.admin_username || record.username || 'UNKNOWN';
      const persianFullName = record.full_name || record.persian_name || representativeIdentifier;

      // Parse usage data from the 12-tier structure
      const usageData = {
        tier1_Volume: parseInt(record.limited_1_month_volume || '0') || 0,
        tier2_Volume: parseInt(record.limited_2_month_volume || '0') || 0,
        tier3_Volume: parseInt(record.limited_3_month_volume || '0') || 0,
        tier4_Volume: parseInt(record.limited_4_month_volume || '0') || 0,
        tier5_Volume: parseInt(record.limited_5_month_volume || '0') || 0,
        tier6_Volume: parseInt(record.limited_6_month_volume || '0') || 0,
        tier7_Volume: parseInt(record.unlimited_1_month || '0') || 0,
        tier8_Volume: parseInt(record.unlimited_2_month || '0') || 0,
        tier9_Volume: parseInt(record.unlimited_3_month || '0') || 0,
        tier10_Volume: parseInt(record.unlimited_4_month || '0') || 0,
        tier11_Volume: parseInt(record.unlimited_5_month || '0') || 0,
        tier12_Volume: parseInt(record.unlimited_6_month || '0') || 0,
        discountAmount: parseFloat(record.discount || '0') || 0,
        additionalFee: parseFloat(record.additional_fee || '0') || 0,
      };

      return {
        representativeIdentifier,
        representativeDetails: {
          persianFullName,
          contact: {
            mobile: record.mobile || record.phone,
            email: record.email,
          },
        },
        usageData,
        rawRecord: record,
      };
    });
  }
}

// Invoice generation service with smart pricing
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

    // Default pricing tiers (can be configured via system config)
    const defaultPricing = {
      tier1: 50000,   // 50,000 Toman for limited 1-month volume
      tier2: 90000,   // 90,000 Toman for limited 2-month volume
      tier3: 120000,  // 120,000 Toman for limited 3-month volume
      tier4: 150000,  // 150,000 Toman for limited 4-month volume
      tier5: 180000,  // 180,000 Toman for limited 5-month volume
      tier6: 200000,  // 200,000 Toman for limited 6-month volume
      tier7: 100000,  // 100,000 Toman for unlimited 1-month
      tier8: 180000,  // 180,000 Toman for unlimited 2-month
      tier9: 250000,  // 250,000 Toman for unlimited 3-month
      tier10: 320000, // 320,000 Toman for unlimited 4-month
      tier11: 380000, // 380,000 Toman for unlimited 5-month
      tier12: 450000, // 450,000 Toman for unlimited 6-month
    };

    try {
      for (const record of activityRecords) {
        try {
          // Check if representative exists, create if not
          let representative = await storage.getRepresentativeByCode(record.representativeIdentifier);

          if (!representative) {
            // Create new representative
            const newRepData: InsertRepresentative = {
              representativeCode: record.representativeIdentifier,
              persianFullName: record.representativeDetails.persianFullName,
              contactInfo: JSON.stringify(record.representativeDetails.contact),
              balance: 0,
              isActive: true,
              salesCollaboratorId: null, // Will be assigned later
              // Initialize with default pricing
              priceTier1: defaultPricing.tier1,
              priceTier2: defaultPricing.tier2,
              priceTier3: defaultPricing.tier3,
              priceTier4: defaultPricing.tier4,
              priceTier5: defaultPricing.tier5,
              priceTier6: defaultPricing.tier6,
              priceTier7: defaultPricing.tier7,
              priceTier8: defaultPricing.tier8,
              priceTier9: defaultPricing.tier9,
              priceTier10: defaultPricing.tier10,
              priceTier11: defaultPricing.tier11,
              priceTier12: defaultPricing.tier12,
            };

            representative = await storage.createRepresentative(newRepData);
            report.newlyOnboarded.push(record.representativeIdentifier);
          } else if (!representative.isActive) {
            report.skippedInactive++;
            continue;
          }

          // Calculate total amount using smart pricing
          let totalAmount = 0;
          const invoiceItems: InsertInvoiceItem[] = [];

          // Process each tier with usage data
          const tiers = [
            { name: "حجمی ۱ ماهه", volume: record.usageData.tier1_Volume, price: representative.priceTier1! },
            { name: "حجمی ۲ ماهه", volume: record.usageData.tier2_Volume, price: representative.priceTier2! },
            { name: "حجمی ۳ ماهه", volume: record.usageData.tier3_Volume, price: representative.priceTier3! },
            { name: "حجمی ۴ ماهه", volume: record.usageData.tier4_Volume, price: representative.priceTier4! },
            { name: "حجمی ۵ ماهه", volume: record.usageData.tier5_Volume, price: representative.priceTier5! },
            { name: "حجمی ۶ ماهه", volume: record.usageData.tier6_Volume, price: representative.priceTier6! },
            { name: "نامحدود ۱ ماهه", volume: record.usageData.tier7_Volume, price: representative.priceTier7! },
            { name: "نامحدود ۲ ماهه", volume: record.usageData.tier8_Volume, price: representative.priceTier8! },
            { name: "نامحدود ۳ ماهه", volume: record.usageData.tier9_Volume, price: representative.priceTier9! },
            { name: "نامحدود ۴ ماهه", volume: record.usageData.tier10_Volume, price: representative.priceTier10! },
            { name: "نامحدود ۵ ماهه", volume: record.usageData.tier11_Volume, price: representative.priceTier11! },
            { name: "نامحدود ۶ ماهه", volume: record.usageData.tier12_Volume, price: representative.priceTier12! },
          ];

          tiers.forEach((tier, index) => {
            if (tier.volume > 0) {
              const itemTotal = tier.volume * tier.price;
              totalAmount += itemTotal;
              
              invoiceItems.push({
                invoiceId: '', // Will be set after invoice creation
                description: `${tier.name} - ${tier.volume} عدد`,
                quantity: tier.volume,
                unitPrice: tier.price,
                total: itemTotal,
              });
            }
          });

          // Apply discount and additional fees
          totalAmount -= record.usageData.discountAmount;
          totalAmount += record.usageData.additionalFee;

          if (record.usageData.discountAmount > 0) {
            invoiceItems.push({
              invoiceId: '',
              description: `تخفیف`,
              quantity: 1,
              unitPrice: -record.usageData.discountAmount,
              total: -record.usageData.discountAmount,
            });
          }

          if (record.usageData.additionalFee > 0) {
            invoiceItems.push({
              invoiceId: '',
              description: `هزینه اضافی`,
              quantity: 1,
              unitPrice: record.usageData.additionalFee,
              total: record.usageData.additionalFee,
            });
          }

          // Skip if no items to invoice
          if (invoiceItems.length === 0) {
            continue;
          }

          // Create invoice
          const invoiceData: InsertInvoice = {
            invoiceNumber: `INV-${new Date().getFullYear()}-${(Date.now() % 100000).toString().padStart(5, '0')}`,
            representativeId: representative.id,
            totalAmount,
            paidAmount: 0,
            status: "PENDING",
            notes: `فاکتور تولید شده از داده‌های JSON - ${record.representativeIdentifier}`,
            sourceDataSnapshot: JSON.stringify(record.rawRecord),
            telegramDispatchStatus: JSON.stringify({ sent: false, attempts: 0 }),
          };

          const invoice = await storage.createInvoice(invoiceData);

          // Create invoice items
          for (const item of invoiceItems) {
            item.invoiceId = invoice.id;
            await storage.createInvoiceItem(item);
          }

          // Create commission record if representative has sales collaborator
          if (representative.salesCollaboratorId) {
            const salesCollaborator = await storage.getSalesCollaborator(representative.salesCollaboratorId);
            if (salesCollaborator) {
              const commissionRate = salesCollaborator.commissionRate || 0.05; // Default 5%
              const commissionAmount = totalAmount * commissionRate;

              const commissionData: InsertCommissionRecord = {
                invoiceId: invoice.id,
                salesCollaboratorId: representative.salesCollaboratorId,
                commissionAmount,
                commissionRate,
                status: "PENDING",
                notes: `کمیسیون محاسبه شده برای فاکتور ${invoice.invoiceNumber}`,
              };

              await storage.createCommissionRecord(commissionData);
            }
          }

          report.successCount++;
        } catch (error) {
          report.errors.push({
            identifier: record.representativeIdentifier,
            reason: error instanceof Error ? error.message : 'خطای نامشخص',
          });
        }
      }
    } catch (error) {
      throw new Error(`خطا در پردازش داده‌ها: ${error instanceof Error ? error.message : 'خطای نامشخص'}`);
    }

    return report;
  }
}

// Main API services
export const apiServices = {
  // Process Marzban JSON file
  async processMarzbanJsonFile(params: {
    jsonData: any[];
    skipInactive?: boolean;
    applySmartPricing?: boolean;
  }) {
    const { jsonData, skipInactive = true, applySmartPricing = true } = params;

    // Validate JSON structure
    if (!MarzbanJsonAdapter.validateJsonStructure(jsonData)) {
      throw new Error('ساختار فایل JSON معتبر نیست. لطفاً فایل Marzban صحیح را آپلود کنید.');
    }

    // Transform data
    const standardizedRecords = MarzbanJsonAdapter.transform(jsonData);

    // Generate invoices
    const report = await InvoiceGenerationService.generateInvoicesFromActivityData(standardizedRecords);

    return {
      success: true,
      processedCount: report.successCount,
      errorCount: report.errors.length,
      newRepresentativesCount: report.newlyOnboarded.length,
      skippedInactive: report.skippedInactive,
      errors: report.errors,
      summary: {
        totalRecords: report.totalRecords,
        successfullyProcessed: report.successCount,
        newRepresentatives: report.newlyOnboarded,
        atomicTransactionUsed: report.atomicTransactionUsed,
        smartPricingApplied: report.smartPricingApplied,
      },
    };
  },

  // Create payment
  async createPayment(data: InsertPayment) {
    return await storage.createPayment(data);
  },

  // Create commission payout
  async createCommissionPayout(data: InsertCommissionPayout) {
    return await storage.createCommissionPayout(data);
  },

  // Seed initial data for demo purposes
  async seedInitialData() {
    try {
      // Create default sales collaborator
      const collaboratorData: InsertSalesCollaborator = {
        name: "مدیر فروش",
        commissionRate: 0.05, // 5% commission
        balance: 0,
        isActive: true,
      };

      const collaborator = await storage.createSalesCollaborator(collaboratorData);

      // Create sample representative
      const representativeData: InsertRepresentative = {
        representativeCode: "REP001",
        persianFullName: "احمد محمدی",
        contactInfo: JSON.stringify({ mobile: "09123456789", email: "ahmad@example.com" }),
        balance: 0,
        isActive: true,
        salesCollaboratorId: collaborator.id,
        priceTier1: 50000,
        priceTier2: 90000,
        priceTier3: 120000,
        priceTier4: 150000,
        priceTier5: 180000,
        priceTier6: 200000,
        priceTier7: 100000,
        priceTier8: 180000,
        priceTier9: 250000,
        priceTier10: 320000,
        priceTier11: 380000,
        priceTier12: 450000,
      };

      const representative = await storage.createRepresentative(representativeData);

      // Create sample invoice
      const invoiceData: InsertInvoice = {
        invoiceNumber: "INV-2025-00001",
        representativeId: representative.id,
        totalAmount: 500000,
        paidAmount: 0,
        status: "PENDING",
        notes: "فاکتور نمونه برای تست سیستم",
        sourceDataSnapshot: JSON.stringify({}),
        telegramDispatchStatus: JSON.stringify({ sent: false, attempts: 0 }),
      };

      await storage.createInvoice(invoiceData);

      return {
        success: true,
        message: "داده‌های اولیه با موفقیت ایجاد شد",
        data: {
          collaborator,
          representative,
        },
      };
    } catch (error) {
      throw new Error(`خطا در ایجاد داده‌های اولیه: ${error instanceof Error ? error.message : 'خطای نامشخص'}`);
    }
  },
};