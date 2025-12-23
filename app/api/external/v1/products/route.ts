
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { product2, salesforceSchema } from '@/db/salesforce-schema';
import { validateApiKey } from '@/lib/auth/api-key';
import { desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    const apiKey = request.headers.get('x-api-key');
    const authResult = await validateApiKey(apiKey || '');

    console.log('API Key:', apiKey);
    console.log('Auth Result:', authResult);
    if (!authResult.valid) {
        return NextResponse.json(
            { error: 'Unauthorized', message: 'Invalid or missing API Key' },
            { status: 401 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = parseInt(searchParams.get('offset') || '0');

        const products = await db.select()
            .from(product2)
            .limit(limit)
            .offset(offset)
            .orderBy(desc(product2.createdDate));

        // Get total count for pagination metadata
        // Note: count() might be slow on large tables, consider rough estimate if needed
        const totalResult = await db.select({ count: sql<number>`count(*)` }).from(product2);
        const total = Number(totalResult[0]?.count || 0);

        return NextResponse.json({
            data: products,
            meta: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total
            }
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const apiKey = request.headers.get('x-api-key');
    const authResult = await validateApiKey(apiKey || '');

    if (!authResult.valid) {
        return NextResponse.json(
            { error: 'Unauthorized', message: 'Invalid or missing API Key' },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();

        // Debug logging
        console.log('Received body:', JSON.stringify(body, null, 2));
        console.log('imageUrl field:', body.imageUrl);
        console.log('imageUrl type:', typeof body.imageUrl);

        // Basic validation
        if (!body.name || !body.productCode) {
            return NextResponse.json(
                { error: 'Bad Request', message: 'Name and Product Code are required' },
                { status: 400 }
            );
        }

        // Generate SFID if not provided (mocking logic or using UUID)
        // Salesforce IDs are 18 chars. For external new products, we might need a strategy.
        // For now, we'll generate a pseudo-ID if not present.
        const sfid = body.sfid || `EXT${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        const newProduct = await db.insert(product2).values({
            sfid: sfid, // Manual ID generation
            name: body.name,
            productCode: body.productCode,
            description: body.description,
            isActive: body.isActive ?? true,
            family: body.family,
            imageUrl: body.imageUrl || null, // JSONB field for image data
            price: body.price ? String(body.price) : undefined, // Numeric is string in JS/Drizzle usually
            stockQuantity: body.stockQuantity ? String(body.stockQuantity) : undefined,
            availableQuantity: body.availableQuantity ? String(body.availableQuantity) : undefined,
            discount: body.discount ? String(body.discount) : undefined,
            category: body.category,
            subCategory: body.subCategory,
            manufacturerName: body.manufacturerName,
            // Add other fields as necessary
            createdDate: new Date(),
            systemModStamp: new Date(),
        }).returning();

        return NextResponse.json({ data: newProduct[0] }, { status: 201 });

    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: 'Failed to create product' },
            { status: 500 }
        );
    }
}
