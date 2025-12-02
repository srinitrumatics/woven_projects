import Sidebar from "@/components/layouts/Sidebar";
import { requireAuth } from "@/lib/auth";
import { mockProducts } from "./mockData";
import ProductClientPage from "./ProductClientPage";

interface ProductsPageProps {
  searchParams?: {
    page?: string;
    search?: string;
    family?: string;
    view?: 'list' | 'card';
  };
}

type SearchParams = Promise<{
  page?: string;
  search?: string;
  family?: string;
  view?: 'list' | 'card';
}>;

export default async function ProductsPage({ searchParams: rawSearchParams }: { searchParams?: SearchParams }) {
  const searchParams = await rawSearchParams;
  // Server-side authentication and permission check
  await requireAuth(['product-list', 'product-read']);

  const currentPage = Number(searchParams?.page) || 1;
  const searchQuery = searchParams?.search || '';
  const selectedFamily = searchParams?.family || 'All';
  const itemsPerPage = 9;

  // Get unique product families
  const productFamilies = Array.from(new Set(mockProducts.map(p => p.productFamily)));

  // Filter products server-side
  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFamily = selectedFamily === "All" || product.productFamily === selectedFamily;

    return matchesSearch && matchesFamily;
  });

  // Pagination server-side
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Sidebar>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Products</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Browse our complete product catalog with pricing and availability
        </p>
      </div>
      <ProductClientPage
        initialProducts={paginatedProducts}
        initialTotalPages={totalPages}
        initialCurrentPage={currentPage}
        productFamilies={productFamilies}
      />
    </Sidebar>
  );
}