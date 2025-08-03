// types/woocommerce.ts

// Variation type included here for completeness
export interface WooCommerceVariation {
  id: number
  attributes: {
    name: string
    option: string
  }[]
  price: string
  regular_price: string
  sale_price: string
  stock_status: string
  purchasable: boolean
  image: WooCommerceImage | null
  price_html: string
}

export interface WooCommerceProduct {
  id: number
  name: string
  slug: string
  permalink: string
  date_created: string
  date_modified: string
  type: string
  status: string
  featured: boolean
  catalog_visibility: string
  description: string
  short_description: string
  sku: string
  price: string
  regular_price: string
  sale_price: string
  price_html: string
  on_sale: boolean
  purchasable: boolean
  total_sales: number
  virtual: boolean
  downloadable: boolean
  downloads: any[]
  download_limit: number
  download_expiry: number
  external_url: string
  button_text: string
  tax_status: string
  tax_class: string
  manage_stock: boolean
  stock_quantity: number | null
  stock_status: string
  backorders: string
  backorders_allowed: boolean
  backordered: boolean
  sold_individually: boolean
  weight: string
  dimensions: {
    length: string
    width: string
    height: string
  }
  shipping_required: boolean
  shipping_taxable: boolean
  shipping_class: string
  shipping_class_id: number
  reviews_allowed: boolean
  average_rating: string
  rating_count: number
  related_ids: number[]
  upsell_ids: number[]
  cross_sell_ids: number[]
  parent_id: number
  purchase_note: string
  categories: WooCommerceCategory[]
  tags: any[]
  images: WooCommerceImage[]
  attributes: WooCommerceAttribute[]
  default_attributes: any[]
  variations: number[]
  grouped_products: number[]
  menu_order: number
  meta_data: any[]
  parent_data?: {
    id: number
    name: string
    slug: string
  }

  // Full variation data for variable products (optional)
  variation_data?: WooCommerceVariation[]
}

export interface WooCommerceCategory {
  id: number
  name: string
  slug: string
  parent: number
  description: string
  display: string
  image: WooCommerceImage | null
  menu_order: number
  count: number
}

export interface WooCommerceImage {
  id: number
  date_created: string
  date_modified: string
  src: string
  name: string
  alt: string
}

export interface WooCommerceAttribute {
  id: number
  name: string
  position: number
  visible: boolean
  variation: boolean
  options: string[]
}

export interface ProductsResponse {
  products: WooCommerceProduct[]
  pagination: {
    current_page: number
    total_pages: number
    total_products: number
    per_page: number
  }
}

