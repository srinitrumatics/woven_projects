-- Add Product_Availability__c field to salesforce.product2
ALTER TABLE salesforce.product2 ADD COLUMN IF NOT EXISTS product_availability__c VARCHAR(255);

-- Update the transform function to include the new field
CREATE OR REPLACE FUNCTION salesforce.transform_sf_product_for_algolia(product_row salesforce.product2)
RETURNS JSONB AS $$
BEGIN
    RETURN jsonb_strip_nulls(jsonb_build_object(
        'objectID', product_row.sfid,
        'sku', product_row.productcode,
        'name', product_row.name,
        'description', product_row.description,
        'price', COALESCE(product_row.gtherp__price__c, 0),
        'stock_quantity', COALESCE(product_row.gtherp__stock_quantity__c, 0),
        'available_quantity', COALESCE(product_row.gtherp__available_quantity__c, 0),
        'discount', COALESCE(product_row.gtherp__discount__c, 0),
        
        -- Primary image URL (first image for backward compatibility)
        'image_url', CASE
            WHEN product_row.image_url IS NOT NULL 
                AND product_row.image_url->'images' IS NOT NULL
                AND jsonb_array_length(product_row.image_url->'images') > 0
                THEN product_row.image_url#>>'{images,0,url}'
            ELSE NULL
        END,
        
        -- All images array (for gallery/carousel)
        'images', CASE
            WHEN product_row.image_url IS NOT NULL 
                AND product_row.image_url->'images' IS NOT NULL
                THEN product_row.image_url->'images'
            ELSE '[]'::jsonb
        END,
        
        -- Categories and Family
        'category', product_row.gtherp__category__c,
        'sub_category', product_row.gtherp__sub_category__c,
        'family', product_row.family,
        'manufacturer', product_row.manufacturer_name__c,
        
        'status', CASE WHEN product_row.isactive THEN 'active' ELSE 'inactive' END,
        'is_active', product_row.isactive,
        'product_availability', product_row.product_availability__c,
        
        'created_at', EXTRACT(EPOCH FROM product_row.createddate)::BIGINT,
        'updated_at', EXTRACT(EPOCH FROM product_row.systemmodstamp)::BIGINT,
        
        -- Searchable tags (remove NULLs)
        '_tags', ARRAY_REMOVE(ARRAY[
            product_row.family, 
            product_row.gtherp__category__c, 
            product_row.gtherp__sub_category__c,
            product_row.manufacturer_name__c,
            product_row.product_availability__c
        ], NULL)
    ));
END;
$$ LANGUAGE plpgsql IMMUTABLE;
