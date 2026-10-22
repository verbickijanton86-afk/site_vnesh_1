// Cloudflare Worker: принимает анкету с сайта и пересылает её в Telegram.
// Токен бота и ID получателя хранятся в секретах Cloudflare (TELEGRAM_BOT_TOKEN,
// TELEGRAM_CHAT_ID) и в код сайта не попадают. Остальные запросы отдают файлы сайта.

const MAX = { name: 50, username: 64, socials: 1000, channel: 100, source: 100 };

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function clean(value, max) {
  return String(value ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);
}

async function handleApplication(request, env) {
  if (request.method !== "POST") return json({ ok: false, error: "method" }, 405);

  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) return json({ ok: false, error: "origin" }, 403);

  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return json({ ok: false, error: "not_configured" }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "bad_json" }, 400);
  }

  if (body.ageConfirmed !== true) return json({ ok: false, error: "age" }, 400);
  if (body.consent !== true) return json({ ok: false, error: "consent" }, 400);

  const name = clean(body.name, MAX.name);
  const username = clean(body.username, MAX.username);
  const socials = clean(body.socials, MAX.socials);
  const channel = clean(body.channel, MAX.channel);
  const source = clean(body.source, MAX.source);
  if (!name || !username || !socials) return json({ ok: false, error: "empty" }, 400);

  const time = new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });
  const text = [
    "Новая анкета AUVIX",
    "",
    `Имя: ${name}`,
    `Юзернейм: ${username}`,
    `Соцсети: ${socials}`,
    `Где рекомендует: ${channel || "не указано"}`,
    `Откуда узнал(а) об AUVIX: ${source || "не указано"}`,
    "Возраст: 18+ (подтверждено)",
    "Согласие на передачу данных: да",
    `Время (МСК): ${time}`,
  ].join("\n");

  // TELEGRAM_CHAT_ID может содержать несколько ID через запятую.
  const chatIds = String(env.TELEGRAM_CHAT_ID).split(",").map((x) => x.trim()).filter(Boolean);
  const results = await Promise.all(
    chatIds.map(async (chat_id) => {
      try {
        const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id, text, disable_web_page_preview: true }),
        });
        if (r.ok) return { ok: true };
        let description = "";
        try {
          description = String((await r.json()).description || "");
        } catch {}
        return { ok: false, status: r.status, description };
      } catch {
        return { ok: false, status: 0, description: "network" };
      }
    }),
  );

  if (!results.some((x) => x.ok)) {
    const first = results[0] || {};
    // Описание ошибки Telegram не содержит токена, его можно показать.
    return json({ ok: false, error: "telegram", status: first.status, detail: first.description }, 502);
  }
  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/application") return handleApplication(request, env);
    return env.ASSETS.fetch(request);
  },
};
