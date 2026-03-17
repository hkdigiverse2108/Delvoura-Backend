"use strict";

import winston from "winston";
import moment from "moment-timezone";


const timeFormat = moment().format("DD-MM-YYYY hh:mm:ss A");
const colorizer = winston.format.colorize();
const timeZone: any = "Asia/Calcutta";

let logColor: any = {
    colors: {
      error: "red",
      warn: "magenta",
      info: "yellow",
      http: "green",
      debug: "cyan",
    },
  },
  name: String = "Q&A";
winston.addColors(logColor);

let alignColorsAndTime = winston.format.combine(
  winston.format.colorize({
    all: true,
  }),
  winston.format.timestamp({
    format: timeFormat,
  }),
  winston.format.json(),
  winston.format.printf((info) => `\x1b[96m[${name}]` + " " + `\x1b[95m${moment.tz(timeZone)}` + " " + colorizer.colorize(winston.level, `- ${info.level}: ${info.message}`))
);

// let fileLogger = winston.format.combine(
//   winston.format.timestamp({
//     format: timeFormat,
//   }),
//   winston.format.json(),
//   winston.format.printf((info) => `${info.timestamp}  ${info.level} : ${info.message}`)
// );

export const logger = winston.createLogger({
  level: "debug",
  transports: [
    new winston.transports.Http({
      level: "warn",
      format: winston.format.json(),
    }),
    new winston.transports.Console({
      format: alignColorsAndTime,
    }),
  ],
});

export const reqInfo = async function (req) {
  const userAgent = req.header("user-agent") || "";

  let osName = "unknown";
  let browserName = userAgent || "unknown";

  if (userAgent) {
    const openIndex = userAgent.indexOf("(");
    const closeIndex = userAgent.indexOf(")");
    if (openIndex >= 0 && closeIndex > openIndex) {
      const inside = userAgent.slice(openIndex + 1, closeIndex);
      const parts = inside.split(";").map((part) => part.trim()).filter(Boolean);
      osName = parts[1] || parts[0] || "unknown";
    }

    const afterParen = userAgent.split(")").pop()?.trim();
    if (afterParen) {
      browserName = afterParen;
    }
  }

  const forwardedFor = req.headers["x-forwarded-for"];
  const forwardedIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(",")[0];
  const ipRaw = forwardedIp?.trim() || req.ip || req.socket?.remoteAddress || "unknown";
  const ipAddress = ipRaw === "::1" ? "127.0.0.1" : ipRaw;

  logger.http(`${req.method} ${req.headers.host}${req.originalUrl} \x1b[33m device os => [${osName}] \x1b[1m\x1b[37mip address => ${ipAddress} \n\x1b[36m browser => ${browserName}`);
};
