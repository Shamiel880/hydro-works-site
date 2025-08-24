export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
      const productId = params.id
      // Fetch from WooCommerce API
      const response = await fetch(`${process.env.WOOCOMMERCE_URL}/wp-json/wc/v3/products/${productId}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_KEY}:${process.env.WOOCOMMERCE_SECRET}`).toString('base64')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch product')
      }
      
      const product = await response.json()
      return Response.json(product)
    } catch (error) {
      return Response.json({ error: 'Failed to fetch product' }, { status: 500 })
    }
  }