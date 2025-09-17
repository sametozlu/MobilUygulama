import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertFieldTaskSchema, insertFieldReportSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user has @netmon.com.tr email
      if (!user.email?.endsWith('@netmon.com.tr')) {
        return res.status(403).json({ message: "Access restricted to Netmon employees only" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Field tasks routes
  app.get('/api/field-tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.email?.endsWith('@netmon.com.tr')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { status, date, search, all } = req.query;
      const filters = { status, date, search };
      
      // Admins can see all tasks, technicians only see their own
      const taskUserId = (user.role === 'admin' && all === 'true') ? undefined : userId;
      
      const tasks = await storage.getFieldTasks(taskUserId, filters);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching field tasks:", error);
      res.status(500).json({ message: "Failed to fetch field tasks" });
    }
  });

  app.get('/api/field-tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.email?.endsWith('@netmon.com.tr')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const task = await storage.getFieldTask(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Check if user can access this task
      if (user.role !== 'admin' && task.assignedToId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(task);
    } catch (error) {
      console.error("Error fetching field task:", error);
      res.status(500).json({ message: "Failed to fetch field task" });
    }
  });

  app.post('/api/field-tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.email?.endsWith('@netmon.com.tr') || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const taskData = insertFieldTaskSchema.parse(req.body);
      const task = await storage.createFieldTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating field task:", error);
      res.status(500).json({ message: "Failed to create field task" });
    }
  });

  app.patch('/api/field-tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.email?.endsWith('@netmon.com.tr')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const task = await storage.getFieldTask(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Check if user can update this task
      if (user.role !== 'admin' && task.assignedToId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updateData = insertFieldTaskSchema.partial().parse(req.body);
      const updatedTask = await storage.updateFieldTask(req.params.id, updateData);
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating field task:", error);
      res.status(500).json({ message: "Failed to update field task" });
    }
  });

  // Field reports routes
  app.get('/api/field-reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.email?.endsWith('@netmon.com.tr')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { status, taskId, all } = req.query;
      const filters = { status, taskId };
      
      // Admins can see all reports, technicians only see their own
      const reportUserId = (user.role === 'admin' && all === 'true') ? undefined : userId;
      
      const reports = await storage.getFieldReports(reportUserId, filters);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching field reports:", error);
      res.status(500).json({ message: "Failed to fetch field reports" });
    }
  });

  app.post('/api/field-reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.email?.endsWith('@netmon.com.tr')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const reportData = insertFieldReportSchema.parse({
        ...req.body,
        userId,
      });
      
      const report = await storage.createFieldReport(reportData);
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating field report:", error);
      res.status(500).json({ message: "Failed to create field report" });
    }
  });

  app.patch('/api/field-reports/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.email?.endsWith('@netmon.com.tr')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const report = await storage.getFieldReport(req.params.id);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      // Check if user can update this report
      if (user.role !== 'admin' && report.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updateData = insertFieldReportSchema.partial().parse(req.body);
      const updatedReport = await storage.updateFieldReport(req.params.id, updateData);
      res.json(updatedReport);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating field report:", error);
      res.status(500).json({ message: "Failed to update field report" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/user-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.email?.endsWith('@netmon.com.tr')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.email?.endsWith('@netmon.com.tr') || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/recent-activities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.email?.endsWith('@netmon.com.tr') || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const activities = await storage.getRecentActivities();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      res.status(500).json({ message: "Failed to fetch recent activities" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
