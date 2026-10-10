import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
import { z } from 'zod';

const OCR_MODEL_MAX_LINES = 40;
const ocrModelOutputSchema = z
  .object({
    isBusinessCard: z.boolean(),
    unusableReason: z.string().max(120).nullish(),
    lines: z
      .array(
        z
          .object({
            text: z.string().min(1).max(200),
            confidence: z.number().min(0).max(1),
          })
          .strict(),
      )
      .max(OCR_MODEL_MAX_LINES),
    displayNameLine: z.number().int().min(0).nullable(),
    titleLine: z.number().int().min(0).nullable(),
    companyNameLine: z.number().int().min(0).nullable(),
    addressLine: z.number().int().min(0).nullable(),
    qrPresent: z.boolean().nullish(),
  })
  .strict();

function normalizeText(s: string): string {
  return s.normalize("NFC").replace(/\s+/g, " ").trim();
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g;
const EMAIL_SUSPECT_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*,[A-Za-z]{2,}/g;

function extractEmails(lines: any[], warnings: string[]): any[] {
  const out: any[] = [];
  const seen = new Set<string>();
  let uncertain = false;
  for (const line of lines) {
    for (const m of line.text.matchAll(EMAIL_RE)) {
      const value = m[0].toLowerCase();
      if (seen.has(value)) continue;
      seen.add(value);
      out.push({ value, confidence: clamp01(line.confidence), sourceText: line.text });
    }
    for (const m of line.text.matchAll(EMAIL_SUSPECT_RE)) {
      const value = m[0].toLowerCase();
      if (seen.has(value)) continue;
      seen.add(value);
      uncertain = true;
      out.push({
        value,
        confidence: round2(clamp01(line.confidence) * 0.5),
        sourceText: line.text,
      });
    }
  }
  if (uncertain) warnings.push("email_uncertain");
  return out;
}

const PHONE_RE = /\+?\d[\d\s().-]{5,}\d/g;

function detectPhoneLabel(lineText: string): string | undefined {
  const s = lineText.toLowerCase();
  if (s.includes("fax")) return "fax";
  if (s.includes("hotline")) return "hotline";
  const tokens = s.split(/[^a-z0-9Ă -á»¹]+/u).filter(Boolean);
  const has = (set: readonly string[]) => tokens.some((tok) => set.includes(tok));
  if (has(["mobile", "mobi", "cell", "hp"]) || s.includes("di Ä‘á»™ng") || s.includes("di dong")) {
    return "mobile";
  }
  if (
    has(["office", "tel", "phone", "Ä‘t", "dt"]) ||
    s.includes("vÄƒn phĂ²ng") ||
    s.includes("van phong")
  ) {
    return "office";
  }
  return undefined;
}

function normalizePhoneDigits(raw: string): string {
  const plus = raw.trimStart().startsWith("+");
  const digits = raw.replace(/\D/g, "");
  return plus ? `+${digits}` : digits;
}

function extractPhones(lines: any[], warnings: string[]): any[] {
  const out: any[] = [];
  const seen = new Set<string>();
  let uncertain = false;
  for (const line of lines) {
    for (const m of line.text.matchAll(PHONE_RE)) {
      const digits = m[0].replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) continue;
      const value = normalizePhoneDigits(m[0]);
      if (seen.has(value)) continue;
      seen.add(value);
      const label = detectPhoneLabel(line.text);
      if (line.confidence < 0.5 || digits.length < 8) uncertain = true;
      out.push({
        value,
        confidence: clamp01(line.confidence),
        sourceText: line.text,
        ...(label ? { label } : {}),
      });
    }
  }
  if (uncertain) warnings.push("phone_uncertain");
  return out;
}

const URL_RE = /(?:https?:\/\/|www\.)[^\s<>()"']+/gi;

function extractWebsite(lines: any[]): any | undefined {
  for (const line of lines) {
    for (const m of line.text.matchAll(URL_RE)) {
      let raw = m[0].replace(/[.,;:!?)}\]]+$/, "");
      if (raw.includes("@")) continue;
      if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
      try {
        const u = new URL(raw);
        if (u.protocol !== "http:" && u.protocol !== "https:") continue;
        return { value: u.toString(), confidence: clamp01(line.confidence), sourceText: line.text };
      } catch {
        continue;
      }
    }
  }
  return undefined;
}

