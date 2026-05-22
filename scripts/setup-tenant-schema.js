// ============================================================================
// setup-tenant-schema.js
// ============================================================================
// One-shot dynamic tenant schema setup.  Creates the schema, clones product2
// + the entire Algolia sync layer from the `salesforce` schema, and configures
// Pattern A per-tenant Algolia index naming.
//
// USAGE
//   node scripts/setup-tenant-schema.js <schema_name> [options]
//
// EXAMPLES
//   node scripts/setup-tenant-schema.js sf_00dec00000e1fjdmaa
//   node scripts/setup-tenant-schema.js "00DgK000007zMR7UAM_salesforce"
//   node scripts/setup-tenant-schema.js sf_new_tenant --index dev_my_products
//
// OPTIONS
//   --index <name>     Algolia index name (default: woven_products_<schema>)
//   --source <schema>  Source schema to clone from (default: salesforce)
//   --no-product2      Skip product2 cloning (if HC will provision it later)
//   --no-trigger       Skip attaching the product2 trigger
//   --dry-run          Show what would happen without changing anything
//
// REQUIREMENTS
//   .env with DATABASE_URL
//   Source schema must exist with the algolia_* tables, functions, views, etc.
//
// Run as the role that owns the source schema, or one with CREATE on the DB.
// ============================================================================

const { Pool } = require('pg');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// ----------------------------------------------------------------------------
// Args
// ----------------------------------------------------------------------------
const argv = process.argv.slice(2);
const schema = argv[0];

function flagValue(name, fallback) {
    const i = argv.indexOf('--' + name);
    return i > -1 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback;
}
function hasFlag(name) { return argv.includes('--' + name); }

if (!schema || schema.startsWith('--')) {
    console.error('Usage: node scripts/setup-tenant-schema.js <schema_name> [--index <name>] [--source <schema>] [--no-product2] [--no-trigger] [--dry-run]');
    process.exit(1);
}

// Allow letters, digits, underscores.  Quoted at every SQL use site so leading
// digits and mixed case are safe.
const SCHEMA_NAME_RE = /^[A-Za-z0-9_]{1,63}$/;
if (!SCHEMA_NAME_RE.test(schema)) {
    console.error(`Invalid schema name: "${schema}". Must be 1-63 chars of [A-Za-z0-9_].`);
    process.exit(1);
}

const sourceSchema = flagValue('source', 'salesforce');
const indexName = flagValue('index', `woven_products_${schema.toLowerCase()}`);
const skipProduct2 = hasFlag('no-product2');
const skipTrigger = hasFlag('no-trigger');
const skipApiKey = hasFlag('no-api-key');
const rotateKey = hasFlag('rotate-key');
const dryRun = hasFlag('dry-run');

if (!SCHEMA_NAME_RE.test(sourceSchema)) {
    console.error(`Invalid source schema name: "${sourceSchema}"`);
    process.exit(1);
}

// Quoted identifiers — safe to interpolate into SQL.
const TARGET = `"${schema}"`;
const SOURCE = `"${sourceSchema}"`;

// ----------------------------------------------------------------------------
// DB
// ----------------------------------------------------------------------------
if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set in .env or environment');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

function log(level, msg, meta = {}) {
    const prefix = level === 'error' ? '✗' : level === 'warn' ? '!' : '✓';
    const extra = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
    console.log(`${prefix} ${msg}${extra}`);
}

