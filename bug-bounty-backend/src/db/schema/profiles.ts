import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";

export const userRole = pgEnum("user_role", [
  "researcher",
  "organization_owner",
  "organization_member",
  "triager",
  "platform_admin",
]);

export const organizationMemberRole = pgEnum("organization_member_role", [
  "owner",
  "triager",
]);

export const programStatus = pgEnum("program_status", [
  "active",
  "paused",
  "private",
]);

export const reportSeverity = pgEnum("report_severity", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const reportStatus = pgEnum("report_status", [
  "submitted",
  "triaged",
  "resolved",
  "rejected",
]);

export const featureRequestStatus = pgEnum("feature_request_status", [
  "open",
  "planned",
  "in_progress",
  "completed",
]);

export const featureRequestSubmissionStatus = pgEnum("feature_request_submission_status", [
  "submitted",
  "approved",
  "rejected",
]);

export const escrowSourceType = pgEnum("escrow_source_type", [
  "program",
  "feature_request",
]);

export const escrowStatus = pgEnum("escrow_status", [
  "held",
  "released",
]);

export const profiles = pgTable("profiles", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  email: text("email").unique(),
  fullName: text("full_name").notNull(),
  username: text("username").unique(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  primaryRole: userRole("primary_role").notNull().default("researcher"),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  isVerified: boolean("is_verified").notNull().default(false),
  isBlocked: boolean("is_blocked").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export const organizationMembers = pgTable("organization_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  role: organizationMemberRole("role").notNull().default("triager"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export const programs = pgTable("programs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  minBounty: integer("min_bounty").notNull().default(0),
  maxBounty: integer("max_bounty").notNull().default(0),
  status: programStatus("status").notNull().default("active"),
  scope: text("scope").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  programId: uuid("program_id")
    .notNull()
    .references(() => programs.id, { onDelete: "cascade" }),
  researcherId: uuid("researcher_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  severity: reportSeverity("severity").notNull(),
  status: reportStatus("status").notNull().default("submitted"),
  assignedTriagerId: uuid("assigned_triager_id").references(() => profiles.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export const reportMessages = pgTable("report_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id")
    .notNull()
    .references(() => reports.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export const featureRequests = pgTable("feature_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  repositoryUrl: text("repository_url").notNull(),
  bounty: integer("bounty").notNull().default(0),
  status: featureRequestStatus("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export const featureRequestSubmissions = pgTable("feature_request_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  featureRequestId: uuid("feature_request_id")
    .notNull()
    .references(() => featureRequests.id, { onDelete: "cascade" }),
  researcherId: uuid("researcher_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  submissionUrl: text("submission_url").notNull(),
  status: featureRequestSubmissionStatus("status").notNull().default("submitted"),
  assignedTriagerId: uuid("assigned_triager_id").references(() => profiles.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export const escrowFunds = pgTable("escrow_funds", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  sourceType: escrowSourceType("source_type").notNull(),
  sourceId: uuid("source_id").notNull(),
  amount: integer("amount").notNull().default(0),
  status: escrowStatus("status").notNull().default("held"),
  recipientId: uuid("recipient_id").references(() => profiles.id, { onDelete: "set null" }),
  releaseReason: text("release_reason"),
  releasedAt: timestamp("released_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type NewOrganizationMember = typeof organizationMembers.$inferInsert;
export type Program = typeof programs.$inferSelect;
export type NewProgram = typeof programs.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type ReportMessage = typeof reportMessages.$inferSelect;
export type NewReportMessage = typeof reportMessages.$inferInsert;
export type FeatureRequest = typeof featureRequests.$inferSelect;
export type NewFeatureRequest = typeof featureRequests.$inferInsert;
export type FeatureRequestSubmission = typeof featureRequestSubmissions.$inferSelect;
export type NewFeatureRequestSubmission = typeof featureRequestSubmissions.$inferInsert;
export type EscrowFund = typeof escrowFunds.$inferSelect;
export type NewEscrowFund = typeof escrowFunds.$inferInsert;
