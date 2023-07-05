import { check, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import Usuario from "../models/Usuarios.js";
import { generarId } from "../helpers/tokens.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/emails.js";

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
    csrfToken: req.csrfToken(),
  });
};

const resetPassword = async (req, res) => {
  // Validación
  await check("email").isEmail().withMessage("Eso no parece un email").run(req);

  let resultado = validationResult(req);

  // Verificar que el resultado este vacio
  if (!resultado.isEmpty()) {
    // Errores
    return res.render("auth/olvide-password", {
      pagina: "Recuperar acceso",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }

  // Buscar el usuario
  const { email } = req.body;
  const usuario = await Usuario.findOne({ where: { email } });

  if (!usuario) {
    return res.render("auth/olvide-password", {
      pagina: "Recuperar acceso",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El email no pertenece a ningún usuario" }],
    });
  }

  // Genenerar un token y enviar el email
  usuario.token = generarId();
  await usuario.save();

  // Enviar un email
  emailOlvidePassword({
    email: usuario.email,
    nombre: usuario.nombre,
    token: usuario.token,
  });

  // Renderizar un mensaje
  res.render("templates/mensaje", {
    pagina: "Reestablece tu password",
    mensaje: "Hemos enviado un email con las instrucciones",
  });

  console.log(usuario);
};

const comprobarToken = async (req, res) => {
  const { token } = req.params;
  const usuario = await Usuario.findOne({ where: { token } });

  if (!usuario) {
    return res.render("auth/confirmar-cuenta", {
      pagina: "Reestablecer password",
      mensaje: "Hubo un error al validar tu información, intenta de nuevo",
      error: true,
    });
  }

  // Mostrar formulario para modificar el password
  res.render("auth/reset-password", {
    pagina: "Reestablece tu password",
    csrfToken: req.csrfToken(),
  });

  console.log(usuario);
};

const nuevoPassword = async (req, res) => {
  // Validar el password
  await check("password").isLength({ min: 6 }).withMessage("El password debe de ser al menos 6 caracteres").run(req);
  let resultado = validationResult(req);

  // Verificar que el resultado este vacio
  if (!resultado.isEmpty()) {
    // Errores
    return res.render("auth/reset-password", {
      pagina: "Reestablece tu password",
      errores: resultado.array(),
      csrfToken: req.csrfToken(),
    });
  }

  const { token } = req.params;
  const { password } = req.body;

  // Identificar quien hace el cambio
  const usuario = await Usuario.findOne({ where: { token } });

  // Hashear el nuevo password
  const salt = await bcrypt.genSalt(10);
  usuario.password = await bcrypt.hash(password, salt);
  usuario.token = null;
  await usuario.save();

  res.render("auth/confirmar-cuenta", {
    pagina: "Password Reestablecido",
    mensaje: "El password se guardó correctamente",
  });
};

export {
  formularioLogin,
  formularioRegistro,
  registrar,
  confirmar,
  formularioOlvidePassword,
  resetPassword,
  comprobarToken,
  nuevoPassword,
};
