"use client"; // for Next 13+ app directory

import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  slug: string;
  price: string | null;
  stock_status: string;
  images: { src: string; alt?: string }[];
  categories: { id: number; slug: string; name: string }[];
};

type Pagination = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    perPage: 24,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);

  async function fetchProducts() {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: "24",
      ...(search ? { search } : {}),
      ...(category ? { category } : {}),
    });
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.items);
    setPagination(data.pagination);
    setLoading(false);
  }

  useEffect(() => {
    fetchProducts();
  }, [page, search, category]);

  return (
    <div>
      {/* Search */}
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 mb-4 w-full"
      />

      {/* Product Grid */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p.id} className="border p-2">
              {p.images[0] && (
                <img
                  src={p.images[0].src}
                  alt={p.images[0].alt || p.name}
                  className="w-full h-40 object-cover mb-2"
                />
              )}
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-green-700">{p.price ? `R${p.price}` : "—"}</p>
              <p className="text-gray-500 text-sm">{p.stock_status}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center mt-4 gap-2">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          {pagination.page} / {pagination.totalPages}
        </span>
        <button
          disabled={page >= pagination.totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
