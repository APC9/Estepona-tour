import nodemailer from 'nodemailer';

// Configuración del transporter de nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Verificar configuración SMTP al iniciar
transporter.verify((error) => {
  if (error) {
    console.error('❌ Error en configuración SMTP:', error);
  } else {
    // SMTP configurado correctamente
  }
});

interface SendVerificationEmailParams {
  email: string;
  token: string;
  url: string;
}

/**
 * Envía un email de verificación con un código de 6 dígitos
 */
export async function sendVerificationEmail({
  email,
  token,
  url,
}: SendVerificationEmailParams) {
  // Extraer el código de 6 dígitos del token (NextAuth lo genera)
  const code = token.slice(-6).toUpperCase();

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Estepona Tours'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER
      }>`,
    to: email,
    subject: '🔐 Código de verificación - Estepona Tours',
    html: getVerificationEmailTemplate(code, url),
    text: getVerificationEmailText(code, url),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    throw error;
  }
}

/**
 * Plantilla HTML para el email de verificación
 */
function getVerificationEmailTemplate(code: string, url: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifica tu correo</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                🗺️ Estepona Tours
              </h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">
                Verifica tu correo electrónico
              </p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                ¡Hola! 👋
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Gracias por registrarte en <strong>Estepona Tours</strong>. Para completar tu registro, por favor verifica tu correo electrónico usando el siguiente código:
              </p>
              
              <!-- Código de verificación -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; display: inline-block;">
                      <p style="color: #e0e7ff; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
                        Tu código de verificación
                      </p>
                      <p style="color: #ffffff; font-size: 48px; font-weight: 700; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
                        ${code}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                También puedes hacer clic en el siguiente botón para verificar tu correo automáticamente:
              </p>
              
              <!-- Botón de verificación -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td align="center">
                    <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);">
                      Verificar mi correo
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                ⏰ <strong>Este código expira en 24 horas.</strong> Si no solicitaste este correo, puedes ignorarlo de forma segura.
              </p>
              
              <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 10px 0 0 0;">
                🔒 Por tu seguridad, nunca compartas este código con nadie.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 10px 0;">
                © ${new Date().getFullYear()} Estepona Tours. Todos los derechos reservados.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Descubre Estepona de una forma única e interactiva 🌟
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Versión texto plano del email de verificación
 */
function getVerificationEmailText(code: string, url: string): string {
  return `
Estepona Tours - Verifica tu correo electrónico

¡Hola!

Gracias por registrarte en Estepona Tours. Para completar tu registro, por favor verifica tu correo electrónico usando el siguiente código:

CÓDIGO DE VERIFICACIÓN: ${code}

También puedes hacer clic en el siguiente enlace para verificar tu correo automáticamente:
${url}

⏰ Este código expira en 24 horas. Si no solicitaste este correo, puedes ignorarlo de forma segura.

🔒 Por tu seguridad, nunca compartas este código con nadie.

---
© ${new Date().getFullYear()} Estepona Tours. Todos los derechos reservados.
Descubre Estepona de una forma única e interactiva 🌟
  `.trim();
}

/**
 * Envía un email genérico
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Estepona Tours'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER
      }>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''), // Remover HTML si no hay texto
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    throw error;
  }
}
