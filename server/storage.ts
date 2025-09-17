import {
  users,
  fieldTasks,
  fieldReports,
  type User,
  type UpsertUser,
  type FieldTask,
  type InsertFieldTask,
  type FieldReport,
  type InsertFieldReport,
  type FieldTaskWithUser,
  type FieldReportWithRelations,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, or, gte, lte, count, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Field task operations
  getFieldTasks(userId?: string, filters?: {
    status?: string;
    date?: string;
    search?: string;
  }): Promise<FieldTaskWithUser[]>;
  getFieldTask(id: string): Promise<FieldTaskWithUser | undefined>;
  createFieldTask(task: InsertFieldTask): Promise<FieldTask>;
  updateFieldTask(id: string, updates: Partial<InsertFieldTask>): Promise<FieldTask>;
  deleteFieldTask(id: string): Promise<void>;
  
  // Field report operations
  getFieldReports(userId?: string, filters?: {
    status?: string;
    taskId?: string;
  }): Promise<FieldReportWithRelations[]>;
  getFieldReport(id: string): Promise<FieldReportWithRelations | undefined>;
  createFieldReport(report: InsertFieldReport): Promise<FieldReport>;
  updateFieldReport(id: string, updates: Partial<InsertFieldReport>): Promise<FieldReport>;
  
  // Analytics
  getUserStats(userId: string): Promise<{
    todayTasks: number;
    completedTasks: number;
    pendingTasks: number;
    weeklyTasks: number;
  }>;
  
  getAllUsers(): Promise<User[]>;
  getRecentActivities(): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
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
  
  // Field task operations
  async getFieldTasks(userId?: string, filters?: {
    status?: string;
    date?: string;
    search?: string;
  }): Promise<FieldTaskWithUser[]> {
    let query = db
      .select({
        id: fieldTasks.id,
        title: fieldTasks.title,
        description: fieldTasks.description,
        status: fieldTasks.status,
        priority: fieldTasks.priority,
        location: fieldTasks.location,
        assignedToId: fieldTasks.assignedToId,
        customerName: fieldTasks.customerName,
        customerPhone: fieldTasks.customerPhone,
        vehiclePlate: fieldTasks.vehiclePlate,
        scheduledDate: fieldTasks.scheduledDate,
        scheduledStartTime: fieldTasks.scheduledStartTime,
        scheduledEndTime: fieldTasks.scheduledEndTime,
        completedAt: fieldTasks.completedAt,
        createdAt: fieldTasks.createdAt,
        updatedAt: fieldTasks.updatedAt,
        assignedTo: users,
      })
      .from(fieldTasks)
      .leftJoin(users, eq(fieldTasks.assignedToId, users.id));

    const conditions = [];

    if (userId) {
      conditions.push(eq(fieldTasks.assignedToId, userId));
    }

    if (filters?.status) {
      conditions.push(eq(fieldTasks.status, filters.status));
    }

    if (filters?.date) {
      const date = new Date(filters.date);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      conditions.push(
        and(
          gte(fieldTasks.scheduledDate, date),
          lte(fieldTasks.scheduledDate, nextDay)
        )
      );
    }

    if (filters?.search) {
      conditions.push(
        or(
          ilike(fieldTasks.title, `%${filters.search}%`),
          ilike(fieldTasks.location, `%${filters.search}%`),
          ilike(fieldTasks.customerName, `%${filters.search}%`)
        )
      );
    }

    let finalQuery = query;
    if (conditions.length > 0) {
      finalQuery = query.where(and(...conditions));
    }

    const result = await finalQuery.orderBy(desc(fieldTasks.scheduledDate));
    
    return result.map(row => ({
      ...row,
      assignedTo: row.assignedTo || undefined,
    }));
  }

  async getFieldTask(id: string): Promise<FieldTaskWithUser | undefined> {
    const [result] = await db
      .select({
        id: fieldTasks.id,
        title: fieldTasks.title,
        description: fieldTasks.description,
        status: fieldTasks.status,
        priority: fieldTasks.priority,
        location: fieldTasks.location,
        assignedToId: fieldTasks.assignedToId,
        customerName: fieldTasks.customerName,
        customerPhone: fieldTasks.customerPhone,
        vehiclePlate: fieldTasks.vehiclePlate,
        scheduledDate: fieldTasks.scheduledDate,
        scheduledStartTime: fieldTasks.scheduledStartTime,
        scheduledEndTime: fieldTasks.scheduledEndTime,
        completedAt: fieldTasks.completedAt,
        createdAt: fieldTasks.createdAt,
        updatedAt: fieldTasks.updatedAt,
        assignedTo: users,
      })
      .from(fieldTasks)
      .leftJoin(users, eq(fieldTasks.assignedToId, users.id))
      .where(eq(fieldTasks.id, id));

    if (!result) return undefined;

    return {
      ...result,
      assignedTo: result.assignedTo || undefined,
    };
  }

  async createFieldTask(task: InsertFieldTask): Promise<FieldTask> {
    const [newTask] = await db.insert(fieldTasks).values(task).returning();
    return newTask;
  }

  async updateFieldTask(id: string, updates: Partial<InsertFieldTask>): Promise<FieldTask> {
    const [updatedTask] = await db
      .update(fieldTasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(fieldTasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteFieldTask(id: string): Promise<void> {
    await db.delete(fieldTasks).where(eq(fieldTasks.id, id));
  }

  // Field report operations
  async getFieldReports(userId?: string, filters?: {
    status?: string;
    taskId?: string;
  }): Promise<FieldReportWithRelations[]> {
    let query = db
      .select({
        id: fieldReports.id,
        taskId: fieldReports.taskId,
        userId: fieldReports.userId,
        location: fieldReports.location,
        vehiclePlate: fieldReports.vehiclePlate,
        operationType: fieldReports.operationType,
        customerName: fieldReports.customerName,
        customerPhone: fieldReports.customerPhone,
        details: fieldReports.details,
        photos: fieldReports.photos,
        reportDate: fieldReports.reportDate,
        reportTime: fieldReports.reportTime,
        status: fieldReports.status,
        createdAt: fieldReports.createdAt,
        updatedAt: fieldReports.updatedAt,
        task: fieldTasks,
        user: users,
      })
      .from(fieldReports)
      .leftJoin(fieldTasks, eq(fieldReports.taskId, fieldTasks.id))
      .leftJoin(users, eq(fieldReports.userId, users.id));

    const conditions = [];

    if (userId) {
      conditions.push(eq(fieldReports.userId, userId));
    }

    if (filters?.status) {
      conditions.push(eq(fieldReports.status, filters.status));
    }

    if (filters?.taskId) {
      conditions.push(eq(fieldReports.taskId, filters.taskId));
    }

    let finalReportQuery = query;
    if (conditions.length > 0) {
      finalReportQuery = query.where(and(...conditions));
    }

    const result = await finalReportQuery.orderBy(desc(fieldReports.createdAt));
    
    return result.map(row => ({
      ...row,
      task: row.task || undefined,
      user: row.user || undefined,
    }));
  }

  async getFieldReport(id: string): Promise<FieldReportWithRelations | undefined> {
    const [result] = await db
      .select({
        id: fieldReports.id,
        taskId: fieldReports.taskId,
        userId: fieldReports.userId,
        location: fieldReports.location,
        vehiclePlate: fieldReports.vehiclePlate,
        operationType: fieldReports.operationType,
        customerName: fieldReports.customerName,
        customerPhone: fieldReports.customerPhone,
        details: fieldReports.details,
        photos: fieldReports.photos,
        reportDate: fieldReports.reportDate,
        reportTime: fieldReports.reportTime,
        status: fieldReports.status,
        createdAt: fieldReports.createdAt,
        updatedAt: fieldReports.updatedAt,
        task: fieldTasks,
        user: users,
      })
      .from(fieldReports)
      .leftJoin(fieldTasks, eq(fieldReports.taskId, fieldTasks.id))
      .leftJoin(users, eq(fieldReports.userId, users.id))
      .where(eq(fieldReports.id, id));

    if (!result) return undefined;

    return {
      ...result,
      task: result.task || undefined,
      user: result.user || undefined,
    };
  }

  async createFieldReport(report: InsertFieldReport): Promise<FieldReport> {
    const [newReport] = await db.insert(fieldReports).values(report).returning();
    return newReport;
  }

  async updateFieldReport(id: string, updates: Partial<InsertFieldReport>): Promise<FieldReport> {
    const [updatedReport] = await db
      .update(fieldReports)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(fieldReports.id, id))
      .returning();
    return updatedReport;
  }

  // Analytics
  async getUserStats(userId: string): Promise<{
    todayTasks: number;
    completedTasks: number;
    pendingTasks: number;
    weeklyTasks: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Today's tasks
    const [todayTasksResult] = await db
      .select({ count: count() })
      .from(fieldTasks)
      .where(
        and(
          eq(fieldTasks.assignedToId, userId),
          gte(fieldTasks.scheduledDate, today),
          lte(fieldTasks.scheduledDate, tomorrow)
        )
      );

    // Completed tasks
    const [completedTasksResult] = await db
      .select({ count: count() })
      .from(fieldTasks)
      .where(
        and(
          eq(fieldTasks.assignedToId, userId),
          eq(fieldTasks.status, "completed")
        )
      );

    // Pending tasks
    const [pendingTasksResult] = await db
      .select({ count: count() })
      .from(fieldTasks)
      .where(
        and(
          eq(fieldTasks.assignedToId, userId),
          eq(fieldTasks.status, "pending")
        )
      );

    // Weekly tasks
    const [weeklyTasksResult] = await db
      .select({ count: count() })
      .from(fieldTasks)
      .where(
        and(
          eq(fieldTasks.assignedToId, userId),
          gte(fieldTasks.scheduledDate, oneWeekAgo)
        )
      );

    return {
      todayTasks: todayTasksResult.count,
      completedTasks: completedTasksResult.count,
      pendingTasks: pendingTasksResult.count,
      weeklyTasks: weeklyTasksResult.count,
    };
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.firstName, users.lastName);
  }

  async getRecentActivities(): Promise<any[]> {
    // Get recent task updates and report submissions
    const recentTasks = await db
      .select({
        id: fieldTasks.id,
        type: sql<string>`'task'`.as('type'),
        action: fieldTasks.status,
        location: fieldTasks.location,
        timestamp: fieldTasks.updatedAt,
        user: users,
      })
      .from(fieldTasks)
      .leftJoin(users, eq(fieldTasks.assignedToId, users.id))
      .where(eq(fieldTasks.status, "completed"))
      .orderBy(desc(fieldTasks.updatedAt))
      .limit(10);

    const recentReports = await db
      .select({
        id: fieldReports.id,
        type: sql<string>`'report'`.as('type'),
        action: fieldReports.status,
        location: fieldReports.location,
        timestamp: fieldReports.createdAt,
        user: users,
      })
      .from(fieldReports)
      .leftJoin(users, eq(fieldReports.userId, users.id))
      .orderBy(desc(fieldReports.createdAt))
      .limit(10);

    // Combine and sort by timestamp
    const activities = [...recentTasks, ...recentReports]
      .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
      .slice(0, 10);

    return activities;
  }
}

export const storage = new DatabaseStorage();
