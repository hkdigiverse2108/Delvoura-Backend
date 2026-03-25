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
        return `<img src="${emailLogoUrl}" alt="Delvoura" width="260" style="display:block;margin:0 auto;max-width:260px;width:100%;height:auto;" />`;
    }
    if (emailLogoBase64) {
        return `<img src="data:image/png;base64,${emailLogoBase64}" alt="Delvoura" width="260" style="display:block;margin:0 auto;max-width:260px;width:100%;height:auto;" />`;
    }
    if (emailLogoPath) {
        try {
            const fileBuffer = fs.readFileSync(emailLogoPath);
            const base64 = fileBuffer.toString("base64");
            const mimeType = getImageMimeType(emailLogoPath);
            return `<img src="data:${mimeType};base64,${base64}" alt="Delvoura" width="260" style="display:block;margin:0 auto;max-width:260px;width:100%;height:auto;" />`;
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
</head>
<body style="margin:0;padding:0;background:#f4f5f8;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f5f8;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e6e8ee;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:22px 24px 6px 24px;text-align:center;">
              ${logoHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px 28px;font-family:Arial,sans-serif;color:#111111;text-align:center;">
              <h1 style="margin:0 0 10px 0;font-size:24px;font-weight:700;">${title}</h1>
              <p style="margin:0 0 18px 0;font-size:15px;color:#5f6674;line-height:1.6;">${message}</p>
              <div style="display:inline-block;background:#f7f8fb;border:1px solid #e1e4ec;border-radius:12px;padding:14px 18px;font-size:24px;letter-spacing:5px;font-weight:700;color:#111111;">
                ${otp}
              </div>
              <p style="margin:16px 0 0 0;font-size:12px;color:#8b91a1;">${hint}</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f7f8fb;padding:12px 24px;text-align:center;font-family:Arial,sans-serif;font-size:12px;color:#8b91a1;">
              Delvoura Team · Crafted with care
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
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

const buildContactUsHtml = (payload: any) => {
    const logoHtml = getLogoHtml();
    const fullName = payload?.fullName || "-";
    const email = payload?.email || "-";
    const countryCode = payload?.countryCode || "";
    const phone = payload?.phone || "-";
    const message = payload?.message || "-";
    const phoneValue = countryCode ? `${countryCode} ${phone}` : phone;

    return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f5f8;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f5f8;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e6e8ee;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:22px 24px 8px 24px;text-align:center;">${logoHtml}</td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px 28px;font-family:Arial,sans-serif;color:#111111;">
              <h2 style="margin:0 0 14px 0;font-size:22px;">New Contact Us Message</h2>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#6b7280;width:120px;">Name</td>
                  <td style="padding:6px 0;font-size:14px;color:#111111;font-weight:600;">${fullName}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#6b7280;">Email</td>
                  <td style="padding:6px 0;font-size:14px;color:#111111;font-weight:600;">${email}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#6b7280;">Phone</td>
                  <td style="padding:6px 0;font-size:14px;color:#111111;font-weight:600;">${phoneValue}</td>
                </tr>
              </table>
              <div style="margin-top:16px;border:1px solid #e1e4ec;border-radius:12px;padding:16px;background:#f7f8fb;font-size:14px;color:#2b2f3a;line-height:1.6;white-space:pre-wrap;text-align:center;">
                ${message}
              </div>
              <p style="margin:14px 0 0 0;font-size:12px;color:#8b91a1;text-align:left;">Reply to this email to respond to the customer.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f7f8fb;padding:12px 24px;text-align:center;font-family:Arial,sans-serif;font-size:12px;color:#8b91a1;">
              Delvoura Team · Crafted with care
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const contact_us_mail = async (payload: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const mailOptions = {
                from: mailUser,
                to: mailUser,
                replyTo: payload?.email,
                subject: "Delvoura | New Contact Us Message",
                html: buildContactUsHtml(payload),
            };

            await transPorter.sendMail(mailOptions, (err) => {
                if (err) reject(err);
                else resolve(`Email sent to ${mailUser}`);
            });
        } catch (error) {
            reject(error);
        }
    });
};
