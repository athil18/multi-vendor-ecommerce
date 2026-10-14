/**
 * Transactional Email Templates for Nexus Multi-Vendor E-Commerce
 * 
 * @agent design-brand-guardian
 * @agent engineering-backend-architect
 */

export interface EmailOrderDetails {
  orderId: string;
  totalAmount: number;
  customerName?: string;
  items?: Array<{ name: string; quantity: number; price: number }>;
}

export function orderConfirmationTemplate(details: EmailOrderDetails): { subject: string; html: string; text: string } {
  const customer = details.customerName || 'Valued Customer';
  const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? 'https://nexus-marketplace.com' : 'http://localhost:3000')}/customer/orders/${details.orderId}`;
  
  const itemsHtml = details.items && details.items.length > 0
    ? details.items.map(item => `
      <tr style="border-bottom: 1px solid #27272a;">
        <td style="padding: 12px 0; color: #f4f4f5; font-size: 14px;">${item.name}</td>
        <td style="padding: 12px 0; text-align: center; color: #a1a1aa; font-size: 14px;">${item.quantity}</td>
        <td style="padding: 12px 0; text-align: right; color: #f4f4f5; font-size: 14px; font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('')
    : `<tr><td colspan="3" style="padding: 12px 0; color: #a1a1aa; font-size: 14px;">Specimens order confirmed</td></tr>`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Order Confirmation - Nexus</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #09090b; }
        .card { background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { text-align: center; margin-bottom: 28px; }
        .logo { font-size: 22px; font-weight: 900; letter-spacing: -0.04em; color: #ffffff; text-transform: uppercase; }
        .badge { display: inline-block; background-color: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; margin-top: 10px; }
        .title { font-size: 20px; font-weight: 800; margin-top: 16px; margin-bottom: 8px; color: #ffffff; }
        .summary-table { width: 100%; border-collapse: collapse; margin-top: 24px; margin-bottom: 24px; }
        .total-box { display: flex; justify-content: space-between; border-top: 2px solid #27272a; padding-top: 16px; margin-top: 16px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 9999px; margin-top: 20px; text-align: center; }
        .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #71717a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <div class="logo">NEXUS MARKETPLACE</div>
            <div class="badge">Escrow Secured Order</div>
            <h1 class="title">Acquisition Confirmed</h1>
            <p style="color: #a1a1aa; font-size: 14px; margin: 0;">Order Reference: <strong>${details.orderId}</strong></p>
          </div>

          <p style="font-size: 14px; color: #d4d4d8; line-height: 1.6;">
            Greetings <strong>${customer}</strong>,<br>
            Your acquisition has been confirmed and placed into cryptographic escrow settlement. The vendor atelier is preparing your dispatch.
          </p>

          <table class="summary-table">
            <thead>
              <tr style="border-bottom: 1px solid #3f3f46; text-align: left; font-size: 12px; color: #71717a; text-transform: uppercase;">
                <th style="padding-bottom: 8px;">Specimen</th>
                <th style="padding-bottom: 8px; text-align: center;">Qty</th>
                <th style="padding-bottom: 8px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="border-top: 1px solid #3f3f46; padding-top: 14px; text-align: right;">
            <p style="font-size: 13px; color: #a1a1aa; margin: 0 0 6px 0;">Total Settlement:</p>
            <p style="font-size: 24px; font-weight: 900; color: #ffffff; margin: 0;">$${details.totalAmount.toFixed(2)}</p>
          </div>

          <div style="text-align: center; margin-top: 28px;">
            <a href="${orderUrl}" class="btn">Inspect Order Status & Tracking</a>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Nexus Marketplace Directorate. All rights reserved.</p>
          <p>This is a mandatory transactional receipt regarding your verified order #${details.orderId}.</p>
          <p style="font-size: 11px; color: #52525b; margin-top: 8px;">
            To manage optional marketing preferences or opt out of promotional newsletters, visit <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://nexus-marketplace.com'}/unsubscribe" style="color: #a1a1aa; text-decoration: underline;">Marketing Preferences</a>.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
NEXUS MARKETPLACE: Order Confirmation
Order ID: ${details.orderId}
Total: $${details.totalAmount.toFixed(2)}

Greetings ${customer},
Your acquisition has been confirmed and placed into escrow.
Track your order here: ${orderUrl}

Thank you for choosing Nexus.
(Mandatory transactional notification regarding order #${details.orderId})
  `.trim();

  return {
    subject: `Acquisition Confirmed: #${details.orderId.substring(0, 8)} - Nexus Marketplace`,
    html,
    text,
  };
}

export function passwordResetTemplate(resetUrl: string, customerName?: string): { subject: string; html: string; text: string } {
  const customer = customerName || 'Nexus Member';
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Reset Your Password - Nexus</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 0; }
        .container { max-width: 540px; margin: 0 auto; padding: 40px 20px; }
        .card { background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px; text-align: center; }
        .btn { display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 9999px; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <h2 style="margin: 0 0 16px 0; color: #ffffff;">Password Recovery Request</h2>
          <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">
            Hello ${customer},<br>
            We received a request to reset your Nexus account credentials. Click the button below to establish a new password. This link will expire in 60 minutes.
          </p>
          <a href="${resetUrl}" class="btn">Establish New Credentials</a>
          <p style="color: #71717a; font-size: 12px; margin-top: 24px;">
            If you did not initiate this request, you may safely disregard this communication.
          </p>
        </div>
        <p style="text-align: center; font-size: 11px; color: #52525b; margin-top: 24px;">
          Mandatory security notification dispatched per account authentication standards.
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
NEXUS MARKETPLACE: Password Recovery
Hello ${customer},
To reset your password, visit the following URL:
${resetUrl}

This link is valid for 60 minutes.
  `.trim();

  return {
    subject: 'Security Notice: Reset Your Nexus Credentials',
    html,
    text,
  };
}

export function welcomeEmailTemplate(customerName: string): { subject: string; html: string; text: string } {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? 'https://nexus-marketplace.com' : 'http://localhost:3000');
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Welcome to Nexus</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 0; }
        .container { max-width: 540px; margin: 0 auto; padding: 40px 20px; }
        .card { background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px; text-align: center; }
        .btn { display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 9999px; margin-top: 24px; }
        .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #71717a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <h2 style="margin: 0 0 16px 0; color: #ffffff;">Welcome to Nexus Marketplace</h2>
          <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">
            Hello <strong>${customerName}</strong>,<br>
            Your account is now activated. Explore curated specimens, connect directly with global ateliers, and enjoy zero-risk escrow protection on every transaction.
          </p>
          <a href="${appUrl}/products" class="btn">Explore Atelier Catalog</a>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Nexus Marketplace. All rights reserved.</p>
          <p style="font-size: 11px; color: #52525b;">
            Manage marketing preferences: <a href="${appUrl}/unsubscribe" style="color: #a1a1aa; text-decoration: underline;">Unsubscribe from marketing</a>.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Welcome to Nexus Marketplace, ${customerName}!
Your account has been successfully created.
Explore the catalog: ${appUrl}/products

Unsubscribe from marketing updates: ${appUrl}/unsubscribe
  `.trim();

  return {
    subject: 'Welcome to Nexus Multi-Vendor Marketplace',
    html,
    text,
  };
}

export function marketingNewsletterTemplate(
  email: string,
  dropTitle: string,
  dropSnippet: string,
  actionUrl: string
): { subject: string; html: string; text: string } {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? 'https://nexus-marketplace.com' : 'http://localhost:3000');
  const unsubscribeUrl = `${appUrl}/unsubscribe?email=${encodeURIComponent(email)}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${dropTitle} - Nexus Atelier Drops</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 0 auto; padding: 40px 20px; }
        .card { background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px; text-align: center; }
        .btn { display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 9999px; margin-top: 24px; }
        .footer { text-align: center; margin-top: 28px; font-size: 12px; color: #71717a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <p style="font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: #818cf8; text-transform: uppercase;">Nexus Atelier Drops</p>
          <h2 style="margin: 8px 0 16px 0; color: #ffffff; font-size: 22px;">${dropTitle}</h2>
          <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">${dropSnippet}</p>
          <a href="${actionUrl}" class="btn">Inspect Curated Drop</a>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Nexus Marketplace. You are receiving this marketing communication because you consented to newsletter drops.</p>
          <p>
            <a href="${unsubscribeUrl}" style="color: #e4e4e7; text-decoration: underline; font-weight: 600;">1-Click Unsubscribe from Marketing Emails</a>
            &nbsp;•&nbsp;
            <a href="${appUrl}/privacy" style="color: #a1a1aa; text-decoration: underline;">Privacy Policy</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
NEXUS ATELIER DROPS: ${dropTitle}

${dropSnippet}
View Drop: ${actionUrl}

To unsubscribe from marketing emails instantly, visit:
${unsubscribeUrl}
  `.trim();

  return {
    subject: `Curated Drop: ${dropTitle} - Nexus Marketplace`,
    html,
    text,
  };
}
