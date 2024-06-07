import { sequelize } from "../../database/database.js";
import { Horario } from "../../models/horario/horario.model.js";
import { Dias } from "../../models/horario/dias.models.js";

export const createHorario = async (req, res) => {
  try {
    const data = req.body;
    //antes de crear horario debo eliminar los horarios anteriores para el centro
    await Horario.destroy({ where: { int_centro_id: data.id_centro } });

    //obtengo los id de los dias del modelo Dias

    const dias = await Dias.findAll({ raw: true });

    //ahora creo un objeto con los dias y sus intervalos para poder hacer un bulkCreate
    let horarios = [];

    for (let i = 0; i < data.horario.length; i++) {
      const dia = data.horario[i];
      const dia_id = dias.find((d) => d.str_dia_nombre === dia.dia).int_dia_id;
      for (let j = 0; j < dia.intervalos.length; j++) {
        const intervalo = dia.intervalos[j];
        horarios.push({
          int_centro_id: data.id_centro,
          int_dia_id: dia_id,
          tm_horario_hora_inicio: intervalo.inicio,
          tm_horario_hora_fin: intervalo.fin,
          dt_fecha_actualizacion: new Date(),
        });
      }
    }

    await Horario.bulkCreate(horarios);

    return res.json({
      status: true,
      message: "Horario creado exitosamente",
      body: horarios,
    });
  } catch (error) {
    console.error("Error creating horario: ", error.message);
    return res.status(500).json({
      message: "Error creating horario",
    });
  }
};

export const getHorario = async (req, res) => {
  try {

    const { id_centro } = req.params;
    console.log("id_centro", id_centro);

    const horario = await Horario.findAll({
      where: { int_centro_id: id_centro },
      include: [
        {
          model: Dias,
          attributes: ["str_dia_nombre"],
        },
      ],
    });

    console.log("horario", horario);

    if (!horario || horario.length === 0) {
        console.log("No se encontró horario");
      return res.json({
        status: false,
        message: "No se encontró horario",
        body: []
      });
    }

    //debo formatear la respuesta para que sea mas entendible de la forma en que se creo
    let horario_formateado = [];
    let dia_actual = "";
    let intervalos = [];
    for (let i = 0; i < horario.length; i++) {
      const h = horario[i];
      if (dia_actual !== h.tb_dia.str_dia_nombre) {
        if (dia_actual !== "") {
          horario_formateado.push({
            dia: dia_actual,
            intervalos: intervalos,
          });
        }
        dia_actual = h.tb_dia.str_dia_nombre;
        intervalos = [];
      }
      intervalos.push({
        id: h.int_horario_id,
        inicio: h.tm_horario_hora_inicio,
        fin: h.tm_horario_hora_fin,
      });
    }
    horario_formateado.push({
      dia: dia_actual,
      intervalos: intervalos,
    });


    return res.json({
      status: true,
      message: "Horario obtenido exitosamente",
      body: horario_formateado,
    });
  } catch (error) {
    console.error("Error al obtener horario: ", error.message);
    return res.status(500).json({
      message: "Error al obtener horario",
    });
  }
};

export default {
  createHorario,
  getHorario,
};
