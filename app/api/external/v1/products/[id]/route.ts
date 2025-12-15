
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { product2 } from '@/db/salesforce-schema';
import { validateApiKey } from '@/lib/auth/api-key';
import { eq } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const apiKey = request.headers.get('x-api-key');
    const authResult = await validateApiKey(apiKey || '');
    const { id } = await params;

    if (!authResult.valid) {
        return NextResponse.json(
            { error: 'Unauthorized', message: 'Invalid or missing API Key' },
            { status: 401 }
        );
    }

    try {
        const product = await db.select()
            .from(product2)
            .where(eq(product2.sfid, id))
            .limit(1);

        if (!product || product.length === 0) {
            return NextResponse.json(
                { error: 'Not Found', message: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: product[0] });
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const apiKey = request.headers.get('x-api-key');
    const authResult = await validateApiKey(apiKey || '');
    const { id } = await params;

    if (!authResult.valid) {
        return NextResponse.json(
            { error: 'Unauthorized', message: 'Invalid or missing API Key' },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();

        // Check if product exists first
        const existing = await db.select({ sfid: product2.sfid })
            .from(product2)
            .where(eq(product2.sfid, id))
            .limit(1);

        if (!existing || existing.length === 0) {
            return NextResponse.json(
                { error: 'Not Found', message: 'Product not found' },
                { status: 404 }
            );
        }

        const updatedProduct = await db.update(product2)
            .set({
                name: body.name,
                productCode: body.productCode,
                description: body.description,
                isActive: body.isActive,
                family: body.family,
                price: body.price ? String(body.price) : undefined,
                stockQuantity: body.stockQuantity ? String(body.stockQuantity) : undefined,
                systemModStamp: new Date(), // touch update time
            })
            .where(eq(product2.sfid, id))
            .returning();

        return NextResponse.json({ data: updatedProduct[0] });

    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: 'Failed to update product' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const apiKey = request.headers.get('x-api-key');
    const authResult = await validateApiKey(apiKey || '');
    const { id } = await params;

    if (!authResult.valid) {
        return NextResponse.json(
            { error: 'Unauthorized', message: 'Invalid or missing API Key' },
            { status: 401 }
        );
    }

    try {
        const deleted = await db.delete(product2)
            .where(eq(product2.sfid, id))
            .returning({ sfid: product2.sfid });

        if (!deleted || deleted.length === 0) {
            return NextResponse.json(
                { error: 'Not Found', message: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Product deleted successfully', id: deleted[0].sfid });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: 'Failed to delete product' },
            { status: 500 }
        );
    }
}
