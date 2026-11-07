import QRCode from "qrcode";
import { formatMoney } from "./orderDisplay.js";
import { getOrderLink, ORDER_PORTAL_URL } from "./orderLink.js";

const escapeHtml = (value = "") =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);

export const buildPrintHTML = (client) => {
  const orderLink = getOrderLink(client.id);
  const { modules } = QRCode.create(orderLink, { errorCorrectionLevel: "M" });
  const margin = 4;
  const qrSize = modules.size + margin * 2;
  const path = [];
  for (let y = 0; y < modules.size; y++) {
    for (let x = 0; x < modules.size; x++) {
      if (modules.get(y, x)) path.push(`M${x + margin} ${y + margin}h1v1h-1z`);
    }
  }
  const qr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${qrSize} ${qrSize}" role="img" aria-label="QR del pedido ${escapeHtml(client.id)}" shape-rendering="crispEdges"><rect width="${qrSize}" height="${qrSize}" fill="#fff"/><path d="${path.join("")}" fill="#000"/></svg>`;
  const printedAt = new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short", timeStyle: "short", timeZone: "America/Lima",
  }).format(new Date());
  const balance = Number(client.debe ?? 0);
  const row = (label, value) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`;

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Nota de venta</title>
  <style>
    @page { size: auto; margin: 0; }
    * { box-sizing: border-box; }
    body { width: 80mm; margin: 0; padding: 3mm 4mm 4mm; color: #000; background: #fff; font: 11px/1.4 Arial, sans-serif; }
    h1, p, dl, dd { margin: 0; }
    header, .lookup-box, .order-number, footer { text-align: center; }
    h1 { font-size: 18px; line-height: 1.15; font-weight: 700; margin-bottom: 5px; }
    header p + p { margin-top: 2px; }
    .order-number { margin-top: 10px; padding: 8px 0; border-block: 1px solid #222; }
    .order-number strong { display: block; font-size: 36px; line-height: 1.05; overflow-wrap: anywhere; }
    dl { padding: 8px 0; }
    dl + dl { border-top: 1px dashed #444; }
    dl div, .balance { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 8px; }
    dl div + div { margin-top: 4px; }
    dd, .balance strong { text-align: right; overflow-wrap: anywhere; }
    .balance { border-block: 1px solid #222; padding: 6px 0; align-items: baseline; }
    .balance strong { font-size: 16px; }
    footer { margin-top: 9px; font-size: 10px; }
    footer p + p { margin-top: 4px; }
    .lookup-box { margin-top: 9px; border: 1px solid #333; padding: 5px 6px; font-size: 10px; }
    .lookup-url { display: block; margin-top: 2px; overflow-wrap: anywhere; }
    .ticket-qr { margin: 9px 0 0; border-top: 1px dashed #444; padding-top: 6px; text-align: center; break-inside: avoid; }
    .ticket-qr figcaption { font-size: 10px; }
    .ticket-qr a { display: block; width: 32mm; margin: 3px auto 0; line-height: 0; }
    .ticket-qr svg { display: block; width: 100%; height: auto; }
  </style>
</head>
<body>
  <header>
    <h1>Nota de venta</h1>
    <p>Servicio de asados</p>
    <p>Temporada de Navidad y Año Nuevo</p>
  </header>
  <div class="lookup-box">
    Consulta el estado de tus fuentes en
    <strong class="lookup-url">${escapeHtml(new URL(ORDER_PORTAL_URL).hostname)}</strong>
  </div>
  <div class="order-number">Número de pedido <strong>${escapeHtml(client.id)}</strong></div>
  <dl>
    ${row("Cliente", client.nombre)}
    ${row("Contenido", client.contenido)}
    ${row("Fuentes", client.fuentes)}
  </dl>
  <dl>
    ${row("Total", formatMoney(client.total))}
    ${row("Adelanto", formatMoney(client.adelanto))}
  </dl>
  <p class="balance"><span>${balance > 0 ? "Saldo pendiente" : "Sin saldo pendiente"}</span><strong>${escapeHtml(formatMoney(balance))}</strong></p>
  <footer>
    <p>Emitido: ${escapeHtml(printedAt)}</p>
  </footer>
  <figure class="ticket-qr">
    <figcaption>Escanea para ver el estado de tu pedido</figcaption>
    <a href="${escapeHtml(orderLink)}">${qr}</a>
  </figure>
</body>
</html>`;
};

export const printClientTicket = (client) => {
  const iframe = document.createElement("iframe");

  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.opacity = "0";

  iframe.addEventListener("load", () => {
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 300);
  }, { once: true });
  iframe.srcdoc = buildPrintHTML(client);
  document.body.appendChild(iframe);
};
