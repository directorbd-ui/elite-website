const express = require('express');
const cors    = require('cors');
const { Resend } = require('resend');

const app    = express();
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(express.json());
app.use(cors({ origin: '*' }));

// ── OFFER DETAILS ─────────────────────────────────────────────────────────────
const PERKS = {
  'comp-spa': {
    code:  'ESP-COMPSP',
    label: 'Complimentary Spa (1 Hour)',
    note:  'Minimum 10-night stay. Must be claimed at check-in. Valid per room.'
  },
  'fnb-10': {
    code:  'ESP-FNB10',
    label: '10% Off Food & Beverage',
    note:  'One-time use only. Not combinable with any other promotion. Per room.'
  },
  'spa-10': {
    code:  'ESP-SPA10',
    label: '10% Off Spa Services',
    note:  'Redeemable one time only at Gaya Wellness & Spa. Per room.'
  },
  'fnb-bogo': {
    code:  'ESP-BOGO',
    label: 'Buy 1 Get 1 Free — Food & Beverage',
    note:  'Valid for one-time use only. Per room.'
  }
};

// ── SEND PROMO ENDPOINT ───────────────────────────────────────────────────────
app.post('/send-promo', async (req, res) => {
  const { email, perk } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (!PERKS[perk]) {
    return res.status(400).json({ error: 'Invalid perk selection' });
  }

  const offer = PERKS[perk];

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#F5EFE4;font-family:'Georgia',serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5EFE4;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#FDFAF5;max-width:560px;width:100%">

        <!-- Header -->
        <tr>
          <td style="background:#2A2319;padding:32px 40px;text-align:center">
            <p style="margin:0;font-family:'Georgia',serif;font-size:22px;font-weight:400;color:#FDFAF5;letter-spacing:0.08em">
              <span style="color:#B8966A">Elite</span> Suites Patong
            </p>
            <p style="margin:8px 0 0;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.5)">
              Patong Beach · Phuket, Thailand
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:44px 40px 32px">
            <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#8B6F47;font-family:'Arial',sans-serif">
              Your Exclusive Offer
            </p>
            <h1 style="margin:0 0 20px;font-family:'Georgia',serif;font-size:28px;font-weight:400;color:#2A2319;line-height:1.3">
              ${offer.label}
            </h1>
            <p style="margin:0 0 32px;font-size:14px;color:#8C7B68;line-height:1.8;font-family:'Arial',sans-serif">
              Thank you for your interest in Elite Suites Patong. Here is your exclusive promo code —
              enter it when booking direct to claim your offer.
            </p>

            <!-- Promo Code Box -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#EDE3D1;border:1px dashed #8B6F47;padding:20px;text-align:center">
                  <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#8B6F47;font-family:'Arial',sans-serif">Your Promo Code</p>
                  <p style="margin:0;font-family:'Courier New',monospace;font-size:22px;font-weight:700;color:#6B5234;letter-spacing:0.2em">${offer.code}</p>
                </td>
              </tr>
            </table>

            <!-- Terms -->
            <p style="margin:20px 0 32px;font-size:12px;color:#8C7B68;line-height:1.7;font-family:'Arial',sans-serif;border-left:2px solid #D9CBAF;padding-left:14px">
              ${offer.note}
            </p>

            <!-- CTA Button -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="https://hotels.cloudbeds.com/reservation/q4GFCr"
                     style="display:inline-block;background:#8B6F47;color:#FDFAF5;padding:14px 36px;font-family:'Arial',sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;font-weight:600">
                    Book Direct Now
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#EDE3D1;padding:24px 40px;text-align:center;border-top:1px solid #D9CBAF">
            <p style="margin:0 0 6px;font-size:11px;color:#8C7B68;font-family:'Arial',sans-serif">
              201 Phangmuang Sai Gor Road, Pa Tong, Kathu District, Phuket 83150, Thailand
            </p>
            <p style="margin:0;font-size:11px;color:#8C7B68;font-family:'Arial',sans-serif">
              <a href="tel:+660805428245" style="color:#8B6F47;text-decoration:none">+66 (0) 80 542 8245</a>
              &nbsp;·&nbsp;
              <a href="mailto:reservations@elitesuitespatong.com" style="color:#8B6F47;text-decoration:none">reservations@elitesuitespatong.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
    `;

  try {
    const { error } = await resend.emails.send({
      from: 'Elite Suites Patong <director.bd@elitesuitespatong.com>',
      to:   email,
      subject: 'Your Exclusive Promo Code — Elite Suites Patong',
      html:  emailHtml
    });
    if(error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: error.message });
    }
    console.log(`Email sent to ${email} — perk: ${perk}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Send error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'Elite Suites mailer running' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Mailer listening on port ${PORT}`));
