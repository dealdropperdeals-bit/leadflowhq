import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

import { nowIso } from "@/lib/utils";
import type { Lead, LeadUpdateInput, ScanQuery, ScanRun } from "@/types/lead";

const dbDirectory = path.join(process.cwd(), "db");
const dbPath = path.join(dbDirectory, "local-b2b-lead-scanner.sqlite");

let dbInstance: Database.Database | null = null;

function getDb() {
  if (dbInstance) return dbInstance;
  fs.mkdirSync(dbDirectory, { recursive: true });
  dbInstance = new Database(dbPath);
  dbInstance.pragma("journal_mode = WAL");
  initializeSchema(dbInstance);
  return dbInstance;
}

function initializeSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      business_name TEXT NOT NULL,
      niche TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip TEXT DEFAULT '',
      address TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      email TEXT DEFAULT '',
      website TEXT DEFAULT '',
      rating REAL,
      review_count INTEGER DEFAULT 0,
      has_website INTEGER DEFAULT 0,
      has_contact_page INTEGER DEFAULT 0,
      has_email INTEGER DEFAULT 0,
      has_phone INTEGER DEFAULT 0,
      site_title TEXT DEFAULT '',
      meta_description TEXT DEFAULT '',
      https_enabled INTEGER DEFAULT 0,
      clear_cta_detected INTEGER DEFAULT 0,
      trust_signals_detected INTEGER DEFAULT 0,
      booking_or_contact_form_detected INTEGER DEFAULT 0,
      website_quality_score INTEGER DEFAULT 0,
      outreach_priority_score INTEGER DEFAULT 0,
      lead_score INTEGER DEFAULT 0,
      score_reasons_json TEXT DEFAULT '[]',
      source_name TEXT DEFAULT '',
      saved INTEGER DEFAULT 0,
      hidden INTEGER DEFAULT 0,
      tags_json TEXT DEFAULT '[]',
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scan_runs (
      id TEXT PRIMARY KEY,
      niche TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip TEXT DEFAULT '',
      radius INTEGER DEFAULT 25,
      source_name TEXT NOT NULL,
      lead_count INTEGER DEFAULT 0,
      mode TEXT NOT NULL,
      status_message TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );
  `);
}

function rowToLead(row: Record<string, unknown>): Lead {
  return {
    id: String(row.id),
    business_name: String(row.business_name),
    niche: String(row.niche),
    city: String(row.city),
    state: String(row.state),
    zip: String(row.zip ?? ""),
    address: String(row.address ?? ""),
    phone: String(row.phone ?? ""),
    email: String(row.email ?? ""),
    website: String(row.website ?? ""),
    rating: row.rating == null ? null : Number(row.rating),
    review_count: Number(row.review_count ?? 0),
    has_website: Number(row.has_website ?? 0) === 1,
    has_contact_page: Number(row.has_contact_page ?? 0) === 1,
    has_email: Number(row.has_email ?? 0) === 1,
    has_phone: Number(row.has_phone ?? 0) === 1,
    site_title: String(row.site_title ?? ""),
    meta_description: String(row.meta_description ?? ""),
    https_enabled: Number(row.https_enabled ?? 0) === 1,
    clear_cta_detected: Number(row.clear_cta_detected ?? 0) === 1,
    trust_signals_detected: Number(row.trust_signals_detected ?? 0) === 1,
    booking_or_contact_form_detected: Number(row.booking_or_contact_form_detected ?? 0) === 1,
    website_quality_score: Number(row.website_quality_score ?? 0),
    outreach_priority_score: Number(row.outreach_priority_score ?? 0),
    lead_score: Number(row.lead_score ?? 0),
    score_reasons: JSON.parse(String(row.score_reasons_json ?? "[]")),
    source_name: String(row.source_name ?? ""),
    saved: Number(row.saved ?? 0) === 1,
    hidden: Number(row.hidden ?? 0) === 1,
    tags: JSON.parse(String(row.tags_json ?? "[]")),
    notes: String(row.notes ?? ""),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function rowToScanRun(row: Record<string, unknown>): ScanRun {
  return {
    id: String(row.id),
    niche: String(row.niche),
    city: String(row.city),
    state: String(row.state),
    zip: String(row.zip ?? ""),
    radius: Number(row.radius ?? 25),
    source_name: String(row.source_name),
    lead_count: Number(row.lead_count ?? 0),
    mode: String(row.mode) as ScanRun["mode"],
    status_message: String(row.status_message ?? ""),
    created_at: String(row.created_at),
  };
}

export function upsertLeads(leads: Lead[]) {
  if (leads.length === 0) return;
  const db = getDb();
  const statement = db.prepare(`
    INSERT INTO leads (
      id, business_name, niche, city, state, zip, address, phone, email, website,
      rating, review_count, has_website, has_contact_page, has_email, has_phone,
      site_title, meta_description, https_enabled, clear_cta_detected, trust_signals_detected,
      booking_or_contact_form_detected, website_quality_score, outreach_priority_score, lead_score,
      score_reasons_json, source_name, saved, hidden, tags_json, notes, created_at, updated_at
    ) VALUES (
      @id, @business_name, @niche, @city, @state, @zip, @address, @phone, @email, @website,
      @rating, @review_count, @has_website, @has_contact_page, @has_email, @has_phone,
      @site_title, @meta_description, @https_enabled, @clear_cta_detected, @trust_signals_detected,
      @booking_or_contact_form_detected, @website_quality_score, @outreach_priority_score, @lead_score,
      @score_reasons_json, @source_name, COALESCE((SELECT saved FROM leads WHERE id = @id), @saved),
      COALESCE((SELECT hidden FROM leads WHERE id = @id), @hidden),
      COALESCE((SELECT tags_json FROM leads WHERE id = @id), @tags_json),
      COALESCE((SELECT notes FROM leads WHERE id = @id), @notes),
      COALESCE((SELECT created_at FROM leads WHERE id = @id), @created_at),
      @updated_at
    )
    ON CONFLICT(id) DO UPDATE SET
      business_name = excluded.business_name,
      niche = excluded.niche,
      city = excluded.city,
      state = excluded.state,
      zip = excluded.zip,
      address = excluded.address,
      phone = excluded.phone,
      email = excluded.email,
      website = excluded.website,
      rating = excluded.rating,
      review_count = excluded.review_count,
      has_website = excluded.has_website,
      has_contact_page = excluded.has_contact_page,
      has_email = excluded.has_email,
      has_phone = excluded.has_phone,
      site_title = excluded.site_title,
      meta_description = excluded.meta_description,
      https_enabled = excluded.https_enabled,
      clear_cta_detected = excluded.clear_cta_detected,
      trust_signals_detected = excluded.trust_signals_detected,
      booking_or_contact_form_detected = excluded.booking_or_contact_form_detected,
      website_quality_score = excluded.website_quality_score,
      outreach_priority_score = excluded.outreach_priority_score,
      lead_score = excluded.lead_score,
      score_reasons_json = excluded.score_reasons_json,
      source_name = excluded.source_name,
      updated_at = excluded.updated_at
  `);

  const transaction = db.transaction((items: Lead[]) => {
    for (const lead of items) {
      statement.run({
        ...lead,
        has_website: lead.has_website ? 1 : 0,
        has_contact_page: lead.has_contact_page ? 1 : 0,
        has_email: lead.has_email ? 1 : 0,
        has_phone: lead.has_phone ? 1 : 0,
        https_enabled: lead.https_enabled ? 1 : 0,
        clear_cta_detected: lead.clear_cta_detected ? 1 : 0,
        trust_signals_detected: lead.trust_signals_detected ? 1 : 0,
        booking_or_contact_form_detected: lead.booking_or_contact_form_detected ? 1 : 0,
        saved: lead.saved ? 1 : 0,
        hidden: lead.hidden ? 1 : 0,
        score_reasons_json: JSON.stringify(lead.score_reasons),
        tags_json: JSON.stringify(lead.tags),
      });
    }
  });

  transaction(leads);
}

export function getLead(id: string) {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM leads WHERE id = ?`).get(id) as Record<string, unknown> | undefined;
  return row ? rowToLead(row) : null;
}

