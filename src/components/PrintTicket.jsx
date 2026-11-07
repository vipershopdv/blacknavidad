export default function PrintTicket({
  client,
}) {
  return (
    <div id="ticket-print">
      <style>
        {`
          @page {
            size: 80mm auto;
            margin: 0;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            width: 80mm;
            overflow: hidden;
            background: white;
            font-family: Arial, sans-serif;
          }

          #ticket-print {
            width: 80mm;
            padding: 12px;
            box-sizing: border-box;
            color: black;
          }

          .line {
            border-top: 1px dashed black;
            margin: 12px 0;
          }

          .center {
            text-align: center;
          }

          .row {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 8px;
            font-size: 14px;
          }

          .bold {
            font-weight: bold;
          }

          .big-id {
            font-size: 64px;
            font-weight: 900;
            line-height: 1;
            margin-top: 5px;
          }

          .debe {
            font-size: 28px;
            font-weight: 900;
          }
        `}
      </style>

      {/* HEADER */}
      <div className="center">
        <h1
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          INV SALAS
        </h1>

        <p
          style={{
            margin: "4px 0",
            fontSize: "14px",
          }}
        >
          Servicio de Asados
        </p>

        <p
          style={{
            margin: 0,
            fontSize: "14px",
          }}
        >
          Edición Fin de Año
        </p>
      </div>

      {/* LINEA */}
      <div className="line" />

      {/* ID */}
      <div className="center">
        <p
          style={{
            margin: 0,
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          ID
        </p>

        <div className="big-id">
          {client.id}
        </div>
      </div>

      {/* LINEA */}
      <div className="line" />

      {/* INFO */}
      <div>
        <div className="row">
          <span className="bold">
            Cliente:
          </span>

          <span className="bold">
            {client.nombre}
          </span>
        </div>

        <div className="row">
          <span className="bold">
            Contenido:
          </span>

          <span className="bold">
            {client.contenido}
          </span>
        </div>

        <div className="row">
          <span className="bold">
            Fuentes:
          </span>

          <span className="bold">
            {client.fuentes}
          </span>
        </div>

        <div className="row">
          <span className="bold">
            Total:
          </span>

          <span className="bold">
            S/{client.total}
          </span>
        </div>

        <div className="row">
          <span className="bold">
            Adelanto:
          </span>

          <span className="bold">
            S/{client.adelanto}
          </span>
        </div>

        <div className="row">
          <span className="bold">
            Debe:
          </span>

          <span className="debe">
            S/{client.debe}
          </span>
        </div>
      </div>

      {/* LINEA */}
      <div className="line" />

      {/* FOOTER */}
      <div
        className="center"
        style={{
          fontSize: "14px",
        }}
      >
        <p
          style={{
            margin: 0,
          }}
        >
          Gracias por su preferencia
        </p>

        <p
          style={{
            marginTop: "4px",
          }}
        >
          ¡Feliz Navidad! 🎄
        </p>
      </div>
    </div>
  );
}