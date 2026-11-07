import { useEffect, useState } from "react";
import RegisterClient from "../components/RegisterClient";
import { getNextOrderCode } from "../supabase/clients";

export default function Register({ addClient, clients, clientsLoaded }) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    getNextOrderCode(controller.signal).then(
      (code) => {
        if (!controller.signal.aborted) setPreview({ code });
      },
      (error) => {
        if (!controller.signal.aborted) {
          setPreview({ unavailable: ["PGRST202", "42883"].includes(error.code) });
        }
      }
    );
    return () => controller.abort();
  }, [clients]);

  const estimated = preview?.unavailable && clientsLoaded;
  const code = estimated
    ? `C-${BigInt(clients[0]?.id.slice(2) ?? 0) + 1n}`
    : preview?.code;

  return <RegisterClient addClient={addClient} nextCode={code} estimated={estimated} />;
}
