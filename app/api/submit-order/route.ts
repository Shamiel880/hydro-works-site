export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { prisma } from '@/lib/prisma'; // Use the singleton

// Improved save function with connection pooling and retries
async function saveQuoteToDatabase(quoteData: any) {
  let retries = 3;
  
  while (retries > 0) {
    try {
      console.log(`Attempting to save quote (${4 - retries}/3):`, {
        woocommerceOrderId: quoteData.woocommerce_order_id,
        customerEmail: quoteData.customer_email,
        orderTotal: quoteData.order_total
      });

      // Test connection with timeout
      const connectionTest = await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        )
      ]);

      console.log('Database connection test passed');

      const quote = await prisma.wooCommerceQuote.create({
        data: {
          woocommerceOrderId: quoteData.woocommerce_order_id,
          customerEmail: quoteData.customer_email,
          customerName: quoteData.customer_name,
          customerPhone: quoteData.customer_phone || null,
          customerCompany: quoteData.customer_company || null,
          shippingAddress: quoteData.shipping_address,
          billingAddress: quoteData.billing_address,
          lineItems: quoteData.line_items,
          shippingTotal: parseFloat(quoteData.shipping_total),
          orderTotal: parseFloat(quoteData.order_total),
          customerNote: quoteData.customer_note || null,
          projectType: quoteData.project_type || null,
          shippingRegion: quoteData.shipping_region || null,
          estimatedFulfillment: quoteData.estimated_fulfillment || null,
          metaData: quoteData.meta_data || null
        }
      });

      console.log('✅ Quote saved successfully:', quote.id);
      return { success: true, data: quote };

    } catch (error: any) {
      retries--;
      console.error(`❌ Database save attempt failed (${3 - retries}/3):`, {
        error: error.message,
        code: error.code,
        retriesLeft: retries
      });

      // Handle specific Prisma errors
      if (error.code === 'P2002') {
        console.error('Unique constraint violation - duplicate entry');
        break; // Don't retry on constraint violations
      } else if (error.code === 'P1001' || error.code === 'P1017') {
        console.error('Database connection issue - retrying...');
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          continue;
        }
      } else if (error.code === 'P1003') {
        console.error('Database does not exist');
        break;
      }

      if (retries === 0) {
        console.error('All retry attempts failed');
        return { success: false, error };
      }
    }
  }
  
  return { success: false, error: new Error('Max retries exceeded') };
}

