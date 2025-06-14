import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertSalesCollaboratorSchema,
  insertRepresentativeSchema,
  insertPaymentSchema,
  insertCommissionPayoutSchema,
} from "@shared/schema";
import { apiServices } from "./services/api";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Sales Collaborators
  app.get("/api/sales-collaborators", isAuthenticated, async (req, res) => {
    try {
      const collaborators = await storage.getSalesCollaborators();
      res.json(collaborators);
    } catch (error) {
      console.error("Error fetching sales collaborators:", error);
      res.status(500).json({ message: "Failed to fetch sales collaborators" });
    }
  });

  app.get("/api/sales-collaborators/:id", isAuthenticated, async (req, res) => {
    try {
      const collaborator = await storage.getSalesCollaborator(req.params.id);
      if (!collaborator) {
        return res.status(404).json({ message: "Sales collaborator not found" });
      }
      res.json(collaborator);
    } catch (error) {
      console.error("Error fetching sales collaborator:", error);
      res.status(500).json({ message: "Failed to fetch sales collaborator" });
    }
  });

  app.post("/api/sales-collaborators", isAuthenticated, async (req, res) => {
    try {
      const data = insertSalesCollaboratorSchema.parse(req.body);
      const collaborator = await storage.createSalesCollaborator(data);
      res.status(201).json(collaborator);
    } catch (error) {
      console.error("Error creating sales collaborator:", error);
      res.status(400).json({ message: "Failed to create sales collaborator" });
    }
  });

  app.put("/api/sales-collaborators/:id", isAuthenticated, async (req, res) => {
    try {
      const data = insertSalesCollaboratorSchema.partial().parse(req.body);
      const collaborator = await storage.updateSalesCollaborator(req.params.id, data);
      res.json(collaborator);
    } catch (error) {
      console.error("Error updating sales collaborator:", error);
      res.status(400).json({ message: "Failed to update sales collaborator" });
    }
  });

  app.delete("/api/sales-collaborators/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteSalesCollaborator(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting sales collaborator:", error);
      res.status(500).json({ message: "Failed to delete sales collaborator" });
    }
  });

  // Representatives
  app.get("/api/representatives", isAuthenticated, async (req, res) => {
    try {
      const representatives = await storage.getRepresentatives();
      res.json(representatives);
    } catch (error) {
      console.error("Error fetching representatives:", error);
      res.status(500).json({ message: "Failed to fetch representatives" });
    }
  });

  app.get("/api/representatives/:id", isAuthenticated, async (req, res) => {
    try {
      const representative = await storage.getRepresentative(req.params.id);
      if (!representative) {
        return res.status(404).json({ message: "Representative not found" });
      }
      res.json(representative);
    } catch (error) {
      console.error("Error fetching representative:", error);
      res.status(500).json({ message: "Failed to fetch representative" });
    }
  });

  app.post("/api/representatives", isAuthenticated, async (req, res) => {
    try {
      const data = insertRepresentativeSchema.parse(req.body);
      const representative = await storage.createRepresentative(data);
      res.status(201).json(representative);
    } catch (error) {
      console.error("Error creating representative:", error);
      res.status(400).json({ message: "Failed to create representative" });
    }
  });

  app.put("/api/representatives/:id", isAuthenticated, async (req, res) => {
    try {
      const data = insertRepresentativeSchema.partial().parse(req.body);
      const representative = await storage.updateRepresentative(req.params.id, data);
      res.json(representative);
    } catch (error) {
      console.error("Error updating representative:", error);
      res.status(400).json({ message: "Failed to update representative" });
    }
  });

  app.delete("/api/representatives/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteRepresentative(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting representative:", error);
      res.status(500).json({ message: "Failed to delete representative" });
    }
  });

  // Invoices
  app.get("/api/invoices", isAuthenticated, async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", isAuthenticated, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      const items = await storage.getInvoiceItems(invoice.id);
      res.json({ ...invoice, items });
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.get("/api/representatives/:id/invoices", isAuthenticated, async (req, res) => {
    try {
      const invoices = await storage.getInvoicesByRepresentative(req.params.id);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching representative invoices:", error);
      res.status(500).json({ message: "Failed to fetch representative invoices" });
    }
  });

  // Payments
  app.get("/api/payments", isAuthenticated, async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.get("/api/representatives/:id/payments", isAuthenticated, async (req, res) => {
    try {
      const payments = await storage.getPaymentsByRepresentative(req.params.id);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching representative payments:", error);
      res.status(500).json({ message: "Failed to fetch representative payments" });
    }
  });

  app.post("/api/payments", isAuthenticated, async (req, res) => {
    try {
      const data = insertPaymentSchema.parse(req.body);
      const payment = await apiServices.createPayment(data);
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(400).json({ message: "Failed to create payment" });
    }
  });

  // Commission Records
  app.get("/api/commission-records", isAuthenticated, async (req, res) => {
    try {
      const records = await storage.getCommissionRecords();
      res.json(records);
    } catch (error) {
      console.error("Error fetching commission records:", error);
      res.status(500).json({ message: "Failed to fetch commission records" });
    }
  });

  // Commission Payouts
  app.get("/api/commission-payouts", isAuthenticated, async (req, res) => {
    try {
      const payouts = await storage.getCommissionPayouts();
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching commission payouts:", error);
      res.status(500).json({ message: "Failed to fetch commission payouts" });
    }
  });

  app.post("/api/commission-payouts", isAuthenticated, async (req, res) => {
    try {
      const data = insertCommissionPayoutSchema.parse(req.body);
      const payout = await apiServices.createCommissionPayout(data);
      res.status(201).json(payout);
    } catch (error) {
      console.error("Error creating commission payout:", error);
      res.status(400).json({ message: "Failed to create commission payout" });
    }
  });

  // JSON File Processing
  app.post("/api/process-marzban-json", isAuthenticated, async (req, res) => {
    try {
      const { fileContent, fileName, autoCreateRepresentatives = true, applySmartPricing = true } = req.body;
      
      if (!fileContent || !fileName) {
        return res.status(400).json({ message: "File content and name are required" });
      }

      const result = await apiServices.processMarzbanJsonFile({
        fileContent,
        fileName,
        autoCreateRepresentatives,
        applySmartPricing,
      });

      res.json(result);
    } catch (error) {
      console.error("Error processing Marzban JSON:", error);
      res.status(500).json({ message: "Failed to process JSON file" });
    }
  });

  // System Configuration
  app.get("/api/system-configs", isAuthenticated, async (req, res) => {
    try {
      const configs = await storage.getSystemConfigs();
      res.json(configs);
    } catch (error) {
      console.error("Error fetching system configs:", error);
      res.status(500).json({ message: "Failed to fetch system configs" });
    }
  });

  // Seed data for development
  app.post("/api/seed-data", isAuthenticated, async (req, res) => {
    try {
      const result = await apiServices.seedInitialData();
      res.json(result);
    } catch (error) {
      console.error("Error seeding data:", error);
      res.status(500).json({ message: "Failed to seed data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
