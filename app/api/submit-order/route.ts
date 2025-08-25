export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { prisma, connectToDatabase } from "@/lib/prisma";

// Enhanced logging function for Vercel
function log(level: 'info' | 'error' | 'warn', message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  
  if (data) {
    console.log(logMessage, JSON.stringify(data, null, 2));
  } else {
    console.log(logMessage);
  }
}

// Improved save function with better error handling for Vercel
async function saveQuoteToDatabase(quoteData: any) {
  let retries = 3;
  let lastError: any = null;

  while (retries > 0) {
    try {
      log('info', `Attempting to save quote (${4 - retries}/3)`, {
        woocommerceOrderId: quoteData.woocommerce_order_id,
        customerEmail: quoteData.customer_email,
        orderTotal: quoteData.order_total,
      });

      // Ensure database connection
      await connectToDatabase();

      // Test connection with shorter timeout for serverless
      const connectionTest = await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Connection timeout")), 3000)
        ),
      ]);

      log('info', "Database connection test passed");

      // Ensure all required fields are properly typed
      const quote = await prisma.wooCommerceQuote.create({
        data: {
          woocommerceOrderId: parseInt(quoteData.woocommerce_order_id),
          customerEmail: String(quoteData.customer_email || ''),
          customerName: String(quoteData.customer_name || ''),
          customerPhone: quoteData.customer_phone ? String(quoteData.customer_phone) : null,
          customerCompany: quoteData.customer_company ? String(quoteData.customer_company) : null,
          shippingAddress: quoteData.shipping_address ? String(quoteData.shipping_address) : null,
          billingAddress: quoteData.billing_address ? String(quoteData.billing_address) : null,
          lineItems: quoteData.line_items || [],
          shippingTotal: parseFloat(String(quoteData.shipping_total || '0')),
          orderTotal: parseFloat(String(quoteData.order_total || '0')),
          customerNote: quoteData.customer_note ? String(quoteData.customer_note) : null,
          projectType: String(quoteData.project_type || 'general'),
          shippingRegion: quoteData.shipping_region ? String(quoteData.shipping_region) : null,
          estimatedFulfillment: quoteData.estimated_fulfillment ? String(quoteData.estimated_fulfillment) : null,
          metaData: quoteData.meta_data || null,
        },
      });

      log('info', "Quote saved successfully", { quoteId: quote.id });
      return { success: true, data: quote };
      
    } catch (error: any) {
      retries--;
      lastError = error;
      
      log('error', `Database save attempt failed (${3 - retries}/3)`, {
        error: error.message,
        code: error.code,
        retriesLeft: retries,
        stack: error.stack?.split('\n').slice(0, 3) // Limited stack trace
      });

      // Handle specific Prisma errors
      if (error.code === "P2002") {
        log('error', "Unique constraint violation - duplicate entry");
        break; // Don't retry on constraint violations
      } else if (error.code === "P1001" || error.code === "P1017") {
        log('warn', "Database connection issue - retrying...");
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
          continue;
        }
      } else if (error.code === "P1003") {
        log('error', "Database does not exist");
        break;
      }

      if (retries === 0) {
        log('error', "All retry attempts failed", { finalError: lastError.message });
        return { success: false, error: lastError };
      }
    }
  }

  return { success: false, error: lastError || new Error("Max retries exceeded") };
}