// Email service integration
async function sendQuoteRequestNotifications(emailData: any) {
  try {
    // Send customer confirmation email
    await sendCustomerConfirmation(emailData);
    // Send internal notification to sales team
    await sendSalesNotification(emailData);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}

async function sendCustomerConfirmation(emailData: any) {
  const customerEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .order-details { background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .item { padding: 10px 0; border-bottom: 1px solid #eee; }
            .total { font-weight: bold; color: #4CAF50; font-size: 1.2em; }
            .steps { background-color: #e8f5e8; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .step { margin: 10px 0; }
            .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 0.9em; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Quote Request Received - Hydro Works</h1>
        </div>
        
        <div class="content">
            <h2>Thank you, ${emailData.customer_name}!</h2>
            <p>We've received your quote request and will get back to you within <strong>${emailData.estimated_quote_time}</strong>.</p>
            
            <div class="steps">
                <h3>What happens next:</h3>
                <div class="step">✅ <strong>Step 1:</strong> We confirm stock availability with our suppliers</div>
                <div class="step">⏱️ <strong>Step 2:</strong> You'll receive a secure payment link via email</div>
                <div class="step">🚚 <strong>Step 3:</strong> Fast delivery within 3-5 business days after payment</div>
            </div>
            
            <div class="order-details">
                <h3>Quote Request #${emailData.order_id}</h3>
                ${emailData.line_items.map((item: any) => `
                    <div class="item">
                        <strong>${item.name}</strong><br>
                        Quantity: ${item.quantity} × R${parseFloat(item.price || '0').toFixed(2)}
                        = R${(parseFloat(item.price || '0') * item.quantity).toFixed(2)}
                    </div>
                `).join('')}
                <div class="item total">
                    Total: R${emailData.order_total}
                </div>
                <p><small><em>Final pricing may vary based on current stock availability. Prices valid for 30 days.</em></small></p>
            </div>
            
            <p><strong>Important:</strong> No payment is required now. We'll confirm stock and send you a payment link once everything is available.</p>
            
            <p>Questions about your quote?</p>
            <ul>
                <li>Email: <a href="mailto:sales@hydroworks.co.za">sales@hydroworks.co.za</a></li>
                <li>Phone: <a href="tel:+27123456789">+27 12 345 6789</a></li>
            </ul>
        </div>
        
        <div class="footer">
            <p>Hydro Works - Smart Hydroponic Solutions<br>
            Cape Town, South Africa<br>
            <a href="https://hydroworks.co.za">www.hydroworks.co.za</a></p>
        </div>
    </body>
    </html>
  `;

  const customerResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Hydro Works <info@hydroworks.co.za>',
      to: [emailData.customer_email],
      subject: `Quote Request Confirmation #${emailData.order_id} - Hydro Works`,
      html: customerEmailHtml,
    }),
  });

  if (!customerResponse.ok) {
    const errorData = await customerResponse.json();
    throw new Error(`Customer email failed: ${JSON.stringify(errorData)}`);
  }
}

async function sendSalesNotification(emailData: any) {
  const urgencyLabel = emailData.project_type === 'urgent' ? '🔥 URGENT' : 
                      emailData.project_type === 'commercial' ? '🏢 COMMERCIAL' : '';

  const salesEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background-color: #2196F3; color: white; padding: 20px; }
            .urgent { background-color: #ff5722; }
            .commercial { background-color: #ff9800; }
            .content { padding: 20px; }
            .customer-info { background-color: #f0f8ff; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .order-details { background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .item { padding: 8px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
            .total { font-weight: bold; color: #2196F3; font-size: 1.1em; border-top: 2px solid #2196F3; padding-top: 10px; }
            .actions { background-color: #e8f5e8; padding: 15px; margin: 20px 0; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
        </style>
    </head>
    <body>
        <div class="header ${emailData.project_type === 'urgent' ? 'urgent' : emailData.project_type === 'commercial' ? 'commercial' : ''}">
            <h1>${urgencyLabel} New Quote Request #${emailData.order_id}</h1>
            <p>Estimated response time: ${emailData.estimated_quote_time}</p>
        </div>
        
        <div class="content">
            <div class="customer-info">
                <h3>Customer Information</h3>
                <table>
                    <tr><td><strong>Name:</strong></td><td>${emailData.customer_name}</td></tr>
                    <tr><td><strong>Email:</strong></td><td><a href="mailto:${emailData.customer_email}">${emailData.customer_email}</a></td></tr>
                    <tr><td><strong>Phone:</strong></td><td><a href="tel:${emailData.phone || 'N/A'}">${emailData.phone || 'N/A'}</a></td></tr>
                    <tr><td><strong>Company:</strong></td><td>${emailData.company || 'N/A'}</td></tr>
                    <tr><td><strong>Address:</strong></td><td>${emailData.full_address}</td></tr>
                    <tr><td><strong>Project Type:</strong></td><td>${emailData.project_type || 'General'}</td></tr>
                </table>
                
                ${emailData.customer_note ? `
                    <div style="margin-top: 15px; padding: 10px; background: white; border-radius: 5px;">
                        <strong>Project Details / Special Requirements:</strong><br>
                        <em>${emailData.customer_note}</em>
                    </div>
                ` : ''}
            </div>
            
            <div class="order-details">
                <h3>Quote Details</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${emailData.line_items.map((item: any) => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>R${parseFloat(item.price || '0').toFixed(2)}</td>
                                <td>R${(parseFloat(item.price || '0') * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div style="margin-top: 15px;">
                    <div><strong>Shipping (${emailData.shipping_region}):</strong> R${emailData.shipping_total || '0.00'}</div>
                    <div class="total"><strong>Total Quote Value:</strong> R${emailData.order_total}</div>
                </div>
            </div>
            
            <div class="actions">
                <h3>Required Actions:</h3>
                <ul>
                    <li>✅ Check stock availability with suppliers</li>
                    <li>📧 Confirm pricing and send payment link</li>
                    <li>📋 Update order status in WooCommerce</li>
                    <li>📞 Follow up if needed within ${emailData.estimated_quote_time}</li>
                </ul>
                
                <p><strong>WooCommerce Order:</strong> <a href="https://backend.hydroworks.co.za/wp/wp-admin/post.php?post=${emailData.order_id}&action=edit" target="_blank">View Order #${emailData.order_id}</a></p>
            </div>
        </div>
    </body>
    </html>
  `;

  const salesResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Hydro Works Orders <info@hydroworks.co.za>',
      to: ['sales@hydroworks.co.za'],
      subject: `${urgencyLabel} Quote Request #${emailData.order_id} - R${emailData.order_total} - ${emailData.customer_name}`,
      html: salesEmailHtml,
    }),
  });

  if (!salesResponse.ok) {
    const errorData = await salesResponse.json();
    throw new Error(`Sales notification failed: ${JSON.stringify(errorData)}`);
  }
}

export async function POST(req: NextRequest) {
  // Validate environment variables
  if (!process.env.WC_API_KEY || !process.env.WC_API_SECRET) {
    return NextResponse.json(
      { success: false, message: "WooCommerce API credentials are missing" },
      { status: 500 }
    );
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { success: false, message: "Database URL is missing" },
      { status: 500 }
    );
  }

  // Initialize WooCommerce API
  const api = new WooCommerceRestApi({
    url: "https://backend.hydroworks.co.za/wp",
    consumerKey: process.env.WC_API_KEY,
    consumerSecret: process.env.WC_API_SECRET,
    version: "wc/v3",
    timeout: 10000,
  });

  try {
    const body = await req.json();
    const {
      billing,
      shipping,
      line_items,
      shipping_lines,
      payment_method = "bacs",
      payment_method_title = "Quote Request - Payment Link to Follow",
      customer_note,
      meta_data = []
    } = body;

    console.log('Processing quote request with', line_items.length, 'items');

    // Format line items for WooCommerce
    const orderData: Record<string, any> = {
      payment_method,
      payment_method_title,
      set_paid: false,
      status: "pending",
      billing,
      shipping,
      // CRITICAL: Format line_items correctly for WooCommerce
      line_items: line_items.map((item: any) => {
        const lineItem: any = {
          quantity: item.quantity,
          // Convert price to number and only include if present
          ...(item.price && { price: parseFloat(item.price) })
        };

        // Handle variable products (have variation_id)
        if (item.variation_id) {
          // For variations, we need the parent product_id
          if (item.parent_id) {
            lineItem.product_id = item.parent_id;
          } else {
            console.warn('Variation missing parent product_id:', item);
          }
          lineItem.variation_id = item.variation_id;
        } else {
          // Simple products
          lineItem.product_id = item.product_id;
        }

        return lineItem;
      }).filter(item => item.product_id), // Remove items without product_id
      shipping_lines,
    };

    if (customer_note) {
      orderData.customer_note = customer_note;
    }

    // Add quote-specific meta data
    if (meta_data && meta_data.length > 0) {
      orderData.meta_data = [
        ...meta_data,
        {
          key: '_is_quote_request',
          value: 'yes'
        },
        {
          key: '_quote_request_date',
          value: new Date().toISOString()
        }
      ];
    }

    console.log('=== DEBUG LINE ITEMS ===');
    console.log('Raw line_items received:', JSON.stringify(line_items, null, 2));
    console.log('Formatted for WooCommerce:', JSON.stringify(orderData.line_items, null, 2));
    console.log('========================');

    console.log('Submitting order to WooCommerce...');
    const { data: order } = await api.post("orders", orderData);
    console.log('✅ WooCommerce order created:', order.id);

    // Calculate totals for email from frontend data (keep using original line_items for email)
    const lineItemsTotal = line_items.reduce((sum: number, item: any) => {
      const price = parseFloat(item.price || '0');
      return sum + (price * item.quantity);
    }, 0);

    const shippingTotal = shipping_lines.reduce((sum: number, line: any) => {
      return sum + parseFloat(line.total || '0');
    }, 0);

    // Prepare quote data for database
    const quoteData = {
      woocommerce_order_id: order.id,
      customer_email: billing.email,
      customer_name: `${billing.first_name} ${billing.last_name}`,
      customer_phone: billing.phone,
      customer_company: billing.company,
      shipping_address: `${shipping.address_1}${shipping.address_2 ? ', ' + shipping.address_2 : ''}, ${shipping.city}, ${shipping.state}, ${shipping.postcode}`,
      billing_address: `${billing.address_1}${billing.address_2 ? ', ' + billing.address_2 : ''}, ${billing.city}, ${billing.state}, ${billing.postcode}`,
      line_items: line_items, // Store original line_items with names
      shipping_total: shippingTotal.toFixed(2),
      order_total: (lineItemsTotal + shippingTotal).toFixed(2),
      customer_note: customer_note,
      project_type: meta_data.find((m: any) => m.key === '_customer_project_type')?.value || 'general',
      shipping_region: meta_data.find((m: any) => m.key === '_shipping_region')?.value || billing.state || 'Unknown',
      estimated_fulfillment: meta_data.find((m: any) => m.key === '_estimated_fulfillment')?.value || '3-5 business days',
      meta_data: meta_data
    };

    // Save quote to database with improved error handling
    console.log('Saving quote to database...');
    const quoteResult = await saveQuoteToDatabase(quoteData);
    
    if (!quoteResult.success) {
      console.error('❌ Failed to save quote to database:', quoteResult.error);
    } else {
      console.log('✅ Quote saved to database successfully');
    }

    // Prepare email data with accurate pricing from frontend
    const emailData = {
      customer_email: billing.email,
      customer_name: `${billing.first_name} ${billing.last_name}`,
      phone: billing.phone,
      company: billing.company,
      full_address: `${billing.address_1}${billing.address_2 ? ', ' + billing.address_2 : ''}, ${billing.city}, ${billing.state}, ${billing.postcode}`,
      customer_note: customer_note,
      order_id: order.id,
      order_total: (lineItemsTotal + shippingTotal).toFixed(2),
      shipping_total: shippingTotal.toFixed(2),
      shipping_region: meta_data.find((m: any) => m.key === '_shipping_region')?.value || billing.state || 'Unknown',
      // Use original line_items data for email (with names and prices)
      line_items: line_items.map((item: any) => ({
        name: item.name || 'Product',
        quantity: item.quantity,
        price: (item.price || '0').toString(),
      })),
      estimated_quote_time: meta_data.find((m: any) => m.key === '_customer_project_type')?.value === 'urgent' ? '12-24 hours' : '24-48 hours',
      project_type: meta_data.find((m: any) => m.key === '_customer_project_type')?.value || 'general',
    };

    // Send notification emails (don't fail the order if emails fail)
    try {
      console.log('Sending notification emails...');
      await sendQuoteRequestNotifications(emailData);
      console.log('✅ Email notifications sent successfully');
    } catch (emailError) {
      console.error('❌ Email notifications failed:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Quote request submitted successfully",
      order,
      quote_saved: quoteResult.success,
      supabase_quote_id: quoteResult.success ? quoteResult.data?.id : null,
    });

  } catch (error: any) {
    const errorMsg = error.response?.data || error.message || "Unknown error";
    console.error("❌ Quote submission error:", errorMsg);
    
    // Log the full error for debugging
    if (error.response?.data) {
      console.error("Full WooCommerce error response:", JSON.stringify(error.response.data, null, 2));
    }

    return NextResponse.json(
      {
        success: false,
        message: "Quote request submission failed",
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}