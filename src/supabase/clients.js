import { supabase } from "./config";

const PAGE_SIZE = 500;
const LOOKUP_TIMEOUT_MS = 10_000;
const editable = ["nombre", "contenido", "whatsapp", "fuentes", "total", "adelanto"];
let channelNumber = 0;

const pickFields = (data, fields) =>
  Object.fromEntries(fields.filter((field) => Object.hasOwn(data, field))
    .map((field) => [field, data[field]]));

const toClient = ({ fuentes_listas, ...row }) => ({
  ...row,
  fuentesListas: fuentes_listas,
});

const unwrap = ({ data, error }) => {
  if (error) throw error;
  return data;
};

const listClients = async () => {
  const clients = [];
  let before;
  for (;;) {
    let query = supabase.from("clients").select("*")
      .order("code_number", { ascending: false }).limit(PAGE_SIZE);
    if (before !== undefined) query = query.lt("code_number", before);
    const rows = unwrap(await query);
    clients.push(...rows.map(toClient));
    if (rows.length < PAGE_SIZE) return clients;
    before = rows.at(-1).code_number;
  }
};

export const listenClients = (onData, onError) => {
  let closed = false;
  let request = 0;
  const refresh = async () => {
    if (closed) return;
    const current = ++request;
    try {
      const clients = await listClients();
      if (!closed && current === request) onData(clients);
    } catch (error) {
      if (!closed && current === request) onError(error);
    }
  };

  const channel = supabase.channel(`blacknavidad-clients-${++channelNumber}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "clients" }, refresh)
    .subscribe((status) => {
      if (status === "SUBSCRIBED") void refresh();
    });
  void refresh();

  return {
    refresh,
    close() {
      closed = true;
      void supabase.removeChannel(channel);
    },
  };
};

export const getClientByCode = async (code, signal) => {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) controller.abort();
  const timer = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);
  try {
    const row = unwrap(await supabase.rpc("lookup_order_status", { p_code: code })
      .abortSignal(controller.signal).maybeSingle());
    return row ? toClient(row) : null;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
};

export const getNextOrderCode = async (signal) =>
  unwrap(await supabase.rpc("admin_next_order_code").abortSignal(signal));

export const createClient = async (client) =>
  toClient(unwrap(await supabase.from("clients").insert(pickFields(client, editable))
    .select("*").single()));

export const editClient = async (id, changes) =>
  unwrap(await supabase.from("clients")
    .update(pickFields(changes, [...editable, "estado"])).eq("id", id)
    .select("id").single());

export const deleteClient = async (id) =>
  unwrap(await supabase.from("clients").delete().eq("id", id).select("id").single());

export const updateFuentes = async (id, fuentesListas, totalFuentes) =>
  unwrap(await supabase.from("clients")
    .update({
      fuentes_listas: fuentesListas,
      estado: fuentesListas >= totalFuentes ? "listo" : "espera",
    })
    .eq("id", id).eq("fuentes", totalFuentes).in("estado", ["espera", "listo"])
    .select("id").single());
