// const express = require("express"); //Common js
import express from "express";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import db from "./config/db.js";

// Crear la app
const app = express();

// Conexion a la base de datos
try {
  await db.authenticate();
  console.log("Conexion correcta a la base de datos");
} catch (error) {
  console.log(error);
}

// Habilitar pug
app.set("view engine", "pug");
app.set("views", "./views");

// Routing
app.use("/auth", usuarioRoutes);

// Carpeta pública
app.use(express.static("public"));

// Definir un puerto y arrancar el proyecto
const port = 3000;

app.listen(port, () => {
  console.log(`El servidor esta funcionando en el puerto ${port}`);
});