export function updateLead(id: string, input: LeadUpdateInput) {
  const db = getDb();
  const existing = getLead(id);
  if (!existing) return null;
  db.prepare(`
    UPDATE leads SET
      saved = @saved,
      hidden = @hidden,
      tags_json = @tags_json,
      notes = @notes,
      updated_at = @updated_at
    WHERE id = @id
  `).run({
    id,
    saved: input.saved ?? existing.saved ? 1 : 0,
    hidden: input.hidden ?? existing.hidden ? 1 : 0,
    tags_json: JSON.stringify(input.tags ?? existing.tags),
    notes: input.notes ?? existing.notes,
    updated_at: nowIso(),
  });
  return getLead(id);
}

export function getLeadsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const db = getDb();
  const placeholders = ids.map(() => "?").join(", ");
  const rows = db.prepare(`SELECT * FROM leads WHERE id IN (${placeholders})`).all(...ids) as Record<string, unknown>[];
  return rows.map(rowToLead);
}

export function getSavedLeads() {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM leads WHERE saved = 1 ORDER BY updated_at DESC`).all() as Record<string, unknown>[];
  return rows.map(rowToLead);
}

export function createScanRun(query: ScanQuery, sourceName: string, leadCount: number, mode: ScanRun["mode"], statusMessage: string) {
  const db = getDb();
  const run: ScanRun = {
    id: `scan-${Date.now()}`,
    niche: query.niche,
    city: query.city,
    state: query.state,
    zip: query.zip ?? "",
    radius: query.radius ?? 25,
    source_name: sourceName,
    lead_count: leadCount,
    mode,
    status_message: statusMessage,
    created_at: nowIso(),
  };

  db.prepare(`
    INSERT INTO scan_runs (
      id, niche, city, state, zip, radius, source_name, lead_count, mode, status_message, created_at
    ) VALUES (
      @id, @niche, @city, @state, @zip, @radius, @source_name, @lead_count, @mode, @status_message, @created_at
    )
  `).run(run);

  return run;
}

export function getRecentScanRuns(limit = 6) {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM scan_runs ORDER BY created_at DESC LIMIT ?`).all(limit) as Record<string, unknown>[];
  return rows.map(rowToScanRun);
}

export function getDashboardStats() {
  const db = getDb();
  return {
    totalStored: Number((db.prepare(`SELECT COUNT(*) as count FROM leads`).get() as { count: number }).count),
    savedLeads: Number((db.prepare(`SELECT COUNT(*) as count FROM leads WHERE saved = 1`).get() as { count: number }).count),
    highPriority: Number((db.prepare(`SELECT COUNT(*) as count FROM leads WHERE lead_score >= 75`).get() as { count: number }).count),
    websiteIssues: Number(
      (db.prepare(`SELECT COUNT(*) as count FROM leads WHERE has_website = 1 AND website_quality_score < 55`).get() as { count: number })
        .count,
    ),
    contactable: Number(
      (db.prepare(`SELECT COUNT(*) as count FROM leads WHERE has_phone = 1 OR has_email = 1`).get() as { count: number }).count,
    ),
  };
}