async function run(client, label, sql, params = []) {
    if (dryRun) {
        console.log(`[dry-run] ${label}`);
        console.log('         ' + sql.replace(/\s+/g, ' ').trim().slice(0, 140) + (sql.length > 140 ? '...' : ''));
        return { rows: [], rowCount: 0 };
    }
    try {
        const r = await client.query(sql, params);
        log('info', label);
        return r;
    } catch (err) {
        log('error', `${label}: ${err.message}`);
        throw err;
    }
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------
async function main() {
    console.log(`\n==============================================`);
    console.log(`Setting up tenant schema: ${schema}`);
    console.log(`Source schema:            ${sourceSchema}`);
    console.log(`Target Algolia index:     ${indexName}`);
    if (dryRun) console.log(`MODE: DRY RUN (no changes)`);
    console.log(`==============================================\n`);

    const client = await pool.connect();

    // Case-preserving lookup helpers.  to_regnamespace() and to_regclass()
    // both LOWERCASE unquoted identifiers in their argument string, which
    // breaks mixed-case schema names like "00DgK000007zMR7UAM_salesforce".
    // pg_namespace.nspname and pg_class.relname store names exactly as
    // declared — string equality preserves case.
    const schemaExists = async (s) => {
        const r = await client.query(
            `SELECT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = $1) AS e`, [s]
        );
        return r.rows[0].e;
    };
    const relationExists = async (schemaName, tableName) => {
        const r = await client.query(
            `SELECT EXISTS (
                SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                 WHERE n.nspname = $1 AND c.relname = $2
             ) AS e`,
            [schemaName, tableName]
        );
        return r.rows[0].e;
    };

    try {
        // Sanity check source schema exists with required objects
        const s = {
            schema_ok: await schemaExists(sourceSchema),
            has_product2: await relationExists(sourceSchema, 'product2'),
            has_queue: await relationExists(sourceSchema, 'algolia_sync_queue'),
            has_config: await relationExists(sourceSchema, 'algolia_index_config'),
        };
        if (!s.schema_ok) throw new Error(`Source schema "${sourceSchema}" does not exist or not visible`);
        if (!s.has_product2 && !skipProduct2) {
            log('warn', `Source has no product2 — pass --no-product2 to skip cloning it`);
        }
        if (!s.has_queue || !s.has_config) {
            throw new Error(`Source "${sourceSchema}" missing algolia tables`);
        }
        log('info', 'source schema OK', s);

        // 1. CREATE SCHEMA
        await run(client, `schema "${schema}" exists or created`,
            `CREATE SCHEMA IF NOT EXISTS ${TARGET}`);

        // 2. Clone product2 (structure only)
        if (!skipProduct2) {
            if (await relationExists(schema, 'product2')) {
                log('info', `product2 already exists in ${schema} — skipping`);
            } else {
                await run(client, `product2 cloned from ${sourceSchema}`,
                    `CREATE TABLE ${TARGET}.product2 (LIKE ${SOURCE}.product2 INCLUDING ALL)`);
            }
        }

        // 3. Clone the Algolia layer — all in one transaction.
        //    Drop existing target objects first to avoid stale conflicts.
        await client.query('BEGIN');
        try {
            // Drop existing triggers
            if (await relationExists(schema, 'product2')) {
                await client.query(`DROP TRIGGER IF EXISTS sf_product2_algolia_sync_trigger ON ${TARGET}.product2`);
            }

            if (await relationExists(schema, 'algolia_index_config')) {
                await client.query(`DROP TRIGGER IF EXISTS update_algolia_config_timestamp ON ${TARGET}.algolia_index_config`);
            }

            // Drop existing views
            const views = await client.query(
                `SELECT viewname FROM pg_views WHERE schemaname = $1 AND viewname LIKE 'algolia_%'`,
                [schema]
            );
            for (const v of views.rows) {
                await client.query(`DROP VIEW IF EXISTS ${TARGET}.${JSON.stringify(v.viewname)} CASCADE`);
            }

            // Drop existing algolia functions
            const fns = await client.query(
                `SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
                   FROM pg_proc p
                  WHERE p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = $1)
                    AND (p.proname LIKE '%algolia%' OR p.proname LIKE 'transform_%'
                         OR p.proname LIKE 'trigger_%'
                         OR p.proname IN ('update_updated_at_column','run_algolia_maintenance'))`,
                [schema]
            );
            for (const fn of fns.rows) {
                await client.query(`DROP FUNCTION IF EXISTS ${TARGET}."${fn.proname}"(${fn.args}) CASCADE`);
            }

            // Drop existing algolia tables
            const tables = await client.query(
                `SELECT tablename FROM pg_tables
                  WHERE schemaname = $1
                    AND (tablename LIKE 'algolia_%' OR tablename = 'api_keys')`,
                [schema]
            );
            for (const t of tables.rows) {
                await client.query(`DROP TABLE IF EXISTS ${TARGET}."${t.tablename}" CASCADE`);
            }

            // Clone tables (structure + indexes + constraints)
            const srcTables = await client.query(
                `SELECT tablename FROM pg_tables
                  WHERE schemaname = $1
                    AND (tablename LIKE 'algolia_%' OR tablename = 'api_keys')
                  ORDER BY tablename`,
                [sourceSchema]
            );
            for (const t of srcTables.rows) {
                await client.query(
                    `CREATE TABLE ${TARGET}."${t.tablename}" (LIKE ${SOURCE}."${t.tablename}" INCLUDING ALL)`
                );
                log('info', `table: ${t.tablename}`);
            }

            // Clone functions (DDL replace src schema → target)
            const srcFns = await client.query(
                `SELECT p.oid, p.proname FROM pg_proc p
                  WHERE p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = $1)
                    AND (p.proname LIKE '%algolia%' OR p.proname LIKE 'transform_%'
                         OR p.proname LIKE 'trigger_%'
                         OR p.proname IN ('update_updated_at_column','run_algolia_maintenance'))
                  ORDER BY p.proname`,
                [sourceSchema]
            );
            for (const fn of srcFns.rows) {
                const ddlR = await client.query(`SELECT pg_get_functiondef($1) AS def`, [fn.oid]);
                let ddl = ddlR.rows[0].def;
                // Replace both quoted and unquoted source references
                ddl = ddl.split(`${sourceSchema}.`).join(`${TARGET}.`);
                ddl = ddl.split(`"${sourceSchema}".`).join(`${TARGET}.`);
                try {
                    await client.query(ddl);
                    log('info', `function: ${fn.proname}`);
                } catch (e) {
                    log('warn', `function ${fn.proname} failed: ${e.message}`);
                }
            }

            // Clone views
            const srcViews = await client.query(
                `SELECT viewname, definition FROM pg_views
                  WHERE schemaname = $1 AND viewname LIKE 'algolia_%'
                  ORDER BY viewname`,
                [sourceSchema]
            );
            for (const v of srcViews.rows) {
                let def = v.definition.split(`${sourceSchema}.`).join(`${TARGET}.`);
                def = def.split(`"${sourceSchema}".`).join(`${TARGET}.`);
                try {
                    await client.query(`CREATE OR REPLACE VIEW ${TARGET}."${v.viewname}" AS ${def}`);
                    log('info', `view: ${v.viewname}`);
                } catch (e) {
                    log('warn', `view ${v.viewname} failed: ${e.message}`);
                }
            }

            // Re-attach triggers
            if (!skipTrigger) {
                const productExists = { rows: [{ e: await relationExists(schema, 'product2') }] };
                const triggerFnExists = await client.query(
                    `SELECT EXISTS (SELECT 1 FROM pg_proc
                      WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = $1)
                        AND proname = 'trigger_algolia_sync') AS e`,
                    [schema]
                );
                if (productExists.rows[0].e && triggerFnExists.rows[0].e) {
                    await client.query(
                        `CREATE TRIGGER sf_product2_algolia_sync_trigger
                            AFTER INSERT OR UPDATE OR DELETE ON ${TARGET}.product2
                            FOR EACH ROW EXECUTE FUNCTION ${TARGET}.trigger_algolia_sync()`
                    );
                    log('info', `trigger: sf_product2_algolia_sync_trigger on product2`);
                } else {
                    log('warn', 'trigger not attached (product2 or trigger_algolia_sync missing)');
                }
            }

            const updFn = await client.query(
                `SELECT EXISTS (SELECT 1 FROM pg_proc
                  WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = $1)
                    AND proname = 'update_updated_at_column') AS e`,
                [schema]
            );
            if (updFn.rows[0].e) {
                await client.query(
                    `CREATE TRIGGER update_algolia_config_timestamp
                        BEFORE UPDATE ON ${TARGET}.algolia_index_config
                        FOR EACH ROW EXECUTE FUNCTION ${TARGET}.update_updated_at_column()`
                );
                log('info', `trigger: update_algolia_config_timestamp on algolia_index_config`);
            }

            // Pattern A: configure per-tenant index name
            await client.query(
                `INSERT INTO ${TARGET}.algolia_index_config
                    (table_name, index_name, transform_function, batch_size)
                 VALUES ($1, $2, $3, 100)
                 ON CONFLICT (table_name) DO UPDATE
                   SET index_name = EXCLUDED.index_name,
                       transform_function = EXCLUDED.transform_function,
                       is_enabled = TRUE`,
                [`${schema}.product2`, indexName, 'transform_sf_product_for_algolia']
            );
            log('info', `algolia_index_config: ${schema}.product2 → ${indexName}`);

            if (!dryRun) await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK').catch(() => { });
            throw e;
        }

        // Final verification — all lookups use string equality on
        // pg_namespace.nspname / pg_class.relname for case preservation.
        const verify = await client.query(
            `SELECT
                (SELECT count(*) FROM pg_tables
                  WHERE schemaname = $1 AND (tablename LIKE 'algolia_%' OR tablename = 'api_keys')) AS tables,
                (SELECT count(*) FROM pg_proc
                  WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = $1)
                    AND (proname LIKE '%algolia%' OR proname LIKE 'transform_%' OR proname LIKE 'trigger_%'
                         OR proname IN ('update_updated_at_column','run_algolia_maintenance'))) AS functions,
                (SELECT count(*) FROM pg_views
                  WHERE schemaname = $1 AND viewname LIKE 'algolia_%') AS views,
                (SELECT count(*) FROM information_schema.triggers
                  WHERE event_object_schema = $1 AND event_object_table = 'product2') AS triggers,
                EXISTS (
                    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                     WHERE n.nspname = $1 AND c.relname = 'product2'
                ) AS product2_present`,
            [schema]
        );
        const v = verify.rows[0];
        console.log(`\n==============================================`);
        console.log(`Summary for ${schema}:`);
        console.log(`  tables:     ${v.tables}`);
        console.log(`  functions:  ${v.functions}`);
        console.log(`  views:      ${v.views}`);
        console.log(`  triggers:   ${v.triggers}`);
        console.log(`  product2:   ${v.product2_present ? 'yes' : 'no'}`);
        console.log(`  index:      ${indexName}`);
        console.log(`==============================================\n`);

        // ============================================================
        // 4. Provision API key in public.tenant_api_keys
        // ============================================================
        if (!skipApiKey) {
            await provisionApiKey(client, relationExists);
        }

    } finally {
        client.release();
        await pool.end();
    }
}

// ----------------------------------------------------------------------------
// API key provisioning — inserts a row in public.tenant_api_keys for this
// tenant.  Reuses the pepper from public.api_config (creates if missing).
// Stores both the hash and (if the column exists) the plaintext api_key.
// ----------------------------------------------------------------------------
async function provisionApiKey(client, relationExists) {
    console.log(`API key provisioning:`);

    const hasTable = await relationExists('public', 'tenant_api_keys');
    if (!hasTable) {
        log('warn', 'public.tenant_api_keys does not exist — skipping API key step');
        return;
    }

    // Existing active key?
    const existing = await client.query(
        `SELECT id, key_prefix FROM public.tenant_api_keys
          WHERE schema_name = $1 AND is_active = TRUE
          LIMIT 1`,
        [schema]
    );

    if (existing.rows.length > 0 && !rotateKey) {
        log('info', `tenant_api_keys: ${schema} already has active key (prefix=${existing.rows[0].key_prefix}) — skipping (pass --rotate-key to issue a new one)`);
        return;
    }

    if (existing.rows.length > 0 && rotateKey) {
        await client.query(
            `UPDATE public.tenant_api_keys
                SET is_active = FALSE,
                    revoked_at = now(),
                    revoked_reason = 'rotated by setup-tenant-schema.js'
              WHERE schema_name = $1 AND is_active = TRUE`,
            [schema]
        );
        log('info', `Revoked existing active key(s) for ${schema}`);
    }

    // Resolve pepper.  If api_config table exists with a row, use it.  If not,
    // generate one and store it.
    const apiConfigExists = await relationExists('public', 'api_config');
    let pepper;
    if (apiConfigExists) {
        const pepperResult = await client.query(
            `SELECT value FROM public.api_config WHERE key = 'external_api_key_pepper'`
        );
        if (pepperResult.rows.length > 0) {
            pepper = pepperResult.rows[0].value;
        } else {
            pepper = crypto.randomBytes(32).toString('hex');
            await client.query(
                `INSERT INTO public.api_config (key, value) VALUES ('external_api_key_pepper', $1)`,
                [pepper]
            );
            log('info', `Generated new pepper, stored in public.api_config`);
            console.log(`    PEPPER (set as EXTERNAL_API_KEY_PEPPER on every API server):`);
            console.log(`      ${pepper}`);
        }
    } else {
        // No api_config table — generate pepper but only print, don't store
        pepper = crypto.randomBytes(32).toString('hex');
        log('warn', 'public.api_config missing — pepper not persisted; print only');
        console.log(`    PEPPER: ${pepper}`);
    }

    // Generate the key
    const prefix = crypto.randomBytes(4).toString('hex');
    const secret = crypto.randomBytes(48).toString('base64')
        .replace(/[+/=]/g, '').slice(0, 32);
    const fullKey = `wovn_live_${prefix}_${secret}`;
    const hash = crypto.createHash('sha256').update(fullKey + pepper).digest('hex');

    // Check for plaintext api_key column (dev-mode shortcut)
    const hasApiKeyCol = await client.query(
        `SELECT EXISTS (
            SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public'
               AND table_name   = 'tenant_api_keys'
               AND column_name  = 'api_key'
         ) AS e`
    );

    if (hasApiKeyCol.rows[0].e) {
        await client.query(
            `INSERT INTO public.tenant_api_keys
                (tenant_id, schema_name, key_prefix, key_hash, api_key, name, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [schema, schema, prefix, hash, fullKey, `${schema} production key`, 'setup-tenant-schema.js']
        );
        log('info', `Inserted into public.tenant_api_keys with plaintext api_key column`);
    } else {
        await client.query(
            `INSERT INTO public.tenant_api_keys
                (tenant_id, schema_name, key_prefix, key_hash, name, created_by)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [schema, schema, prefix, hash, `${schema} production key`, 'setup-tenant-schema.js']
        );
        log('info', `Inserted into public.tenant_api_keys (hash-only — no plaintext column)`);
    }

    console.log(`\n--------------------------------------------------------`);
    console.log(`API KEY for tenant: ${schema}`);
    console.log(`  prefix:  ${prefix}`);
    console.log(`  KEY:     ${fullKey}`);
    console.log(`  (COPY NOW — never stored unless you have the api_key column)`);
    console.log(`--------------------------------------------------------\n`);
}

main().catch(err => {
    console.error('\nFATAL:', err.message);
    process.exit(1);
});
