import { DataTypes } from "sequelize";
import { sequelize } from "../../database/database.js";
import { Bienes } from "../inventario/bienes.models.js";

export const Prestamo = sequelize.define(
    "tb_prestamo",
    {
        int_prestamo_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        str_codigo_bien: {
            type: DataTypes.STRING(255),
            allowNull: false,
            // references:{
            //     model: Bienes,
            //     key: "str_codigo_bien"
            // }
        },
        int_prestamo_persona_id:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        str_prestamo_objeto_investigacion:{
            type: DataTypes.TEXT,
            allowNull: false
        },
        
    },
    {
        schema: "prestamos",
        timestamps: false,
        freezeTableName:true //Evitar la pluralización de las tablas
    }
)
