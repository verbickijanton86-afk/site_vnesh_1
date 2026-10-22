/**
 * КАТАЛОГ БАНКОВ — данные для карточек сайта.
 *
 * Один блок { ... } = одно предложение банка.
 * Добавить банк: скопируйте блок и задайте новый уникальный id.
 * Убрать банк: удалите целый блок и запятую после него.
 *
 * id          — внутреннее уникальное имя.
 * name        — название банка на сайте.
 * mark        — символ в значке банка.
 * color       — оттенок серого в формате #RRGGBB (карта в спокойном состоянии).
 * brand       — фирменный цвет банка: карта окрашивается в него при наведении.
 * className   — CSS-класс значка; обычно совпадает с id.
 * category    — cards (карты) или business (для бизнеса).
 * type        — название категории для посетителя.
 * title       — заголовок карточки.
 * description — описание карточки.
 * url         — основной сайт банка.
 * referralUrl — ваша реферальная ссылка в кавычках; null, если её нет.
 *
 * Пример: referralUrl: "https://example.com/your-link"
 * Сохраняйте кавычки вокруг текстов и запятые между полями.
 */

// Заполните referralUrl своей реферальной ссылкой после подключения программы.
// Каталог демонстрационный; категории и описания можно менять под условия договора.
window.FLOW_OFFERS = [
  {
    id: "vtb",
    name: "ВТБ",
    mark: "▰",
    color: "#797979",
    brand: "#0a2896",
    className: "vtb",
    category: "cards",
    type: "Дебетовые карты",
    title: "Начни с повседневного",
    description: "Банковская карта для привычных покупок и ежедневных планов.",
    url: "https://www.vtb.ru/",
    referralUrl: null,
  },
  {
    id: "tbank",
    name: "Т-Банк",
    mark: "Т",
    color: "#aeaeae",
    brand: "#ffdd2d",
    className: "tbank",
    category: "cards",
    type: "Дебетовые карты",
    title: "Рекомендуй удобство",
    description:
      "Знакомый цифровой банк — повод поделиться своей рекомендацией.",
    url: "https://www.tbank.ru/",
    referralUrl: null,
  },
  {
    id: "sber",
    name: "Сбер",
    mark: "✓",
    color: "#7e7e7e",
    brand: "#21a038",
    className: "sber",
    category: "cards",
    type: "Дебетовые карты",
    title: "Возможности рядом",
    description:
      "Помоги знакомым выбрать банковский продукт для повседневной жизни.",
    url: "https://www.sberbank.ru/",
    referralUrl: null,
  },
  {
    id: "alfa",
    name: "Альфа-Банк",
    mark: "А",
    color: "#747474",
    brand: "#ef3124",
    className: "alfa",
    category: "business",
    type: "Для бизнеса",
    title: "Для тех, кто делает",
    description: "Решения для предпринимателей и тех, кто запускает своё дело.",
    url: "https://alfabank.ru/",
    referralUrl: null,
  },
  {
    id: "gazprom",
    name: "Газпромбанк",
    mark: "Г",
    color: "#848484",
    brand: "#1a5fb4",
    className: "gazprom",
    category: "cards",
    type: "Дебетовые карты",
    title: "Больше выбора",
    description:
      "Ещё одна возможность найти подходящий продукт для своей аудитории.",
    url: "https://www.gazprombank.ru/",
    referralUrl: null,
  },
  {
    id: "sovcom",
    name: "Совкомбанк",
    mark: "С",
    color: "#868686",
    brand: "#e53935",
    className: "sovcom",
    category: "business",
    type: "Для бизнеса",
    title: "Новый шаг для дела",
    description:
      "Знакомь предпринимателей с банковскими решениями для бизнеса.",
    url: "https://sovcombank.ru/",
    referralUrl: null,
  },
];
