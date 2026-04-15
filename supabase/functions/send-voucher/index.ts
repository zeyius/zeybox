import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { jsPDF } from "https://esm.sh/jspdf@2.5.1"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

serve(async (req) => {
  try {
    const { record } = await req.json()
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    
    // 1. Initialize Supabase to fetch the generated voucher
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Wait a tiny moment for the trigger to finish inserting the voucher
    await new Promise(resolve => setTimeout(resolve, 500));

    const { data: voucher } = await supabase
      .from('vouchers')
      .select('voucher_code')
      .eq('order_id', record.id)
      .single()

    const displayCode = voucher?.voucher_code || `ZBX-${record.id.slice(0, 8).toUpperCase()}`;

    // 2. Generate the PDF Voucher
    const doc = new jsPDF()
    
    // Aesthetic Header
    doc.setFillColor(0, 0, 0)
    doc.rect(0, 0, 210, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(30)
    doc.text("ZEYBOX", 105, 25, { align: "center" })

    // Voucher Content
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(22)
    doc.text("OFFICIAL GIFT VOUCHER", 105, 60, { align: "center" })
    
    doc.setDrawColor(250, 204, 21)
    doc.setLineWidth(1.5)
    doc.line(70, 65, 140, 65)

    doc.setFontSize(14)
    doc.setFont("helvetica", "normal")
    doc.text(`Recipient: ${record.recipient_name}`, 105, 85, { align: "center" })
    doc.text(`From: ${record.buyer_name}`, 105, 95, { align: "center" })

    doc.setFont("helvetica", "bold")
    doc.setFontSize(22)
    doc.text(`CODE: ${displayCode}`, 105, 120, { align: "center" })

    const pdfBase64 = doc.output("datauristring").split(',')[1]

    // 3. Send via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Zeybox <onboarding@resend.dev>',
        to: [record.recipient_email || record.buyer_email],
        subject: `🎁 A special gift for you: ${record.recipient_name}!`,
        html: `
          <div style="background-color: #ffffff; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f3f4f6; border-radius: 40px; overflow: hidden; color: #000000;">
            <div style="background-color: #000000; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; text-transform: uppercase; font-style: italic; letter-spacing: -2px; margin: 0; font-size: 32px; font-weight: 900;">ZEYBOX</h1>
              <div style="height: 4px; width: 40px; background-color: #facc15; margin: 15px auto; border-radius: 10px;"></div>
            </div>
            <div style="padding: 40px; text-align: center;">
              <h2 style="font-size: 26px; font-weight: 900; margin-top: 0;">YOUR PORTAL IS OPEN</h2>
              <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
                Hello <strong>${record.recipient_name}</strong>, <br/>
                ${record.buyer_name} has sent you a ZEYBOX gift! Your unique experience code is <strong>${displayCode}</strong>.
              </p>
              <div style="margin: 30px 0; background-color: #f9fafb; border-radius: 30px; padding: 30px; text-align: left;">
                <h3 style="font-size: 14px; font-weight: 900; text-transform: uppercase; margin-bottom: 15px;">How to Redeem:</h3>
                <ol style="color: #4b5563; font-size: 14px; line-height: 1.8;">
                  <li>Go to <strong>zeybox.com/voucher</strong>.</li>
                  <li>Enter your code <strong>${displayCode}</strong>.</li>
                  <li>Choose your preferred partner/location from the list.</li>
                </ol>
              </div>
            </div>
          </div>
        `,
        attachments: [{ content: pdfBase64, filename: 'Zeybox_Voucher.pdf' }],
      }),
    })

    const responseData = await res.json()
    return new Response(JSON.stringify(responseData), { headers: { 'Content-Type': 'application/json' } })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})