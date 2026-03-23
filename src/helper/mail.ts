"use strict"
import nodemailer from 'nodemailer';
import fs from "fs";
import path from "path";

const mailUser: string = process.env.MAIL || "";
const mailPass: string = process.env.MAIL_PASSWORD || "";

const option: any = {
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    tls: {
        rejectUnauthorized: false
    },
    auth: {
        user: mailUser,
        pass: mailPass,
    },
};

const transPorter = nodemailer.createTransport(option);

const emailLogoUrl: string = process.env.EMAIL_LOGO_URL || "";
const emailLogoBase64: string = process.env.EMAIL_LOGO_BASE64 || "";
const emailLogoPath: string = process.env.EMAIL_LOGO_PATH || "";

const getImageMimeType = (filePath: string) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
    if (ext === ".svg") return "image/svg+xml";
    if (ext === ".webp") return "image/webp";
    return "image/png";
};

const getLogoHtml = () => {
    if (emailLogoUrl) {
        return `<img src="${emailLogoUrl}" alt="Delvoura" width="220" style="display:block;margin:0 auto;max-width:220px;width:100%;height:auto;" />`;
    }
    if (emailLogoBase64) {
        return `<img src="data:image/png;base64,${emailLogoBase64}" alt="Delvoura" width="220" style="display:block;margin:0 auto;max-width:220px;width:100%;height:auto;" />`;
    }
    if (emailLogoPath) {
        try {
            const fileBuffer = fs.readFileSync(emailLogoPath);
            const base64 = fileBuffer.toString("base64");
            const mimeType = getImageMimeType(emailLogoPath);
            return `<img src="data:${mimeType};base64,${base64}" alt="Delvoura" width="220" style="display:block;margin:0 auto;max-width:220px;width:100%;height:auto;" />`;
        } catch (error) {
            console.log(error);
        }
    }
    return `<div style="font-family:'Jost', Arial, sans-serif;font-size:28px;letter-spacing:6px;font-weight:700;color:#111111;text-align:center;">DELVOURA</div>`;
};

const buildEmailHtml = ({ title, message, otp, hint }: any) => {
    const logoHtml = getLogoHtml();

    return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
@import url('https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&display=swap');
:root {
  --color-primary: #111111;
  --color-accent: #EB4A2E;
  --color-soft-accent: #EB4A2E;
  --color-bg: #FFFFFF;
  --color-card: #F8F8F8;
  --color-text: #111111;
  --color-text-muted: color-mix(in srgb, var(--color-text) 70%, transparent);
  --color-border: #E0E0E0;
  --color-bg-light: #FFFFFF;
  --color-card-light: #F8F8F8;
  --color-text-dark: #111111;
  --color-text-muted-dark: color-mix(in srgb, var(--color-text) 70%, transparent);
  --color-border-light: #E0E0E0;
  --color-hover-dark: #F0F0F0;
  --color-bg-soft: color-mix(in srgb, var(--color-bg) 70%, var(--color-card));
  --color-surface-dark: #111111;
  --color-surface-darker: #292929;
  --color-text-on-dark: #FFF3F3;
  --color-text-on-dark-muted: color-mix(in srgb, var(--color-text-on-dark) 70%, transparent);
  --color-border-dark: #EB4A2E;
  --color-secondary-bg: #FFF3F3;
  --color-secondary-text: #111111;
  --shadow-soft: 0 18px 45px -32px color-mix(in srgb, var(--color-accent) 35%, transparent);
}

body {
  margin:0;
  padding:0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: 'Jost', Arial, sans-serif;
}

.card {
  max-width:600px;
  margin:auto;
  background: var(--color-card);
  border-radius:16px;
  overflow:hidden;
  border:1px solid var(--color-border);
  box-shadow: var(--shadow-soft);
}

.header {
  padding:20px;
  text-align:center;
  border-bottom:1px solid var(--color-border-light);
  background: var(--color-bg-light);
}

.content {
  padding:30px;
  text-align:center;
}

.otp-box {
  text-align:center;
  padding:20px;
  margin:20px 0;
  background: var(--color-secondary-bg);
  border:2px dashed var(--color-border-dark);
  border-radius:10px;
  font-size:24px;
  letter-spacing:5px;
  font-weight:bold;
  color: var(--color-secondary-text);
}

.footer {
  padding:15px;
  text-align:center;
  background: var(--color-surface-dark);
  color: var(--color-text-on-dark);
  font-size:12px;
}
</style>
</head>
<body>
<div class="card">
  <div class="header">
    ${logoHtml}
  </div>
  <div class="content">
    <h2 style="margin:0 0 12px 0;color:var(--color-text);">${title}</h2>
    <p style="color:var(--color-text-muted);">${message}</p>
    <div class="otp-box">
      ${otp}
    </div>
    <p style="font-size:13px;color:var(--color-text-muted);">${hint}</p>
  </div>
  <div class="footer">
    Delvoura Team - Crafted with care
  </div>
</div>
</body>
</html>`;
};

export const email_verification_mail = async (user: any, otp: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const mailOptions = {
                from: mailUser,
                to: user.email,
                subject: "Delvoura | Email Verification",
                html: buildEmailHtml({
                    title: "Verify your email",
                    message: "Use the code below to complete signup.",
                    otp,
                    hint: "Ignore if not requested.",
                }),
            };

            await transPorter.sendMail(mailOptions, (err) => {
                if (err) reject(err);
                else resolve(`Email sent to ${user.email}`);
            });

        } catch (error) {
            reject(error);
        }
    });
};

export const password_reset_mail = async (user: any, otp: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const mailOptions = {
                from: mailUser,
                to: user.email,
                subject: "Delvoura | Password Reset",
                html: buildEmailHtml({
                    title: "Reset your password",
                    message: "Use the code below to reset password.",
                    otp,
                    hint: "Ignore if not requested.",
                }),
            };

            await transPorter.sendMail(mailOptions, (err) => {
                if (err) reject(err);
                else resolve(`Email sent to ${user.email}`);
            });

        } catch (error) {
            reject(error);
        }
    });
};
