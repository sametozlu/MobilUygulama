import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("technician"), // technician, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Field tasks table
export const fieldTasks = pgTable("field_tasks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, in_progress, completed
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high
  location: text("location").notNull(),
  assignedToId: varchar("assigned_to_id").references(() => users.id),
  customerName: varchar("customer_name", { length: 255 }),
  customerPhone: varchar("customer_phone", { length: 20 }),
  vehiclePlate: varchar("vehicle_plate", { length: 20 }),
  scheduledDate: timestamp("scheduled_date"),
  scheduledStartTime: varchar("scheduled_start_time", { length: 10 }),
  scheduledEndTime: varchar("scheduled_end_time", { length: 10 }),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Field reports table
export const fieldReports = pgTable("field_reports", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: uuid("task_id").references(() => fieldTasks.id),
  userId: varchar("user_id").references(() => users.id).notNull(),
  location: text("location").notNull(),
  vehiclePlate: varchar("vehicle_plate", { length: 20 }).notNull(),
  operationType: varchar("operation_type", { length: 100 }).notNull(),
  customerName: varchar("customer_name", { length: 255 }),
  customerPhone: varchar("customer_phone", { length: 20 }),
  details: text("details"),
  photos: text("photos").array(), // Array of photo URLs/paths
  reportDate: timestamp("report_date").notNull(),
  reportTime: varchar("report_time", { length: 10 }).notNull(),
  status: varchar("status", { length: 20 }).default("draft"), // draft, submitted
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  assignedTasks: many(fieldTasks),
  reports: many(fieldReports),
}));

export const fieldTasksRelations = relations(fieldTasks, ({ one, many }) => ({
  assignedTo: one(users, {
    fields: [fieldTasks.assignedToId],
    references: [users.id],
  }),
  reports: many(fieldReports),
}));

export const fieldReportsRelations = relations(fieldReports, ({ one }) => ({
  task: one(fieldTasks, {
    fields: [fieldReports.taskId],
    references: [fieldTasks.id],
  }),
  user: one(users, {
    fields: [fieldReports.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFieldTaskSchema = createInsertSchema(fieldTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFieldReportSchema = createInsertSchema(fieldReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertFieldTask = z.infer<typeof insertFieldTaskSchema>;
export type FieldTask = typeof fieldTasks.$inferSelect;
export type InsertFieldReport = z.infer<typeof insertFieldReportSchema>;
export type FieldReport = typeof fieldReports.$inferSelect;

// Extended types for relations
export type FieldTaskWithUser = FieldTask & {
  assignedTo?: User;
};

export type FieldReportWithRelations = FieldReport & {
  task?: FieldTask;
  user?: User;
};