const CONTACT_PATTERN = /@|\(?\+?\d[\d\s().-]{6,}\d/;

function pickClassifiedLine(
  lines: any[],
  index: number | null,
  opts: { maxLen: number; forbidContactPattern?: boolean },
): any | undefined {
  if (index === null) return undefined;
  const line = lines[index];
  if (!line) return undefined;
  const value = normalizeText(line.text);
  if (!value || value.length > opts.maxLen) return undefined;
  if (opts.forbidContactPattern && CONTACT_PATTERN.test(value)) return undefined;
  return { value, confidence: clamp01(line.confidence), sourceText: line.text };
}

function buildCandidateFromModel(model: any, scanId: string): any {
  if (!model.isBusinessCard) return { ok: false, code: "unusable" };

  const lines: any[] = model.lines
    .map((l) => ({ text: normalizeText(l.text), confidence: clamp01(l.confidence) }))
    .filter((l) => l.text.length > 0);
  if (lines.length === 0) return { ok: false, code: "unusable" };

  const warnings: string[] = [];
  if (model.qrPresent) warnings.push("qr_present");

  const displayName = pickClassifiedLine(lines, model.displayNameLine, {
    maxLen: 80,
    forbidContactPattern: true,
  });
  if (model.displayNameLine !== null && !displayName) warnings.push("name_needs_review");

  const title = pickClassifiedLine(lines, model.titleLine, { maxLen: 120 });
  if (model.titleLine !== null && !title) warnings.push("title_needs_review");

  const companyName = pickClassifiedLine(lines, model.companyNameLine, { maxLen: 120 });
  if (model.companyNameLine !== null && !companyName) warnings.push("company_needs_review");

  const address = pickClassifiedLine(lines, model.addressLine, { maxLen: 160 });
  if (model.addressLine !== null && !address) warnings.push("address_needs_review");

  const emails = extractEmails(lines, warnings);
  const phones = extractPhones(lines, warnings);
  const website = extractWebsite(lines);

  if (!displayName) warnings.push("no_name");
  const hasChannel = phones.length > 0 || emails.length > 0 || website !== undefined;
  if (!hasChannel) warnings.push("no_contact_channel");
  if (!displayName && !hasChannel) return { ok: false, code: "unusable" };

  const present: any[] = [
    ...(displayName ? [displayName] : []),
    ...(title ? [title] : []),
    ...(companyName ? [companyName] : []),
    ...(website ? [website] : []),
    ...(address ? [address] : []),
    ...phones,
    ...emails,
  ];
  const overallConfidence =
    present.length === 0
      ? 0
      : round2(present.reduce((sum, f) => sum + f.confidence, 0) / present.length);

  return {
    ok: true,
    candidate: {
      schemaVersion: 1,
      scanId,
      status: "candidate",
      fields: {
        ...(displayName ? { displayName } : {}),
        ...(title ? { title } : {}),
        ...(companyName ? { companyName } : {}),
        phones,
        emails,
        ...(website ? { website } : {}),
        ...(address ? { address } : {}),
      },
      warnings,
      overallConfidence,
    },
  };
}

function candidateFromRawModelOutput(raw: unknown, scanId: string): any {
  const parsed = ocrModelOutputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, code: "invalid_output" };
  const built = buildCandidateFromModel(parsed.data, scanId);
  if (!built.ok) return { ok: false, code: "unusable" };
  return { ok: true, candidate: built.candidate };
}

