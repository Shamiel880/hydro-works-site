// /app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Create singleton Prisma client to avoid connection issues
const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV === 'development') globalThis.prisma = prisma;

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const perPage = parseInt(url.searchParams.get("per_page") || "4");
    const categoryId = url.searchParams.get("category");
    const featured = url.searchParams.get("featured") === "true";
    const search = url.searchParams.get("search"); // Add search parameter
    const sortBy = url.searchParams.get("sort") || "date"; // Add sort parameter
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");
    
    console.log('Search parameter received:', search); // Debug log
    
    // Calculate offset for pagination
    const skip = (page - 1) * perPage;
    
    // Build where clause
    const whereClause: any = {
      isPublished: true,
      purchasable: true,
    };
    
    // Add search functionality
    if (search && search.trim()) {
      const searchTerm = search.trim();
      whereClause.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
        { short_description: { contains: searchTerm, mode: "insensitive" } },
        { sku: { contains: searchTerm, mode: "insensitive" } },
        // Also search in categories
        {
          categories: {
            some: {
              name: { contains: searchTerm, mode: "insensitive" }
            }
          }
        }
      ];
    }
    
    // Add category filter if provided
    if (categoryId && categoryId !== "all") {
      // Try numeric ID first, fallback to string matching
      const numericId = parseInt(categoryId);
      if (!isNaN(numericId)) {
        whereClause.categories = {
          some: {
            wc_id: numericId // Using wc_id instead of id
          }
        };
      } else {
        // If categoryId is a string like "hydroponic", "organic"
        whereClause.categories = {
          some: {
            OR: [
              { name: { contains: categoryId, mode: "insensitive" } },
              { slug: { contains: categoryId, mode: "insensitive" } }
            ]
          }
        };
      }
    }
    
    // Add price range filtering
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) {
        whereClause.price.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        whereClause.price.lte = parseFloat(maxPrice);
      }
    }
    
    // Handle featured products using categories (no featured field exists in schema)
    if (featured) {
      whereClause.categories = {
        some: {
          OR: [
            { name: { contains: "featured", mode: "insensitive" } },
            { slug: { contains: "featured", mode: "insensitive" } }
          ]
        }
      };
    }
    
    // Build orderBy clause
    let orderBy: any = [{ createdAt: 'desc' }]; // default
    
    switch (sortBy) {
      case 'title':
        orderBy = [{ name: 'asc' }];
        break;
      case 'price-low':
        orderBy = [{ price: 'asc' }];
        break;
      case 'price-high':
        orderBy = [{ price: 'desc' }];
        break;
      case 'date':
      case 'newest':
      default:
        orderBy = [{ createdAt: 'desc' }];
        break;
    }
    
    console.log('Final where clause:', JSON.stringify(whereClause, null, 2)); // Debug log
    
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        images: {
          orderBy: {
            position: 'asc' // Order images by position
          }
        },
        categories: true,
        variations: {
          select: {
            id: true,
            wc_id: true,
            sku: true,
            price: true,
            stock_status: true,
            attributes: true,
          },
          orderBy: {
            id: 'asc'
          }
        },
      },
      skip,
      take: perPage,
      orderBy
    });
    
    console.log(`Found ${products.length} products`); // Debug log
    
    // Transform products to match WooCommerce format
    const transformedProducts = products.map(product => {
      // Process variations if they exist
      const variation_data = product.variations?.map((v) => {
        let parsedAttributes: { name: string; option: string }[] = [];
        if (v.attributes) {
          try {
            const jsonAttrs = typeof v.attributes === "string" ? JSON.parse(v.attributes) : v.attributes;
            parsedAttributes = Array.isArray(jsonAttrs) ? jsonAttrs : [];
          } catch {
            parsedAttributes = [];
          }
        }
        return {
          id: v.id,
          wc_id: v.wc_id,
          sku: v.sku,
          price: v.price,
          stock_status: v.stock_status,
          attributes: parsedAttributes,
        };
      }) || [];
      
      // Build product-level attributes from variations
      const buildProductAttributes = () => {
        if (!variation_data.length) return [];
        
        const attributeMap = new Map<string, Set<string>>();
        
        variation_data.forEach(variation => {
          variation.attributes.forEach(attr => {
            if (!attributeMap.has(attr.name)) {
              attributeMap.set(attr.name, new Set());
            }
            attributeMap.get(attr.name)!.add(attr.option);
          });
        });
        
        return Array.from(attributeMap.entries()).map(([name, optionsSet]) => ({
          id: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
          name: name,
          options: Array.from(optionsSet).sort()
        }));
      };
      
      // Determine if product is featured based on categories
      const isFeatured = product.categories.some(cat => 
        cat.name.toLowerCase().includes('featured') || 
        cat.slug?.toLowerCase().includes('featured')
      );
      
      return {
        id: product.id,
        wc_id: product.wc_id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        type: product.type,
        status: product.stock_status, 
        stock_status: product.stock_status,
        purchasable: product.purchasable,
        on_sale: product.on_sale,
        description: product.description,
        short_description: product.short_description,
        sku: product.sku,
        price_html: product.price ? `<span class="amount">R ${product.price}</span>` : "", // Add price_html for compatibility
        images: product.images?.map(img => ({
          id: img.id,
          src: img.src,
          alt: img.alt || product.name,
          position: img.position || 0
        })) || [],
        categories: product.categories?.map(cat => ({
          id: cat.id,
          wc_id: cat.wc_id,
          name: cat.name,
          slug: cat.slug,
          parent: cat.parentId
        })) || [],
        variation_data,
        attributes: buildProductAttributes(),
        featured: isFeatured,
        permalink: `/product/${product.slug}`,
        date_created: product.createdAt.toISOString(),
        date_modified: product.updatedAt.toISOString(),
      };
    });
    
    // Get total count for pagination metadata
    const totalProducts = await prisma.product.count({
      where: whereClause
    });
    
    const totalPages = Math.ceil(totalProducts / perPage);
    
    return NextResponse.json({
      items: transformedProducts,  // Changed from "products" to "items" to match store page
      products: transformedProducts, // Keep both for compatibility with SmartSearch component
      pagination: {
        page,
        per_page: perPage,
        perPage: perPage, // Add both formats
        total: totalProducts,
        total_pages: totalPages,
        totalPages: totalPages, // Add both formats
      }
    });
    
  } catch (error) {
    console.error('Products API error:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
    
    return NextResponse.json(
      { 
        error: "Failed to fetch products", 
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : "Unknown error") : "Internal server error"
      }, 
      { status: 500 }
    );
  }
}