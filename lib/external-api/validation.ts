// lib/external-api/validation.ts
//
// Hand-rolled validator for the products endpoint. No zod/joi to keep the
// dependency footprint flat — this file is the spec.
//
// Input shapes accepted on POST /api/external/v1/products/ :
//   1. { products: [ {...}, {...} ] }       — preferred
//   2. [ {...}, {...} ]                      — array shortcut
//   3. { ... }                                — single product
//
// Validated and normalized into ProductInput[].

import { ApiError } from './errors';

export interface ProductInput {
  // Salesforce 18-char Id. Required — used as the upsert key.
  sfid: string;
  // Standard Product2 fields (all optional except sfid). Pass-through
  // semantics: any field present here is written; absent fields are
  // unchanged on UPDATE.
  name?: string;
  productcode?: string;
  description?: string | null;
  family?: string | null;
  isactive?: boolean;
  quantityunitofmeasure?: string | null;
  displayurl?: string | null;
  externalid?: string | null;
}

const MAX_BATCH = 100;
const MAX_BODY_BYTES = 1_000_000;        // 1 MB hard cap (caller should chunk)
const SFID_RE = /^[A-Za-z0-9]{15,18}$/;
const FAMILY_MAX = 40;
const NAME_MAX = 255;
const DESC_MAX = 4000;

/** Used by the route to reject oversize bodies before parsing JSON. */
export function checkBodySize(contentLengthHeader: string | null): void {
  if (!contentLengthHeader) return;
  const n = Number.parseInt(contentLengthHeader, 10);
  if (Number.isFinite(n) && n > MAX_BODY_BYTES) {
    throw ApiError.payloadTooLarge(`Body exceeds ${MAX_BODY_BYTES} bytes`);
  }
}

export function parseProducts(raw: unknown): ProductInput[] {
  if (raw === null || typeof raw !== 'object') {
    throw ApiError.invalidPayload('Body must be a JSON object or array');
  }

  let candidates: unknown[];
  if (Array.isArray(raw)) {
    candidates = raw;
  } else if (Array.isArray((raw as { products?: unknown }).products)) {
    candidates = (raw as { products: unknown[] }).products;
  } else {
    candidates = [raw];
  }

  if (candidates.length === 0) {
    throw ApiError.invalidPayload('No products in request');
  }
  if (candidates.length > MAX_BATCH) {
    throw ApiError.invalidPayload(`Batch size ${candidates.length} exceeds max ${MAX_BATCH}`, {
      max_batch_size: MAX_BATCH,
    });
  }

  const products: ProductInput[] = [];
  const seenSfids = new Set<string>();

  candidates.forEach((c, i) => {
    const path = `products[${i}]`;
    if (c === null || typeof c !== 'object' || Array.isArray(c)) {
      throw ApiError.invalidPayload(`${path}: must be an object`, { field: path });
    }
    products.push(validateOne(c as Record<string, unknown>, path, seenSfids));
  });

  return products;
}

function validateOne(o: Record<string, unknown>, path: string, seen: Set<string>): ProductInput {
  // sfid (required)
  const sfid = stringField(o, 'sfid', path, true);
  if (!SFID_RE.test(sfid!)) {
    throw ApiError.invalidPayload(`${path}.sfid: must be 15–18 alphanumeric chars`, {
      field: `${path}.sfid`,
    });
  }
  if (seen.has(sfid!)) {
    throw ApiError.invalidPayload(`${path}.sfid: duplicate sfid in batch`, {
      field: `${path}.sfid`,
      sfid,
    });
  }
  seen.add(sfid!);

  const out: ProductInput = { sfid: sfid! };

  const name = stringField(o, 'name', path);
  if (name !== undefined) {
    if (name.length > NAME_MAX) throw ApiError.invalidPayload(`${path}.name: too long (max ${NAME_MAX})`, { field: `${path}.name` });
    out.name = name;
  }

  const productcode = stringField(o, 'productcode', path);
  if (productcode !== undefined) out.productcode = productcode;

  const description = nullableStringField(o, 'description', path);
  if (description !== undefined) {
    if (description !== null && description.length > DESC_MAX) {
      throw ApiError.invalidPayload(`${path}.description: too long (max ${DESC_MAX})`, { field: `${path}.description` });
    }
    out.description = description;
  }

  const family = nullableStringField(o, 'family', path);
  if (family !== undefined) {
    if (family !== null && family.length > FAMILY_MAX) {
      throw ApiError.invalidPayload(`${path}.family: too long (max ${FAMILY_MAX})`, { field: `${path}.family` });
    }
    out.family = family;
  }

  if ('isactive' in o) {
    if (typeof o.isactive !== 'boolean') {
      throw ApiError.invalidPayload(`${path}.isactive: must be boolean`, { field: `${path}.isactive` });
    }
    out.isactive = o.isactive;
  }

  const quom = nullableStringField(o, 'quantityunitofmeasure', path);
  if (quom !== undefined) out.quantityunitofmeasure = quom;

  const displayurl = nullableStringField(o, 'displayurl', path);
  if (displayurl !== undefined) out.displayurl = displayurl;

  const externalid = nullableStringField(o, 'externalid', path);
  if (externalid !== undefined) out.externalid = externalid;

  // Reject unknown keys — fail fast on typos.
  const allowed = new Set([
    'sfid','name','productcode','description','family','isactive',
    'quantityunitofmeasure','displayurl','externalid',
  ]);
  for (const k of Object.keys(o)) {
    if (!allowed.has(k)) {
      throw ApiError.invalidPayload(`${path}: unknown field '${k}'`, { field: `${path}.${k}` });
    }
  }

  return out;
}

function stringField(o: Record<string, unknown>, key: string, path: string, required = false): string | undefined {
  if (!(key in o)) {
    if (required) throw ApiError.invalidPayload(`${path}.${key}: required`, { field: `${path}.${key}` });
    return undefined;
  }
  const v = o[key];
  if (typeof v !== 'string') {
    throw ApiError.invalidPayload(`${path}.${key}: must be string`, { field: `${path}.${key}` });
  }
  return v;
}

function nullableStringField(o: Record<string, unknown>, key: string, path: string): string | null | undefined {
  if (!(key in o)) return undefined;
  const v = o[key];
  if (v === null) return null;
  if (typeof v !== 'string') {
    throw ApiError.invalidPayload(`${path}.${key}: must be string or null`, { field: `${path}.${key}` });
  }
  return v;
}
