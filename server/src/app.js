import express from "express";
import cors from "cors";
import indexRoutes from "./routes/index.routes.js";
import cookieParser from "cookie-parser";



const app = express();
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://inventarios.espoch.edu.ec/');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json());
const whiteList = [
  "https://pruebasw.espoch.edu.ec:3011",
  "http://pruebasw.espoch.edu.ec:3011",
  "https://pruebacomprobante.espoch.edu.ec:8080",
  "http://localhost:4200",
  "https://localhost:4200",
  "https://pruebasai.espoch.edu.ec",
  "https://pruebasw.espoch.edu.ec:3011/login",
  "https://pruebas1.espoch.edu.ec ",
  "https://inventarios.espoch.edu.ec",
  "http://inventarios.espoch.edu.ec"
];

app.use(
  cors({
    credentials: true,
    origin: whiteList,
  })
);
app.use(cookieParser());
//app.305(validarCookies);

export default app;
app.use(indexRoutes);

