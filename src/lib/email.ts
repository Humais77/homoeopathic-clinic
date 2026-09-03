import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendVerificationEmail({
  email,
  name,
  token,
}: {
  email: string;
  name: string;
  token: string;
}) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const verificationUrl =
    `${appUrl}/verify-email?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: `"Heal By Nature" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your Heal By Nature email",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>

        <body style="
          margin:0;
          padding:0;
          background:#f4f7f5;
          font-family:Arial,Helvetica,sans-serif;
        ">

          <div style="
            max-width:600px;
            margin:40px auto;
            background:white;
            border-radius:16px;
            overflow:hidden;
            box-shadow:0 4px 20px rgba(0,0,0,0.08);
          ">

            <div style="
              background:#16a34a;
              padding:30px;
              text-align:center;
              color:white;
            ">
              <h1 style="margin:0;">
                Heal By Nature
              </h1>

              <p style="margin:10px 0 0;">
                Natural care. Better health.
              </p>
            </div>

            <div style="padding:35px">

              <h2 style="
                margin-top:0;
                color:#111827;
              ">
                Verify your email address
              </h2>

              <p style="
                color:#4b5563;
                line-height:1.7;
              ">
                Hello ${escapeHtml(name)},
              </p>

              <p style="
                color:#4b5563;
                line-height:1.7;
              ">
                Thank you for creating your Heal By Nature account.
                Please verify your email address to activate your account.
              </p>

              <div style="text-align:center;margin:35px 0">

                <a
                  href="${verificationUrl}"
                  style="
                    display:inline-block;
                    padding:14px 28px;
                    background:#16a34a;
                    color:white;
                    text-decoration:none;
                    border-radius:8px;
                    font-weight:bold;
                  "
                >
                  Verify My Email
                </a>

              </div>

              <p style="
                color:#6b7280;
                font-size:14px;
                line-height:1.6;
              ">
                This verification link will expire in 30 minutes.
              </p>

              <p style="
                color:#6b7280;
                font-size:14px;
                line-height:1.6;
              ">
                If you didn't create this account, you can safely ignore
                this email.
              </p>

            </div>

            <div style="
              padding:20px;
              background:#f9fafb;
              text-align:center;
              color:#9ca3af;
              font-size:12px;
            ">
              © ${new Date().getFullYear()} Heal By Nature
            </div>

          </div>

        </body>
      </html>
    `,
  });
}


export async function sendPasswordResetEmail({
  email,
  name,
  token,
}: {
  email: string;
  name: string;
  token: string;
}) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const resetUrl =
    `${appUrl}/reset-password?token=${encodeURIComponent(
      token
    )}`;

  await transporter.sendMail({
    from:
      `"Heal By Nature" <${process.env.EMAIL_USER}>`,

    to: email,

    subject:
      "Reset your Heal By Nature password",

    html: `
      <!DOCTYPE html>
      <html>
        <body style="
          margin:0;
          padding:0;
          background:#f4f7f5;
          font-family:Arial,Helvetica,sans-serif;
        ">

          <div style="
            max-width:600px;
            margin:40px auto;
            background:#ffffff;
            border-radius:16px;
            overflow:hidden;
          ">

            <div style="
              background:#16a34a;
              padding:30px;
              text-align:center;
              color:white;
            ">
              <h1>
                Heal By Nature
              </h1>
            </div>

            <div style="padding:35px">

              <h2>
                Reset your password
              </h2>

              <p>
                Hello ${escapeHtml(name)},
              </p>

              <p>
                We received a request to reset
                your Heal By Nature account password.
              </p>

              <div style="
                text-align:center;
                margin:35px 0;
              ">

                <a
                  href="${resetUrl}"
                  style="
                    display:inline-block;
                    padding:14px 28px;
                    background:#16a34a;
                    color:white;
                    text-decoration:none;
                    border-radius:8px;
                    font-weight:bold;
                  "
                >
                  Reset Password
                </a>

              </div>

              <p style="
                color:#6b7280;
                font-size:14px;
              ">
                This link will expire in 30 minutes.
              </p>

              <p style="
                color:#6b7280;
                font-size:14px;
              ">
                If you didn't request a password reset,
                you can safely ignore this email.
              </p>

            </div>

          </div>

        </body>
      </html>
    `,
  });
}
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}