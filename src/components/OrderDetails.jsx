import { LuCircleDollarSign, LuLayers, LuPackage, LuPhone, LuUser, LuWallet, LuHandCoins } from "react-icons/lu";
import { formatMoney } from "../data/orderDisplay";

const orderFields = [
  { name: "nombre", label: "Cliente", icon: LuUser, required: true },
  { name: "whatsapp", label: "WhatsApp", icon: LuPhone, type: "tel" },
  { name: "contenido", label: "Contenido", icon: LuPackage },
  { name: "fuentes", label: "Fuentes", icon: LuLayers, type: "number", min: 1, step: 1, required: true },
];
const paymentFields = [
  { name: "total", label: "Total", icon: LuCircleDollarSign },
  { name: "adelanto", label: "Adelanto", icon: LuHandCoins },
  { name: "debe", label: "Saldo", icon: LuWallet },
].map((field) => ({ ...field, type: "number", min: 0, step: "0.01", money: true, required: true }));

export default function OrderDetails({ client, formData, onChange }) {
  const balance = formData ? Number(formData.total) - Number(formData.adelanto) : Number(client.debe ?? 0);
  const renderField = ({ name, label, icon: Icon, money, ...input }) => {
    const caption = <><Icon aria-hidden="true" /> {label}</>;
    const value = name === "debe" ? balance : client[name];
    if (formData && name === "debe") return (
      <div className="admin-field" key={name}>
        <span className="admin-detail-caption">{caption}</span>
        <output className="admin-field-control">{formatMoney(balance)}</output>
      </div>
    );
    return formData ? (
      <label className="admin-field" key={name}>
        <span className="admin-detail-caption">{caption}</span>
        <input {...input} name={name} className="admin-field-control" value={formData[name] ?? ""} onChange={onChange} />
      </label>
    ) : (
      <div key={name} className="admin-detail">
        <dt className="admin-detail-caption">{caption}</dt>
        <dd className={name === "debe" && balance > 0 ? "admin-order-balance" : undefined}>
          {money ? formatMoney(value) : value || "Sin datos"}
        </dd>
      </div>
    );
  };
  const Group = formData ? "div" : "dl";

  return (
    <div className="admin-detail-body">
      <Group className="admin-detail-grid">{orderFields.map(renderField)}</Group>
      <Group className="admin-payment-grid">{paymentFields.map(renderField)}</Group>
    </div>
  );
}
