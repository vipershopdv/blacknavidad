export const ORDER_PORTAL_URL = "https://blacknavidad-nine.vercel.app/";

export const normalizeOrderNumber = (value = "") => {
  const raw = String(value ?? "").trim().toUpperCase().replace(/\s+/g, "");
  if (/^C\d+$/.test(raw)) return `C-${raw.slice(1)}`;
  if (/^\d+$/.test(raw)) return `C-${raw}`;
  return raw;
};

export const isOrderNumber = (number) => /^C-\d{1,19}$/.test(number);

export const getOrderLink = (number) => {
  const normalized = normalizeOrderNumber(number);
  if (!isOrderNumber(normalized)) throw new Error("Número de pedido inválido.");
  const url = new URL(ORDER_PORTAL_URL);
  url.searchParams.set("pedido", normalized);
  return url.href;
};
