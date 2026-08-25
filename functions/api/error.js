export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    
    const token = env.TELEGRAM_BOT_TOKEN;
    const chatId = env.TELEGRAM_CHAT_ID;
    
    if (!token || !chatId) {
      console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in environment.");
      return new Response(null, { status: 204 });
    }

    const escapeHtml = (unsafe) => {
      return (unsafe || '').toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const message = `
<b>🚨 Storefront Error</b>
<b>URL:</b> ${escapeHtml(body.url)}
<b>Message:</b> ${escapeHtml(body.message)}
<b>Source:</b> ${escapeHtml(body.source)}:${body.line}:${body.col}
<b>Stack:</b>
<pre>${escapeHtml(body.stack)}</pre>
<b>UA:</b> ${escapeHtml(body.ua)}
<b>Time:</b> ${escapeHtml(body.ts)}
    `.trim();

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const tgRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' })
    });

    if (!tgRes.ok) {
      console.error(`Telegram API error: ${tgRes.status} ${tgRes.statusText}`);
      const text = await tgRes.text();
      console.error(`Telegram response: ${text}`);
    } else {
      console.log("Successfully sent error to Telegram.");
    }

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("Cloudflare Function error:", err);
    return new Response(null, { status: 204 });
  }
}
