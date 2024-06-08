import app from "./app.js";
import { configVariables } from "./config/variables.config.js";
import { sequelize } from "./database/database.js";
import * as dotenv from 'dotenv'
dotenv.config()
import https from "https";
import fs from "fs";

async function main(port){
  try {
  await sequelize.sync( { /*force: true*/ }); //No recrea las tablas
      console.log('Connection has been established successfully.');
      app.listen(port, () => {
          console.log("Server is listening on port", port);
        });
      //app.listen(3002)
      //console.log('Server is  listening on port', 3002)
  } catch (error) {
      console.error('Unable to connect to the database:', error);
  }
}

main(configVariables.port);


// async function main(port) {
//   try {

//     await sequelize.sync({  logging: false });

//     sequelize
//       .authenticate()
//       .then(() => {
//         console.log("Conexion Exitosa a la base.");
//       })
//       .catch((error) => {
//         console.error("Error en la conexion a la base:", error);
//       });

     
//     console.log("usuario y clave", configVariables.port);
//     console.log("NODE_ENV: ", process.env.NODE_ENV);
//     if (process.env.NODE_ENV !== "production") {
//       try {
//         const options = {
//           key: fs.readFileSync(
//             "./src/assets/Certificados/STAR_espoch_edu_ec.key"
//           ),
//           cert: fs.readFileSync(
//             "./src/assets/Certificados/STAR_espoch_edu_ec.crt"
//           ),
//         };
//         https.createServer(options, app).listen(port, "0.0.0.0");
//         console.log("si ingresa")
//       } catch (error) {
//         console.error("Is not a DEV enviroment: ", error);
//       }
//     } else {
//       console.log("\n\n>> PRODUCTION\n\n");
//       app.listen(port, () => {
//         console.log("Servicios Inventarios levantado exitosamente: ", port)

//       });
//     }
//   } catch (error) {
//     console.error("Unable to connect to the database:", error);
//   }
// }

// main(configVariables.port);
