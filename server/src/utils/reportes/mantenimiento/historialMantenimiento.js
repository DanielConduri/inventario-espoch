import PDFDocument from "pdfkit-table";
import PdfkitConstruct from "pdfkit-construct";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generarPDFMantenimientosCorrectivosPorCodigoBien(contenido, titulo) {
  const headerImage1 = path.join(__dirname, "../../recursos/Banderin.png");
  const headerImage2 = path.join(__dirname, "../../recursos/Espoch-Dtic.png");
  const footerImage1 = path.join(__dirname, "../../recursos/PieDePágina.png");

  return new Promise((resolve, reject) => {
    const doc = new PdfkitConstruct({
      size: "A4",
      margins: { top: 10, left: 35, right: 25, bottom: 10 },
      bufferPages: true,
    });
    var fecha = new Date();
    var options = { year: "numeric", month: "long", day: "numeric" };
    console.log(doc.x, doc.y);

    //set the header to render in every page
    doc.setDocumentHeader({ height: 160 }, () => {
      //imagen
      doc.image(headerImage1, doc.header.x, doc.header.y - 10, { width: 50 });
      doc.image(headerImage2, doc.header.x + 60, doc.header.y + 50, {
        width: 160
      });
      doc.moveDown(12);
      doc.font("Times-Bold").fontSize(12);
      doc.text(titulo, {
        align: "center",
      });
      doc.x = 90;
      doc.moveDown(1);
      doc.text("Código del bien: " + contenido[0].str_codigo_bien, {
        align: "left",
        });
      doc.text("Nombre del bien: " + contenido.str_bien_nombre, {
        align: "left",
        });

    });

    doc.x=35;

    // set the footer to render in every page
    doc.setDocumentFooter({ height: 100 }, () => {
      //imagen
      doc.image(footerImage1, doc.footer.x + 70, doc.footer.y);
      //fecha
      doc
        .fill("#000000")
        .font("Times-Bold")
        .fontSize(8)
        .text("Generado el ", doc.footer.x + 390, doc.footer.y + 70);
      doc
        .font("Times-Bold")
        .fontSize(8)
        .text(
          fecha.toLocaleDateString("es-ES", options),
          doc.footer.x + 436,
          doc.footer.y + 70,
          {
            width: 420,
            align: "letf",
          }
        );
    });
    /*doc.moveDown(15);
    doc.text('probando', {
      width: 420,
      align: "center",
    });*/



    doc.addTable(
      [
        { key: "dt_mantenimiento_correctivo_fecha_revision", label: "FECHA DE REVISIÓN", align: "center" },
        { key: "dt_mantenimiento_correctivo_fecha_entrega", label: "FECHA ENTREGA", align: "center", width: 60 },
        {key: "str_mantenimiento_correctivo_descripcion_solucion", label: "DESCRIPCIÓN DE LA SOLUCIÓN", align: "center", width: 300}
      ],
      contenido,
      {
        headBackground: 'white',
        border: { size: 0.02, color: 'black' },
        marginLeft: 55,
        marginRight: 15,
        cellsFontSize: 7,
        headFontSize: 8,
      }
    );

    // render tables
    doc.render();

    // this should be the last
    // for this to work you need to set bufferPages to true in constructor options
    //paginas
    doc.setPageNumbers((p, c) => `${p}/${c}`, "right top");

    //genero el pdf base64 buffer
    const chunks = [];
    doc.on("data", (chunk) => {
      chunks.push(chunk);
    });

    doc.on("end", () => {
      const result = Buffer.concat(chunks);
      const base64String = result.toString("base64");
      resolve(base64String);
    });

    doc.on("error", (error) => {
      reject(error);
    });

    doc.end();


  })

}

export default generarPDFMantenimientosCorrectivosPorCodigoBien;