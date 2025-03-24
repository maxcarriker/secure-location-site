import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Parse form data from x-www-form-urlencoded
  const body = await parseFormData(req);
  const { name, email, message } = body;

  try {
    await resend.emails.send({
      from: 'Website Message Box <noreply@message.maxcarriker.me>',
      to: 'maxcarriker@gmail.com',
      subject: `📬 New Message from ${name}`,
      html: buildEmailHTML(name, email, message)
    });

    // Send confirmation to user if they included their email
    if (email) {
        await resend.emails.send({
        from: 'Message Box <noreply@message.maxcarriker.me>',
        to: email,
        subject: '✅ Got your message!',
        html: `
            <div style="font-family: sans-serif; padding: 1.5rem; background: #f9f9f9; border-radius: 8px;">
            <h2 style="margin-top: 0;">Thanks for your message, ${name || 'friend'}!</h2>
            <p>Here's what you sent:</p>
            <div style="white-space: pre-wrap; padding: 0.75rem; background: #fff; border: 1px solid #ccc; border-radius: 6px;">
                ${message.replace(/\n/g, '<br>')}
            </div>
            <p style="margin-top: 1rem;">I'll take a look soon :)</p>
            </div>
        `
        });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
}

// Parse form-urlencoded data
async function parseFormData(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => raw += chunk);
    req.on('end', () => {
      const parsed = Object.fromEntries(
        raw.split('&').map(pair => {
          const [key, value] = pair.split('=').map(decodeURIComponent);
          return [key, value.replace(/\+/g, ' ')];
        })
      );
      resolve(parsed);
    });
  });
}

// Build a clean, styled email
function buildEmailHTML(name, email, message) {
  return `
    <div style="font-family: sans-serif; padding: 1.5rem; background: #f9f9f9; border-radius: 8px;">
      <h2 style="margin-top: 0;">📬 New Message from ${name}</h2>
      ${email ? `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
      <p><strong>Message:</strong></p>
      <div style="white-space: pre-wrap; padding: 0.75rem; background: #fff; border: 1px solid #ccc; border-radius: 6px;">
        ${message.replace(/\n/g, '<br>')}
      </div>
    </div>
  `;
}
