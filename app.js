// Плавно скрываем экран запуска после загрузки страницы.
window.addEventListener("load", () => {
  const finishIntro = () => { document.body.classList.remove("is-loading"); document.body.classList.add("is-loaded"); };
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) finishIntro();
  else window.setTimeout(finishIntro, 1450);
});

"use strict";

// Вспомогательный поиск: $("#имя") находит элемент по id, $(".класс") — по классу.
const $ = (s) => document.querySelector(s);

// 1. КАТАЛОГ БАНКОВ
// Данные берём из config.js; ниже — вывод карточек, поиск и фильтры.
const offers = window.FLOW_OFFERS;
let category = "all";
function renderOffers() {
  const query = $("#search").value.trim().toLocaleLowerCase("ru");
  const visible = offers.filter(
    (o) =>
      (category === "all" || o.category === category) &&
      o.name.toLocaleLowerCase("ru").includes(query),
  );
  $("#offer-grid").innerHTML = visible
    .map(
      (o) => /* HTML */ `
        <article
          class="offer-card"
          style="--bank:${o.color};--brand:${o.brand || o.color}"
        >
          <div class="card-top">
            <span class="bank-icon ${o.className}" aria-hidden="true">
              ${o.mark}
            </span>
            <strong>${o.name}</strong>
            <span class="card-category">${o.type}</span>
          </div>
          <div class="card-visual" aria-hidden="true">
            <div class="credit-card ${o.className}">
              <b>${o.name}</b>
              <span class="card-chip"></span>
              <span class="card-mir">МИР</span>
            </div>
          </div>
          <h3>${o.title}</h3>
          <p>${o.description}</p>
          <div class="card-bottom">
            <div>
              <small>Вознаграждение</small>
              <strong>По условиям программы</strong>
            </div>
            <button
              class="round-button"
              data-offer="${o.id}"
              aria-label="Подробнее: ${o.name}"
            >
              ↗
            </button>
          </div>
        </article>
      `,
    )
    .join("");
  $("#empty-state").hidden = visible.length > 0;
}
document.querySelectorAll(".filter").forEach((button) =>
  button.addEventListener("click", () => {
    category = button.dataset.filter;
    document.querySelectorAll(".filter").forEach((b) => {
      b.classList.toggle("active", b === button);
      b.setAttribute("aria-pressed", String(b === button));
    });
    renderOffers();
  }),
);
$("#search").addEventListener("input", renderOffers);
renderOffers();

// 2. КАЛЬКУЛЯТОР
// Доход = число рекомендаций × фиксированное вознаграждение (менять можно только здесь).
const REWARD = 25000;
const money = new Intl.NumberFormat("ru-RU");
function calculate() {
  const count = Number($("#referrals").value);
  $("#count-output").value = count;
  $("#income").innerHTML = money.format(count * REWARD) + " <small>₽</small>";
}
$("#referrals").addEventListener("input", calculate);
calculate();

// 3. ВСПЛЫВАЮЩИЕ ОКНА
// show открывает окно, close закрывает его и возвращает фокус на кнопку.
const modal = $("#modal");
let lastTrigger = null;
function show(content) {
  lastTrigger = document.activeElement;
  $("#modal-content").innerHTML = content;
  if (!modal.open) modal.showModal();
}
function close() {
  modal.close();
  lastTrigger?.focus();
}
$(".close-modal").addEventListener("click", close);
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    const r = modal.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      close();
  }
});

// 4. ДЕМО-КАБИНЕТ
// Профиль хранится только в браузере, а не на сервере.
// Ключ flow-demo-profile оставлен для совместимости с сохранёнными профилями.
function getProfile() {
  try {
    return JSON.parse(localStorage.getItem("flow-demo-profile"));
  } catch {
    return null;
  }
}

// Пользовательское имя преобразуется в безопасный текст перед вставкой в HTML.
function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}