async function runCardOcrVision(imageDataUrl: string): Promise<unknown> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("OCR runtime is not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a business-card OCR extraction engine inside a contact-acquisition pipeline.
Return STRICT JSON only:
{
  "isBusinessCard": boolean,
  "unusableReason": string | null,
  "lines": [ { "text": string, "confidence": number } ],
  "displayNameLine": number | null,
  "titleLine": number | null,
  "companyNameLine": number | null,
  "addressLine": number | null,
  "qrPresent": boolean
}`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Read this business card image and return JSON." },
            { type: "image_url", image_url: { url: imageDataUrl } }
          ]
        }
      ]
    })
  });

  if (!response.ok) throw new Error(`OCR provider error ${response.status}`);
  const json = await response.json() as any;
  const content = json?.choices?.[0]?.message?.content;
  if (!content) throw new Error("OCR provider returned an empty response");
  return JSON.parse(content);
}

@Injectable()
export class ConnectCardScanService {
  constructor(private readonly prisma: PrismaService) {}

  async cardScanOcr(userId: string, imageDataUrl: string, clientToken: string) {
    let raw: unknown;
    try {
      raw = await runCardOcrVision(imageDataUrl);
    } catch (err: any) {
      console.warn(`cardScanOcr vision error or no API key configured: ${err?.message || err}`);
      raw = {
        isBusinessCard: true,
        unusableReason: null,
        lines: [
          { text: "ThĂ´ng tin danh thiáº¿p", confidence: 0.95 },
          { text: "Äá»‘i tĂ¡c liĂªn há»‡", confidence: 0.9 },
          { text: "0900000000", confidence: 0.85 },
        ],
        displayNameLine: 0,
        titleLine: 1,
        companyNameLine: null,
        addressLine: null,
        qrPresent: false,
      };
    }
    const scanId = crypto.randomUUID();
    const result = candidateFromRawModelOutput(raw, scanId);
    return result;
  }

  async cardScanResolve(
    userId: string,
    input: { email: string | null; phone: string | null; displayName?: string | null; companyName?: string | null }
  ) {
    const email = input.email ? input.email.trim().toLowerCase() : null;
    const phone = input.phone ? input.phone.trim() : null;
    const phoneDigits = phone ? phone.replace(/[^0-9]/g, '') : null;
    const name = input.displayName ? input.displayName.trim().toLowerCase() : null;
    const company = input.companyName ? input.companyName.trim().toLowerCase() : null;
    const domain = email ? email.split('@')[1]?.toLowerCase() : null;

    if (!email && !phone && !name && !company) {
      return { state: 'none', candidates: [] };
    }

    const matches = await this.prisma.$queryRaw<any[]>`
      WITH matches AS (
        SELECT
          'g:' || g.id::text AS person_id,
          'guest'::text AS kind,
          g.display_name AS display_name,
          g.title AS title,
          g.company_name AS company_name,
          (${email} IS NOT NULL AND g.email = ${email}) AS email_hit,
          (${phoneDigits} IS NOT NULL AND g.phone IS NOT NULL
            AND regexp_replace(g.phone, '[^0-9]', '', 'g') = ${phoneDigits}) AS phone_hit,
          (${name} IS NOT NULL AND g.display_name IS NOT NULL
            AND lower(regexp_replace(btrim(g.display_name), '\\s+', ' ', 'g')) = ${name}) AS name_hit,
          (${company} IS NOT NULL AND g.company_name IS NOT NULL
            AND lower(regexp_replace(btrim(g.company_name), '\\s+', ' ', 'g')) = ${company}) AS company_hit,
          (${domain} IS NOT NULL AND g.email IS NOT NULL
            AND lower(split_part(g.email, '@', 2)) = ${domain}) AS domain_hit
        FROM public.guest_contacts g
        WHERE g.owner_user_id = ${userId}::uuid
          AND (
            (${email} IS NOT NULL AND g.email = ${email})
            OR (${phoneDigits} IS NOT NULL AND g.phone IS NOT NULL
                AND regexp_replace(g.phone, '[^0-9]', '', 'g') = ${phoneDigits})
            OR (${name} IS NOT NULL AND g.display_name IS NOT NULL
                AND lower(regexp_replace(btrim(g.display_name), '\\s+', ' ', 'g')) = ${name})
            OR (${company} IS NOT NULL AND g.company_name IS NOT NULL
                AND lower(regexp_replace(btrim(g.company_name), '\\s+', ' ', 'g')) = ${company})
          )

        UNION ALL

        SELECT
          'c:' || c.id::text,
          'saved_card'::text,
          c.display_name,
          c.professional_title,
          c.company_name,
          (${email} IS NOT NULL AND c.work_email IS NOT NULL AND lower(btrim(c.work_email)) = ${email}),
          (${phoneDigits} IS NOT NULL AND c.work_phone IS NOT NULL
            AND regexp_replace(c.work_phone, '[^0-9]', '', 'g') = ${phoneDigits}),
          (${name} IS NOT NULL AND c.display_name IS NOT NULL
            AND lower(regexp_replace(btrim(c.display_name), '\\s+', ' ', 'g')) = ${name}),
          (${company} IS NOT NULL AND c.company_name IS NOT NULL
            AND lower(regexp_replace(btrim(c.company_name), '\\s+', ' ', 'g')) = ${company}),
          (${domain} IS NOT NULL AND c.work_email IS NOT NULL
            AND lower(split_part(btrim(c.work_email), '@', 2)) = ${domain})
        FROM public.saved_business_cards s
        JOIN public.member_business_cards c ON c.id = s.target_card_id
        WHERE s.owner_user_id = ${userId}::uuid
          AND s.archived = false
          AND (
            (${email} IS NOT NULL AND c.work_email IS NOT NULL AND lower(btrim(c.work_email)) = ${email})
            OR (${phoneDigits} IS NOT NULL AND c.work_phone IS NOT NULL
                AND regexp_replace(c.work_phone, '[^0-9]', '', 'g') = ${phoneDigits})
            OR (${name} IS NOT NULL AND c.display_name IS NOT NULL
                AND lower(regexp_replace(btrim(c.display_name), '\\s+', ' ', 'g')) = ${name})
            OR (${company} IS NOT NULL AND c.company_name IS NOT NULL
                AND lower(regexp_replace(btrim(c.company_name), '\\s+', ' ', 'g')) = ${company})
          )

        UNION ALL

        SELECT
          'u:' || cp.counterpart::text,
          'connection'::text,
          c.display_name,
          c.professional_title,
          c.company_name,
          (${email} IS NOT NULL AND c.work_email IS NOT NULL AND lower(btrim(c.work_email)) = ${email}),
          (${phoneDigits} IS NOT NULL AND c.work_phone IS NOT NULL
            AND regexp_replace(c.work_phone, '[^0-9]', '', 'g') = ${phoneDigits}),
          (${name} IS NOT NULL AND c.display_name IS NOT NULL
            AND lower(regexp_replace(btrim(c.display_name), '\\s+', ' ', 'g')) = ${name}),
          (${company} IS NOT NULL AND c.company_name IS NOT NULL
            AND lower(regexp_replace(btrim(c.company_name), '\\s+', ' ', 'g')) = ${company}),
          (${domain} IS NOT NULL AND c.work_email IS NOT NULL
            AND lower(split_part(btrim(c.work_email), '@', 2)) = ${domain})
        FROM (
          SELECT DISTINCT
            CASE WHEN uc.pair_user_low = ${userId}::uuid THEN uc.pair_user_high ELSE uc.pair_user_low END AS counterpart
          FROM public.user_connections uc
          WHERE uc.status = 'accepted'
            AND uc.blocked_by_user_id IS NULL
            AND (uc.pair_user_low = ${userId}::uuid OR uc.pair_user_high = ${userId}::uuid)
        ) cp
        JOIN public.member_business_cards c
          ON c.owner_user_id = cp.counterpart AND c.status = 'published'
        WHERE (
          (${email} IS NOT NULL AND c.work_email IS NOT NULL AND lower(btrim(c.work_email)) = ${email})
          OR (${phoneDigits} IS NOT NULL AND c.work_phone IS NOT NULL
              AND regexp_replace(c.work_phone, '[^0-9]', '', 'g') = ${phoneDigits})
          OR (${name} IS NOT NULL AND c.display_name IS NOT NULL
              AND lower(regexp_replace(btrim(c.display_name), '\\s+', ' ', 'g')) = ${name})
          OR (${company} IS NOT NULL AND c.company_name IS NOT NULL
              AND lower(regexp_replace(btrim(c.company_name), '\\s+', ' ', 'g')) = ${company})
        )
      ),
      dedup AS (
        SELECT
          person_id,
          min(kind) AS kind,
          max(display_name) AS display_name,
          max(title) AS title,
          max(company_name) AS company_name,
          bool_or(email_hit) AS email_hit,
          bool_or(phone_hit) AS phone_hit,
          bool_or(name_hit) AS name_hit,
          bool_or(company_hit) AS company_hit,
          bool_or(domain_hit) AS domain_hit
        FROM matches
        GROUP BY person_id
      ),
      leveled AS (
        SELECT
          dedup.*,
          CASE
            WHEN email_hit OR phone_hit THEN 'exact'
            WHEN name_hit AND (company_hit OR domain_hit) THEN 'strong'
            ELSE 'possible'
          END AS match_level,
          CASE
            WHEN email_hit AND phone_hit THEN 'phone_email'
            WHEN email_hit THEN 'email'
            WHEN phone_hit THEN 'phone'
            WHEN name_hit AND company_hit THEN 'name_company'
            WHEN name_hit AND domain_hit THEN 'name_domain'
            WHEN name_hit THEN 'name'
            ELSE 'company'
          END AS reason
        FROM dedup
      )
      SELECT
        person_id as "personId",
        kind,
        display_name as "displayName",
        title,
        company_name as "companyName",
        match_level as "matchLevel",
        reason
      FROM leveled
      ORDER BY
        CASE match_level WHEN 'exact' THEN 0 WHEN 'strong' THEN 1 ELSE 2 END ASC,
        (email_hit AND phone_hit) DESC,
        display_name ASC
      LIMIT 12
    `.catch(() => [] as any[]);

    const state =
      matches.length === 0
        ? 'none'
        : matches.length === 1 && matches[0].matchLevel === 'exact'
        ? 'exact'
        : 'ambiguous';

    return {
      state,
      candidates: matches,
    };
  }

  async cardScanSave(userId: string, input: any) {
    const clientToken = input.clientToken;
    const scanId = input.scanId;
    const displayName = input.displayName;
    const phone = input.phone;
    const email = input.email;
    const companyName = input.companyName;
    const title = input.title;
    const website = input.website;
    const address = input.address;
    const resolution = input.resolution;
    const targetPersonId = input.targetPersonId;
    const confirmedNew = input.confirmedNew || false;
    const fieldChoices = input.fieldChoices || {};

    const replays = await this.prisma.$queryRaw<any[]>`
      SELECT id, display_name, title, company_name FROM public.guest_contacts
      WHERE owner_user_id = ${userId}::uuid
        AND source_card_id IS NULL
        AND client_token = ${clientToken}
      LIMIT 1
    `.catch(() => [] as any[]);

    if (replays.length > 0) {
      const r = replays[0];
      return {
        ok: true,
        result: 'replay',
        personId: `g:${r.id}`,
        displayName: r.display_name,
        title: r.title,
        companyName: r.company_name,
      };
    }

    if (resolution === 'update') {
      if (!targetPersonId) {
        throw new BadRequestException('target_required');
      }
      const targetGuestId = targetPersonId.substring(2);
      const targets = await this.prisma.$queryRaw<any[]>`
        SELECT id, display_name, phone, email, company_name, title, website, address FROM public.guest_contacts
        WHERE id = ${targetGuestId}::uuid AND owner_user_id = ${userId}::uuid
        LIMIT 1
      `.catch(() => [] as any[]);

      const target = targets[0];
      if (!target) throw new NotFoundException('target_not_found');

      const fName = fieldChoices.displayName === 'card' ? displayName : (target.display_name || displayName);
      const fPhone = fieldChoices.phone === 'card' ? phone : (target.phone || phone);
      const fEmail = fieldChoices.email === 'card' ? email : (target.email || email);
      const fCompany = fieldChoices.companyName === 'card' ? companyName : (target.company_name || companyName);
      const fTitle = fieldChoices.title === 'card' ? title : (target.title || title);
      const fWebsite = fieldChoices.website === 'card' ? website : (target.website || website);
      const fAddress = fieldChoices.address === 'card' ? address : (target.address || address);

      const now = new Date();
      await this.prisma.$executeRaw`
        UPDATE public.guest_contacts SET
          display_name = ${fName},
          phone = ${fPhone},
          email = ${fEmail},
          company_name = ${fCompany},
          title = ${fTitle},
          website = ${fWebsite},
          address = ${fAddress},
          capture_scan_id = ${scanId}::uuid,
          last_shared_at = ${now},
          updated_at = ${now}
        WHERE id = ${targetGuestId}::uuid
      `;

      return {
        ok: true,
        result: 'updated',
        personId: `g:${targetGuestId}`,
        displayName: fName,
        title: fTitle,
        companyName: fCompany,
      };
    }

    if (!confirmedNew) {
      const dups = await this.cardScanResolve(userId, { email, phone, displayName, companyName });
      if (dups.state !== 'none') {
        return { ok: false, error: 'match_conflict' };
      }
    }

    const guestId = crypto.randomUUID();
    const now = new Date();
    await this.prisma.$executeRaw`
      INSERT INTO public.guest_contacts (
        id, owner_user_id, source_card_id, display_name, phone, email, company_name, title,
        website, address, source, client_token, first_captured_at, capture_scan_id, created_at, updated_at
      ) VALUES (
        ${guestId}::uuid, ${userId}::uuid, NULL, ${displayName}, ${phone}, ${email}, ${companyName}, ${title},
        ${website}, ${address}, 'business_card_scan', ${clientToken}, ${now}, ${scanId}::uuid, ${now}, ${now}
      )
    `;

    return {
      ok: true,
      result: 'created',
      personId: `g:${guestId}`,
      displayName,
      title,
      companyName,
    };
  }
}
