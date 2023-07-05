import nodemailer from "nodemailer";

const emailRegistro = async (datos) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  //   console.log(datos);
  const { email, nombre, token } = datos;

  // Enviar el email
  await transport.sendMail({
    from: "GuiaPractica.colmex",
    to: email,
    subject: "Confirma tu cuenta en la GuiaPractica.colmex",
    text: "Confirma tu cuenta en la GuiaPractica.colmex",
    html: `
    <p>Hola ${nombre}, comprueba tu cuenta en la GuiaPractica.colmex</p>
    <p>Tu cuenta ya esta lista, solo debes confirmarla en el siguiente enlace:
    <a href=" ${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token} ">Confirmar cuenta</a></p>

    <p>Si tu no creaste esta cuenta, puedes ignorar el siguiente mensaje</p>
    `,
  });
};

const emailOlvidePassword = async (datos) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  //   console.log(datos);
  const { email, nombre, token } = datos;

  // Enviar el email
  await transport.sendMail({
    from: "GuiaPractica.colmex",
    to: email,
    subject: "Reestablece tu cuenta en la GuiaPractica.colmex",
    text: "Reestablece tu cuenta en la GuiaPractica.colmex",
    html: `
    <p>Hola ${nombre}, has solicitado reestablecer tu password en la GuiaPractica.colmex</p>
    <p>Sigue el siguiente enlace para generar un password nuevo:
    <a href=" ${process.env.BACKEND_URL}:${
      process.env.PORT ?? 3000
    }/auth/olvide-password/${token} ">Reestablecer password</a></p>

    <p>Si tu no solicitaste el cambio de password, puedes ignorar el siguiente mensaje</p>
    `,
  });
};

export { emailRegistro, emailOlvidePassword };