// Сначала показываем кабинет, если профиль уже есть. Иначе — форму знакомства.
// Тексты и поля обоих экранов можно менять в HTML-шаблонах ниже.
function join() {
  const profile = getProfile();
  if (profile) {
    show(/* HTML */ `
      <div class="modal-kicker">auvix / ПРОФИЛЬ</div>
      <h2 class="modal-title">На связи, ${escapeHtml(profile.name)}.</h2>
      <div class="modal-status">Профиль сохранён в этом браузере</div>
      <p class="modal-copy">Юзернейм: <strong>${escapeHtml(profile.username || "не указан")}</strong></p>
      <p class="modal-copy">Соцсети: <strong>${escapeHtml(profile.socials || "не указаны")}</strong></p>
      <p class="modal-copy">Выбранный канал: <strong>${escapeHtml(profile.channel)}</strong></p>
      <p class="modal-copy">Источник знакомства: <strong>${escapeHtml(profile.source || "не указан")}</strong></p>
      <p class="modal-copy">Это профиль на сайте AUVIX, не регистрация в банке.</p>
      <button class="button green" id="go-catalog">Выбрать предложение <span>↗</span></button>
      <br /><button class="modal-secondary" id="reset-profile">Изменить анкету</button>
    `);
    $("#go-catalog").onclick = () => { close(); $("#offers").scrollIntoView({ behavior: "smooth" }); };
    $("#reset-profile").onclick = () => { try { localStorage.removeItem("flow-demo-profile"); } catch {} join(); };
    return;
  }
  show(/* HTML */ `
    <div class="modal-kicker">auvix / АНКЕТА УЧАСТНИКА</div>
    <h2 class="modal-title">Начнём знакомство.</h2>
    <p class="modal-copy">Заполни анкету. Если тебе меньше 18 лет, продолжить нельзя.</p>
    <form class="modal-form" id="join-form">
      <label for="partner-age">Тебе уже есть 18 лет?</label>
      <select id="partner-age" name="ageConfirmed" required>
        <option value="" selected disabled>Выбери ответ</option>
        <option value="yes">Да, мне 18 лет или больше</option>
        <option value="no">Нет, мне меньше 18 лет</option>
      </select>
      <p class="modal-copy age-blocked" id="age-blocked" role="alert" hidden>К сожалению, участникам младше 18 лет нельзя продолжить заполнение анкеты.</p>
      <div id="application-fields">
        <label for="partner-name">Имя</label>
        <input id="partner-name" name="name" placeholder="Как к тебе обращаться" maxlength="50" autocomplete="given-name" required />
        <label for="partner-username">Юзернейм</label>
        <input id="partner-username" name="username" placeholder="@username" maxlength="64" autocomplete="nickname" required />
        <label for="partner-socials">Ссылки на социальные сети</label>
        <textarea id="partner-socials" name="socials" placeholder="Telegram, TikTok, YouTube или другие ссылки" maxlength="1000" rows="3" required></textarea>
        <label for="partner-channel">Где планируешь рекомендовать?</label>
        <select id="partner-channel" name="channel">
          <option>Друзьям и знакомым</option><option>В Telegram-канале</option><option>В блоге или соцсетях</option><option>На своём сайте</option><option>В команде или агентстве</option>
        </select>
        <label for="partner-source">Откуда ты узнал(а) об AUVIX?</label>
        <select id="partner-source" name="source" required>
          <option value="" selected disabled>Выбери источник</option>
          <option value="Социальные сети">Социальные сети (TikTok, Instagram и др.)</option>
          <option value="Telegram-канал">Telegram-канал</option>
          <option value="Telegram-чаты">Telegram-чаты</option>
          <option value="Друзья или знакомые">Друзья или знакомые</option>
          <option value="YouTube">YouTube</option>
          <option value="Поиск в интернете">Поиск в интернете</option>
          <option value="Реклама">Реклама</option>
          <option value="Другое">Другое</option>
        </select>
        <label class="consent-row"><input type="checkbox" id="partner-consent" required /> Я согласен(на) на отправку этих данных владельцу сайта для рассмотрения заявки.</label>
        <button class="button green" type="submit" id="submit-application">Отправить анкету <span>↗</span></button>
      </div>
      <p class="modal-copy" id="storage-error" role="status" aria-live="polite"></p>
    </form>
  `);
  const age = $("#partner-age"), fields = $("#application-fields"), blocked = $("#age-blocked");
  function updateAge() {
    const allowed = age.value === "yes";
    fields.hidden = !allowed;
    blocked.hidden = age.value !== "no";
    fields.querySelectorAll("input, textarea, select, button").forEach(el => {
      if (el.id !== "partner-consent") el.disabled = !allowed;
    });
    if (!allowed) $("#storage-error").textContent = "";
  }
  age.addEventListener("change", updateAge);
  updateAge();
  $("#join-form").onsubmit = async (e) => {
    e.preventDefault();
    if (age.value !== "yes") { updateAge(); return; }
    const name = $("#partner-name").value.trim();
    const username = $("#partner-username").value.trim();
    const socials = $("#partner-socials").value.trim();
    const channel = $("#partner-channel").value;
    const source = $("#partner-source").value;
    const status = $("#storage-error");
    if (!name || !username || !socials || !source) { status.textContent = "Заполни все обязательные поля."; return; }
    const submit = $("#submit-application");
    submit.disabled = true; submit.querySelector("span").textContent = "…";
    status.textContent = "Отправляем анкету…";
    // Анкета уходит на /api/application (файл worker.js), а он пересылает её в Telegram.
    const payload = { name, username, socials, channel, source, ageConfirmed: true, consent: true };
    try {
      const response = await fetch("/api/application", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      let result = {};
      try { result = await response.json(); } catch {}
      if (!response.ok || !result.ok) throw new Error(result.error || "send_failed");
      try { localStorage.setItem("flow-demo-profile", JSON.stringify({ name, username, socials, channel, source, ageConfirmed: true })); } catch {}
      status.textContent = "Анкета отправлена! Мы свяжемся с тобой.";
      submit.hidden = true;
    } catch (error) {
      status.textContent = "Не удалось отправить анкету. Проверь подключение к интернету и попробуй позже.";
      submit.disabled = false; submit.querySelector("span").textContent = "↗";
    }
  };
}

document
  .querySelectorAll("[data-join]")
  .forEach((b) => b.addEventListener("click", join));

// 5. ОКНО ВЫБРАННОГО БАНКА
// Кнопка на карточке открывает описание и ссылку из config.js.
$("#offer-grid").addEventListener("click", (e) => {
  const b = e.target.closest("[data-offer]");
  if (!b) return;
  const o = offers.find((o) => o.id === b.dataset.offer);
  show(/* HTML */ `
    <div class="modal-kicker">auvix / КАТАЛОГ ПРОГРАММ</div>
    <div
      class="bank-icon ${o.className}"
      style="--bank:${o.color};margin-bottom:20px"
    >
      ${o.mark}
    </div>
    <h2 class="modal-title">${o.name}</h2>
    <p class="modal-copy">${o.description}</p>
    <div class="modal-details">
      <span>Категория в макете</span>
      <strong>${o.type}</strong>
    </div>
    <ol class="modal-list">
      <li>Проверь наличие и условия программы на сайте банка.</li>
      <li>Подключись к программе и получи личную ссылку.</li>
      <li>Сверь условия вознаграждения перед рекомендацией.</li>
    </ol>
    <p class="modal-copy">
      ${o.referralUrl ? "Реферальная ссылка добавлена владельцем сайта. Условия проверяйте у банка." : "Реферальная программа ещё не подключена к auvix. Условия и суммы выплат в макете не заявлены."}
    </p>
    <div class="modal-links">
      <a
        class="button green"
        href="${o.referralUrl || o.url}"
        target="_blank"
        rel="noopener noreferrer"
      >
        ${o.referralUrl ? "Перейти к предложению" : "На сайт банка"}
        <span>↗</span>
      </a>
      <button class="button dark" id="detail-join">Мой профиль</button>
    </div>
  `);
  $("#detail-join").onclick = join;
});

// 6. МОБИЛЬНОЕ МЕНЮ
// Переключаем класс menu-open, который раскрывает меню в CSS.
$(".menu-button").addEventListener("click", () => {
  const open = $(".header").classList.toggle("menu-open");
  $(".menu-button").setAttribute("aria-expanded", String(open));
  $(".menu-button").setAttribute(
    "aria-label",
    open ? "Закрыть меню" : "Открыть меню",
  );
});
document.querySelectorAll(".header nav a").forEach((a) =>
  a.addEventListener("click", () => {
    $(".header").classList.remove("menu-open");
    $(".menu-button").setAttribute("aria-expanded", "false");
    $(".menu-button").setAttribute("aria-label", "Открыть меню");
  }),
);

// 7. КАРУСЕЛЬ КАРТХОЛДЕРОВ
// Наведение, свайпы, кнопки и стрелки клавиатуры.
const holderCards = [...document.querySelectorAll("[data-holder]")];
const holderDots = [...document.querySelectorAll("[data-slide]")];
const holderStage = document.querySelector(".holder-stage");
let selectedHolder = 1;

// Выбор по номеру: 0 — INITIATE, 1 — PARTNER, 2 — APEX.
function selectHolder(index) {
  selectedHolder = (index + holderCards.length) % holderCards.length;
  holderCards.forEach((card, i) => {
    let offset = i - selectedHolder;
    if (offset > 1) offset -= holderCards.length;
    if (offset < -1) offset += holderCards.length;
    card.style.setProperty("--offset", offset);
    card.classList.toggle("is-active", i === selectedHolder);
    card.setAttribute("aria-pressed", String(i === selectedHolder));
  });
  holderDots.forEach((dot, i) => {
    dot.classList.toggle("active", i === selectedHolder);
    dot.setAttribute("aria-pressed", String(i === selectedHolder));
  });
  document.querySelector("#holder-counter").textContent =
    String(selectedHolder + 1).padStart(2, "0") + " / 03";
}

// Начало жеста. Для перелистывания нужно провести горизонтально более 35 пикселей.
let swipeStart = null;
let suppressHolderClick = false;
holderStage.addEventListener("pointerdown", (e) => {
  swipeStart = { x: e.clientX, y: e.clientY };
  suppressHolderClick = false;
});
holderStage.addEventListener("pointerup", (e) => {
  if (!swipeStart) return;
  const dx = e.clientX - swipeStart.x,
    dy = e.clientY - swipeStart.y;
  swipeStart = null;
  if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
    selectHolder(selectedHolder + (dx < 0 ? 1 : -1));
    suppressHolderClick = true;
  }
});
holderStage.addEventListener("pointercancel", () => {
  swipeStart = null;
});
holderCards.forEach((card, i) => {
  card.addEventListener("pointerenter", (e) => {
    if (
      !swipeStart &&
      e.pointerType === "mouse" &&
      matchMedia("(min-width: 601px) and (hover: hover)").matches
    )
      selectHolder(i);
  });
  card.addEventListener("focus", () => {
    if (card.matches(":focus-visible")) selectHolder(i);
  });
  card.addEventListener("click", () => {
    if (suppressHolderClick) {
      suppressHolderClick = false;
      return;
    }
    selectHolder(i);
  });
});
holderDots.forEach((dot, i) =>
  dot.addEventListener("click", () => selectHolder(i)),
);
document
  .querySelector("#holder-prev")
  .addEventListener("click", () => selectHolder(selectedHolder - 1));
document
  .querySelector("#holder-next")
  .addEventListener("click", () => selectHolder(selectedHolder + 1));
holderStage.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    e.preventDefault();
    selectHolder(selectedHolder + (e.key === "ArrowRight" ? 1 : -1));
  }
});
selectHolder(1);
