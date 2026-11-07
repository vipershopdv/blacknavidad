const pen = new Intl.NumberFormat("es-PE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatMoney = (value) => `S/ ${pen.format(Number(value ?? 0))}`;

export const statusLabels = {
  espera: "En espera",
  listo: "Listo",
  entregado: "Entregado",
  atendido: "Entregado",
};
