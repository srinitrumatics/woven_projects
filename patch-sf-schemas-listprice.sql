-- patch-sf-schemas-listprice.sql
-- Applies the corrected transform_sf_product_for_algolia to every sf_* schema
-- that has the function defined (skips salesforce schema — already done separately).

DO $$
DECLARE
    r RECORD;
    sql TEXT;
BEGIN
    FOR r IN
        SELECT DISTINCT n.nspname AS schema
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'transform_sf_product_for_algolia'
          AND n.nspname LIKE 'sf_%'
        ORDER BY n.nspname
    LOOP
        RAISE NOTICE 'Patching schema: %', r.schema;

        sql := format($sql$
            CREATE OR REPLACE FUNCTION %I.transform_sf_product_for_algolia(product_row %I.product2)
            RETURNS JSONB AS $func$
            BEGIN
                RETURN jsonb_strip_nulls(jsonb_build_object(
                    'objectID', product_row.sfid,
                    'sku', product_row.productcode,
                    'name', product_row.name,
                    'description', product_row.description,
                    'price', COALESCE(product_row.gtherp__price__c, 0),
                    'listPrice', COALESCE(product_row.list_price__c, product_row.gtherp__price__c, 0),
                    'unitPrice', COALESCE(product_row.gtherp__price__c, 0),
                    'stock_quantity', COALESCE(product_row.gtherp__stock_quantity__c, 0),
                    'available_quantity', COALESCE(product_row.gtherp__available_quantity__c, 0),
                    'discount', COALESCE(product_row.gtherp__discount__c, 0),

                    'image_url', CASE
                        WHEN product_row.image_url IS NOT NULL
                            AND product_row.image_url->>'images' IS NOT NULL
                            AND jsonb_array_length(product_row.image_url->'images') > 0
                            THEN product_row.image_url#>>'{images,0,url}'
                        ELSE NULL
                    END,

                    'images', CASE
                        WHEN product_row.image_url IS NOT NULL
                            AND product_row.image_url->'images' IS NOT NULL
                            THEN product_row.image_url->'images'
                        ELSE '[]'::jsonb
                    END,

                    'category', product_row.gtherp__category__c,
                    'sub_category', product_row.gtherp__sub_category__c,
                    'family', product_row.family,
                    'manufacturer', product_row.manufacturer_name__c,

                    'status', CASE WHEN product_row.isactive THEN 'active' ELSE 'inactive' END,
                    'is_active', product_row.isactive,
                    'product_availability', product_row.product_availability__c,
                    'Availability_Status__c', product_row.product_availability__c,

                    'created_at', EXTRACT(EPOCH FROM product_row.createddate)::BIGINT,
                    'updated_at', EXTRACT(EPOCH FROM product_row.systemmodstamp)::BIGINT,

                    '_tags', ARRAY_REMOVE(ARRAY[
                        product_row.family,
                        product_row.gtherp__category__c,
                        product_row.gtherp__sub_category__c,
                        product_row.manufacturer_name__c,
                        product_row.product_availability__c
                    ], NULL)
                ));
            END;
            $func$ LANGUAGE plpgsql IMMUTABLE;
        $sql$, r.schema, r.schema);

        EXECUTE sql;
        RAISE NOTICE 'Done: %', r.schema;
    END LOOP;
END;
$$;
