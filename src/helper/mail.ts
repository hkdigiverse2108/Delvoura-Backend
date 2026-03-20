"use strict"
import nodemailer from 'nodemailer';


const mailUser: string = process.env.MAIL || "";
const mailPass: string = process.env.MAIL_PASSWORD || "";
const option: any = {
    service: "gmail",
    host: 'smtp.gmail.com',
    port: 465,
    tls: {
        rejectUnauthorized: false
    },
    auth: {
        user: mailUser,
        pass: mailPass,
    },
}
const transPorter = nodemailer.createTransport(option)

const emailLogoUrl: string = process.env.EMAIL_LOGO_URL || "";
const getLogoHtml = () => {
    if (emailLogoUrl) {
        return `<img src="${emailLogoUrl}" alt="Delvoura" width="220" style="display:block; max-width:220px; width:100%; height:auto; margin:0 auto;" />`;
    }
    return `<div style="font-family: 'Georgia', 'Times New Roman', serif; font-size:28px; letter-spacing:6px; font-weight:700; color:#1c1b1a;">DELVOURA</div>`;
};

export const email_verification_mail = async (user: any, otp: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const logoHtml = getLogoHtml();
            const mailOptions = {
                from: mailUser, // sender address
                to: user.email, // list of receivers
                subject: "Delvoura | Email Verification",
                html: `<!doctype html>
<html lang="en">
  <head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Inter:wght@400;600&display=swap');
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#f6f4f0;">
    <table width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f6f4f0">
      <tr>
        <td align="center" style="padding:36px 12px;">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; background:#ffffff; border-radius:18px; overflow:hidden; box-shadow:0 12px 30px rgba(0,0,0,0.08);">
            <tr>
              <td align="center" style="padding:28px 32px; background:#fbfaf8; border-bottom:1px solid #eee6de;">
                ${logoHtml}
                <div style="margin-top:10px; font-family:'Inter', Arial, sans-serif; font-size:12px; letter-spacing:2px; color:#9a8f86;">FINE FRAGRANCE</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 12px 0; font-family:'Playfair Display', Georgia, serif; font-size:28px; color:#1c1b1a;">
                  Verify your email
                </h1>
                <p style="margin:0 0 18px 0; font-family:'Inter', Arial, sans-serif; font-size:15px; line-height:22px; color:#4d4741;">
                  Use the verification code below to complete your sign‑up. This code expires in 10 minutes.
                </p>
                <div style="text-align:center; padding:18px; background:#f6f4f0; border:1px dashed #d9cfc5; border-radius:12px; margin:20px 0;">
                  <div style="font-family:'Inter', Arial, sans-serif; font-size:26px; letter-spacing:6px; font-weight:600; color:#1c1b1a;">
                    ${otp}
                  </div>
                </div>
                <p style="margin:0; font-family:'Inter', Arial, sans-serif; font-size:13px; line-height:20px; color:#7a716a;">
                  If you didn’t request this, you can safely ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px; background:#fbfaf8; font-family:'Inter', Arial, sans-serif; font-size:12px; color:#9a8f86;">
                Delvoura Team • Crafted with care
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`, // html body
            };
            await transPorter.sendMail(mailOptions, function (err, data) {
                if (err) {
                    console.log(err)
                    reject(err)
                } else {
                    resolve(`Email has been sent to ${user.email}, kindly follow the instructions`)
                }
            })
        } catch (error) {
            console.log(error)
            reject(error)
        }
    });
}

export const password_reset_mail = async (user: any, otp: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const logoHtml = getLogoHtml();
            const mailOptions = {
                from: mailUser,
                to: user.email,
                subject: "Delvoura | Password Reset",
                html: `<!doctype html>
<html lang="en">
  <head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Reset</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Inter:wght@400;600&display=swap');
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#f6f4f0;">
    <table width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f6f4f0">
      <tr>
        <td align="center" style="padding:36px 12px;">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; background:#ffffff; border-radius:18px; overflow:hidden; box-shadow:0 12px 30px rgba(0,0,0,0.08);">
            <tr>
              <td align="center" style="padding:28px 32px; background:#fbfaf8; border-bottom:1px solid #eee6de;">
                ${logoHtml}
                <div style="margin-top:10px; font-family:'Inter', Arial, sans-serif; font-size:12px; letter-spacing:2px; color:#9a8f86;">FINE FRAGRANCE</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 12px 0; font-family:'Playfair Display', Georgia, serif; font-size:28px; color:#1c1b1a;">
                  Reset your password
                </h1>
                <p style="margin:0 0 18px 0; font-family:'Inter', Arial, sans-serif; font-size:15px; line-height:22px; color:#4d4741;">
                  We received a request to reset your password. Use the code below to continue. This code expires in 10 minutes.
                </p>
                <div style="text-align:center; padding:18px; background:#f6f4f0; border:1px dashed #d9cfc5; border-radius:12px; margin:20px 0;">
                  <div style="font-family:'Inter', Arial, sans-serif; font-size:26px; letter-spacing:6px; font-weight:600; color:#1c1b1a;">
                    ${otp}
                  </div>
                </div>
                <p style="margin:0; font-family:'Inter', Arial, sans-serif; font-size:13px; line-height:20px; color:#7a716a;">
                  If you didn’t request this, you can safely ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px; background:#fbfaf8; font-family:'Inter', Arial, sans-serif; font-size:12px; color:#9a8f86;">
                Delvoura Team • Crafted with care
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
            };
            await transPorter.sendMail(mailOptions, function (err, data) {
                if (err) {
                    console.log(err)
                    reject(err)
                } else {
                    resolve(`Email has been sent to ${user.email}, kindly follow the instructions`)
                }
            })
        } catch (error) {
            console.log(error)
            reject(error)
        }
    });
}
