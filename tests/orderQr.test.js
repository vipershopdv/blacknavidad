import assert from "node:assert/strict";
import test from "node:test";
import { getOrderLink, isOrderNumber, normalizeOrderNumber } from "../src/data/orderLink.js";
import { buildPrintHTML } from "../src/data/printOrder.js";

test("QR links always use the production portal and the selected order", () => {
  for (const value of ["C-5", "c5", " 5 ", "c - 5"]) {
    assert.equal(getOrderLink(value), "https://blacknavidad-nine.vercel.app/?pedido=C-5");
  }
  assert.equal(new URL(getOrderLink("C-987654321")).searchParams.get("pedido"), "C-987654321");
});

test("invalid QR parameters cannot produce a link or inject print content", () => {
  for (const value of ["", "C-", "-1", "C-1&otro=2", "<script>", "https://example.com", "C-12345678901234567890"]) {
    assert.equal(isOrderNumber(normalizeOrderNumber(value)), false);
    assert.throws(() => getOrderLink(value));
  }
});

test("the QR is the last receipt section and contains no customer information", () => {
  const html = buildPrintHTML({
    id: "C-5", nombre: "Cliente <prueba>", contenido: "Pavo", fuentes: 3,
    total: 150, adelanto: 50, debe: 100, whatsapp: "999999999",
  });
  assert.match(html, /Cliente &lt;prueba&gt;/);
  assert.match(html, /<figure class="ticket-qr">[\s\S]*<svg[^>]+viewBox=/);
  assert.match(html, /shape-rendering="crispEdges"/);
  assert.match(html, /href="https:\/\/blacknavidad-nine\.vercel\.app\/\?pedido=C-5"/);
  assert.match(html, /<\/figure>\s*<\/body>/);
  assert(html.indexOf('class="ticket-qr"') > html.indexOf("</footer>"));
  assert(!html.includes("999999999"));
});
