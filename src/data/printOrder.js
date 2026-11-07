import { formatMoney } from "./orderDisplay";

const escapeHtml = (value = "") =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);

export const buildPrintHTML = (client) => {
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
    <strong class="lookup-url">blacknavidad-nine.vercel.app</strong>
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

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;

  doc.open();
  doc.write(buildPrintHTML(client));
  doc.close();

  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 300);
  };
};