// Separate email functions with better error handling
async function sendCustomerConfirmation(emailData: any) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

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
            .shipping-line { padding: 10px 0; border-bottom: 1px solid #eee; color: #666; }
            .subtotal { padding: 10px 0; border-bottom: 2px solid #ddd; font-weight: bold; color: #666; }
            .total { font-weight: bold; color: #4CAF50; font-size: 1.2em; padding-top: 10px; }
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
                ${emailData.line_items
                  .map(
                    (item: any) => `
                    <div class="item">
                        <strong>${item.name}</strong><br>
                        Quantity: ${item.quantity} × R${parseFloat(item.price || "0").toFixed(2)}
                        = R${(parseFloat(item.price || "0") * item.quantity).toFixed(2)}
                    </div>
                `
                  )
                  .join("")}
                
                <div class="subtotal">
                    Subtotal: R${(parseFloat(emailData.order_total) - parseFloat(emailData.shipping_total)).toFixed(2)}
                </div>
                
                ${
                  parseFloat(emailData.shipping_total) > 0
                    ? `
                    <div class="shipping-line">
                        <strong>Shipping (${emailData.shipping_region}):</strong> R${parseFloat(emailData.shipping_total).toFixed(2)}
                    </div>
                `
                    : ""
                }
                
                <div class="total">
                    Total: R${emailData.order_total}
                </div>
                <p><small><em>Final pricing may vary based on current stock availability. Prices valid for 30 days.</em></small></p>
            </div>
            
            <p><strong>Important:</strong> No payment is required now. We'll confirm stock and send you a payment link once everything is available.</p>
            
            <p>Questions about your quote?</p>
            <ul>
                <li>Email: <a href="mailto:sales@hydroworks.co.za">sales@hydroworks.co.za</a></li>
                <li>Phone: <a href="tel:+27793215597">+27 79 321 5597</a></li>
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

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Hydro Works <info@hydroworks.co.za>",
      to: [emailData.customer_email],
      subject: `Quote Request Confirmation #${emailData.order_id} - Hydro Works`,
      html: customerEmailHtml,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
    throw new Error(`Customer email failed: ${JSON.stringify(errorData)}`);
  }

  const responseData = await response.json();
  log('info', 'Customer email sent successfully', { emailId: responseData.id });
  return responseData;
}

async function sendSalesNotification(emailData: any) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const urgencyLabel =
    emailData.project_type === "urgent"
      ? "🔥 URGENT"
      : emailData.project_type === "commercial"
      ? "🏢 COMMERCIAL"
      : "";

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
            .total { font-weight: bold; color: #2196F3; font-size: 1.1em; border-top: 2px solid #2196F3; padding-top: 10px; }
            .actions { background-color: #e8f5e8; padding: 15px; margin: 20px 0; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
        </style>
    </head>
    <body>
        <div class="header ${
          emailData.project_type === "urgent"
            ? "urgent"
            : emailData.project_type === "commercial"
            ? "commercial"
            : ""
        }">
            <h1>${urgencyLabel} New Quote Request #${emailData.order_id}</h1>
            <p>Estimated response time: ${emailData.estimated_quote_time}</p>
        </div>
        
        <div class="content">
            <div class="customer-info">
                <h3>Customer Information</h3>
                <table>
                    <tr><td><strong>Name:</strong></td><td>${emailData.customer_name}</td></tr>
                    <tr><td><strong>Email:</strong></td><td><a href="mailto:${emailData.customer_email}">${emailData.customer_email}</a></td></tr>
                    <tr><td><strong>Phone:</strong></td><td><a href="tel:${emailData.phone || "N/A"}">${emailData.phone || "N/A"}</a></td></tr>
                    <tr><td><strong>Company:</strong></td><td>${emailData.company || "N/A"}</td></tr>
                    <tr><td><strong>Address:</strong></td><td>${emailData.full_address}</td></tr>
                    <tr><td><strong>Project Type:</strong></td><td>${emailData.project_type || "General"}</td></tr>
                </table>
                
                ${
                  emailData.customer_note
                    ? `
                    <div style="margin-top: 15px; padding: 10px; background: white; border-radius: 5px;">
                        <strong>Project Details / Special Requirements:</strong><br>
                        <em>${emailData.customer_note}</em>
                    </div>
                `
                    : ""
                }
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
                        ${emailData.line_items
                          .map(
                            (item: any) => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>R${parseFloat(item.price || "0").toFixed(2)}</td>
                                <td>R${(parseFloat(item.price || "0") * item.quantity).toFixed(2)}</td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
                
                <div style="margin-top: 15px;">
                    <div><strong>Shipping (${emailData.shipping_region}):</strong> R${emailData.shipping_total || "0.00"}</div>
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

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Hydro Works Orders <info@hydroworks.co.za>",
      to: ["sales@hydroworks.co.za"],
      subject: `${urgencyLabel} Quote Request #${emailData.order_id} - R${emailData.order_total} - ${emailData.customer_name}`,
      html: salesEmailHtml,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
    throw new Error(`Sales notification failed: ${JSON.stringify(errorData)}`);
  }

  const responseData = await response.json();
  log('info', 'Sales email sent successfully', { emailId: responseData.id });
  return responseData;
}

// Email service integration with better error handling
async function sendQuoteRequestNotifications(emailData: any) {
  const results = {
    customerEmail: { success: false, error: null as any },
    salesEmail: { success: false, error: null as any }
  };

  // Send customer confirmation email
  try {
    await sendCustomerConfirmation(emailData);
    results.customerEmail.success = true;
    log('info', 'Customer confirmation email sent successfully');
  } catch (error: any) {
    results.customerEmail.error = error;
    log('error', 'Customer confirmation email failed', { error: error.message });
  }

  // Send internal notification to sales team
  try {
    await sendSalesNotification(emailData);
    results.salesEmail.success = true;
    log('info', 'Sales notification email sent successfully');
  } catch (error: any) {
    results.salesEmail.error = error;
    log('error', 'Sales notification email failed', { error: error.message });
  }

  return {
    success: results.customerEmail.success || results.salesEmail.success,
    results
  };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Validate environment variables
    const missingEnvVars = [];
    if (!process.env.WC_API_KEY) missingEnvVars.push('WC_API_KEY');
    if (!process.env.WC_API_SECRET) missingEnvVars.push('WC_API_SECRET');
    if (!process.env.DATABASE_URL) missingEnvVars.push('DATABASE_URL');

    if (missingEnvVars.length > 0) {
      log('error', 'Missing environment variables', { missing: missingEnvVars });
      return NextResponse.json(
        { success: false, message: `Missing environment variables: ${missingEnvVars.join(', ')}` },
        { status: 500 }
      );
    }

    // Parse request body with error handling
    let body;
    try {
      body = await req.json();
    } catch (parseError: any) {
      log('error', 'Failed to parse request body', { error: parseError.message });
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const {
      billing,
      shipping,
      line_items,
      shipping_lines = [],
      payment_method = "bacs",
      payment_method_title = "Quote Request - Payment Link to Follow",
      customer_note,
      meta_data = [],
    } = body;

    // Validate required fields
    if (!billing?.email || !billing?.first_name || !billing?.last_name) {
      log('error', 'Missing required billing information');
      return NextResponse.json(
        { success: false, message: "Missing required billing information" },
        { status: 400 }
      );
    }

    if (!line_items || !Array.isArray(line_items) || line_items.length === 0) {
      log('error', 'Missing or invalid line items');
      return NextResponse.json(
        { success: false, message: "Missing or invalid line items" },
        { status: 400 }
      );
    }

    log('info', 'Processing quote request', { 
      itemCount: line_items.length,
      customerEmail: billing.email 
    });

    // Initialize WooCommerce API with increased timeout
    const api = new WooCommerceRestApi({
      url: "https://backend.hydroworks.co.za/wp",
      consumerKey: process.env.WC_API_KEY,
      consumerSecret: process.env.WC_API_SECRET,
      version: "wc/v3",
      timeout: 15000, // Increased timeout for serverless
    });

    // Format line items for WooCommerce with validation
    const formattedLineItems = line_items
      .map((item: any) => {
        const lineItem: any = {
          quantity: parseInt(String(item.quantity || 1)),
        };

        // Add price if provided
        if (item.price) {
          lineItem.price = parseFloat(String(item.price));
        }

        // Handle variable products (have variation_id)
        if (item.variation_id) {
          if (item.parent_id) {
            lineItem.product_id = parseInt(String(item.parent_id));
          } else {
            log('warn', 'Variation missing parent product_id', { item });
          }
          lineItem.variation_id = parseInt(String(item.variation_id));
        } else if (item.product_id) {
          // Simple products
          lineItem.product_id = parseInt(String(item.product_id));
        }

        return lineItem;
      })
      .filter((item) => item.product_id); // Remove items without product_id

    if (formattedLineItems.length === 0) {
      log('error', 'No valid line items after processing');
      return NextResponse.json(
        { success: false, message: "No valid products found in line items" },
        { status: 400 }
      );
    }

    // Prepare order data for WooCommerce
    const orderData: Record<string, any> = {
      payment_method,
      payment_method_title,
      set_paid: false,
      status: "pending",
      billing,
      shipping,
      line_items: formattedLineItems,
      shipping_lines: shipping_lines || [],
      meta_data: [
        ...meta_data,
        {
          key: "_is_quote_request",
          value: "yes",
        },
        {
          key: "_quote_request_date",
          value: new Date().toISOString(),
        },
      ],
    };

    if (customer_note) {
      orderData.customer_note = String(customer_note);
    }

    log('info', 'Formatted line items for WooCommerce', { 
      originalCount: line_items.length,
      formattedCount: formattedLineItems.length 
    });

    // Submit order to WooCommerce
    log('info', 'Submitting order to WooCommerce...');
    const { data: order } = await api.post("orders", orderData);
    log('info', 'WooCommerce order created successfully', { orderId: order.id });

    // Calculate totals for database and email
    const lineItemsTotal = line_items.reduce((sum: number, item: any) => {
      const price = parseFloat(String(item.price || '0'));
      const quantity = parseInt(String(item.quantity || 1));
      return sum + (price * quantity);
    }, 0);

    const shippingTotal = shipping_lines.reduce((sum: number, line: any) => {
      return sum + parseFloat(String(line.total || '0'));
    }, 0);

    const totalAmount = lineItemsTotal + shippingTotal;

    // Prepare quote data for database
    const quoteData = {
      woocommerce_order_id: order.id,
      customer_email: billing.email,
      customer_name: `${billing.first_name} ${billing.last_name}`.trim(),
      customer_phone: billing.phone || null,
      customer_company: billing.company || null,
      shipping_address: shipping ? `${shipping.address_1}${
        shipping.address_2 ? ", " + shipping.address_2 : ""
      }, ${shipping.city}, ${shipping.state}, ${shipping.postcode}`.trim() : null,
      billing_address: `${billing.address_1}${
        billing.address_2 ? ", " + billing.address_2 : ""
      }, ${billing.city}, ${billing.state}, ${billing.postcode}`.trim(),
      line_items: line_items, // Store original line_items with names
      shipping_total: shippingTotal.toFixed(2),
      order_total: totalAmount.toFixed(2),
      customer_note: customer_note || null,
      project_type: meta_data.find((m: any) => m.key === "_customer_project_type")?.value || "general",
      shipping_region: meta_data.find((m: any) => m.key === "_shipping_region")?.value || billing.state || "Unknown",
      estimated_fulfillment: meta_data.find((m: any) => m.key === "_estimated_fulfillment")?.value || "3-5 business days",
      meta_data: meta_data,
    };

    // Save quote to database
    log('info', 'Saving quote to database...');
    const quoteResult = await saveQuoteToDatabase(quoteData);

    // Prepare email data
    const emailData = {
      customer_email: billing.email,
      customer_name: `${billing.first_name} ${billing.last_name}`.trim(),
      phone: billing.phone || '',
      company: billing.company || '',
      full_address: `${billing.address_1}${
        billing.address_2 ? ", " + billing.address_2 : ""
      }, ${billing.city}, ${billing.state}, ${billing.postcode}`.trim(),
      customer_note: customer_note || '',
      order_id: order.id,
      order_total: totalAmount.toFixed(2),
      shipping_total: shippingTotal.toFixed(2),
      shipping_region: meta_data.find((m: any) => m.key === "_shipping_region")?.value || billing.state || "Unknown",
      line_items: line_items.map((item: any) => ({
        name: String(item.name || "Product"),
        quantity: parseInt(String(item.quantity || 1)),
        price: String(item.price || "0"),
      })),
      estimated_quote_time: meta_data.find((m: any) => m.key === "_customer_project_type")?.value === "urgent" ? "12-24 hours" : "24-48 hours",
      project_type: meta_data.find((m: any) => m.key === "_customer_project_type")?.value || "general",
    };

    // Send notification emails (don't fail the order if emails fail)
    let emailResult = { success: false, results: null };
    try {
      log('info', 'Sending notification emails...');
      emailResult = await sendQuoteRequestNotifications(emailData);
    } catch (emailError: any) {
      log('error', 'Email notifications failed', { error: emailError.message });
    }

    const processingTime = Date.now() - startTime;
    log('info', 'Quote request processing completed', {
      orderId: order.id,
      quoteSuccess: quoteResult.success,
      emailSuccess: emailResult.success,
      processingTimeMs: processingTime
    });

    return NextResponse.json({
      success: true,
      message: "Quote request submitted successfully",
      order: {
        id: order.id,
        status: order.status,
        total: order.total
      },
      quote_saved: quoteResult.success,
      database_quote_id: quoteResult.success ? quoteResult.data?.id : null,
      emails_sent: emailResult.success,
      processing_time_ms: processingTime
    });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    
    // Extract meaningful error information
    const errorDetails = {
      message: error.message || "Unknown error",
      code: error.code,
      response: error.response?.data,
      stack: error.stack?.split('\n').slice(0, 5), // Limited stack trace
      processingTimeMs: processingTime
    };

    log('error', 'Quote submission failed', errorDetails);

    // Return appropriate error response
    const statusCode = error.response?.status || (error.code?.startsWith('P') ? 500 : 500);
    const userMessage = error.response?.data?.message || 
                       (error.code?.startsWith('P') ? "Database error occurred" : "Quote request submission failed");

    return NextResponse.json(
      {
        success: false,
        message: userMessage,
        error_code: error.code || 'UNKNOWN_ERROR',
        processing_time_ms: processingTime
      },
      { status: statusCode }
    );
  }
}