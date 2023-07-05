import { check, validationResult } from "express-validator";
import Usuario from "../models/Usuarios.js";
import { generarId } from "../helpers/tokens.js";
import { emailRegistro } from "../helpers/emails.js";

const formularioLogin = (req, res) => {
  res.render("auth/login", {
    pagina: "Iniciar sesión",
  });
};

const formularioRegistro = (req, res) => {
  res.render("auth/registro", {
    pagina: "Crear cuenta",
    csrfToken: req.csrfToken(),
  });
};

const registrar = async (req, res) => {
  // Validación
  await check("nombre").notEmpty().withMessage("El nombre no puede ir vacio").run(req);
  await check("email").isEmail().withMessage("Eso no parece un email").run(req);
  await check("password").isLength({ min: 6 }).withMessage("El password debe de ser al menos 6 caracteres").run(req);
  await check("repetir_password").equals("password").withMessage("Los passwords no son iguales").run(req);

  let resultado = validationResult(req);

  // Verificar que el resultado este vacio
  if (!resultado.isEmpty()) {
    // Errores
    return res.render("auth/registro", {
      pagina: "Crear cuenta",
      errores: resultado.array(),
      csrfToken: req.csrfToken(),
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }

  // Extraer los datos
  const { nombre, email, password } = req.body;
  // Verificar que el usuario no este duplicado
  const existeUsuario = await Usuario.findOne({ where: { email } });
  if (existeUsuario) {
    return res.render("auth/registro", {
      pagina: "Crear cuenta",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El usuario ya esta registrado" }],
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }

  // Almacenar un usuario
  const usuario = await Usuario.create({
    nombre,
    email,
    password,
    token: generarId(),
  });

  // Envia email de confirmacion
  emailRegistro({
    nombre: usuario.nombre,
    email: usuario.email,
    token: usuario.token,
  });

  // Mostrar mensaje de confirmacion
  res.render("templates/mensaje", {
    pagina: "Cuenta creada correctamente",
    mensaje: "Hemos enviado un email de confirmacion, presiona en el enlace",
  });
};

// Función que compueba la cuenta
const confirmar = async (req, res) => {
  // console.log("Comprobando...");
  const { token } = req.params;
  console.log(token);

  // Verificar si el token es valido
  const usuario = await Usuario.findOne({ where: { token } });
  if (!usuario) {
    return res.render("auth/confirmar-cuenta", {
      pagina: "Error al confirmar tu cuenta",
      mensaje: "Hubo un error al confirmar tu cuenta, intenta de nuevo",
      error: true,
    });
  }

  // Confirmar cuenta
  usuario.token = null;
  usuario.confirmado = true;
  await usuario.save();

  console.log(usuario);
  res.render("auth/confirmar-cuenta", {
    pagina: "Cuenta confirmada",
    mensaje: "La cuenta se confirmó correctamente",
  });
};

const formularioOlvidePassword = (req, res) => {
  res.render("auth/olvide-password", {
    pagina: "Recuperar acceso",
  });
};

export { formularioLogin, formularioRegistro, registrar, confirmar, formularioOlvidePassword };
