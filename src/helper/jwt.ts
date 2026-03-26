import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { getFirstMatch } from "./database-service";
import { userModel } from "../database";
import { apiResponse, HTTP_STATUS, USER_ROLES } from "../common";
import { responseMessage } from "./response";

const ObjectId = mongoose.Types.ObjectId;
const jwtSecretKey = process.env.JWT_TOKEN_SECRET;

const getTokenFromHeader = (authorization?: string) => {
  if (!authorization) return "";
  const parts = authorization.split(" ");
  if (parts.length === 2) return parts[1];
  return authorization;
};

export const adminJwt = async (req, res, next: any) => {
  const { authorization } = req.headers;
  try {
    if (!authorization) return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage?.tokenNotFound, {}, {}));
    
    const token = getTokenFromHeader(authorization);
    if (!token) return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage?.invalidToken, {}, {}));
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtSecretKey as string);
    } catch (error: any) {
      if (error?.name === "TokenExpiredError") {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage?.tokenExpire, {}, {}));
      }
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage?.invalidToken, {}, {}));
    }

    const user = await getFirstMatch(userModel,{ _id: new ObjectId(decoded?._id), isDeleted: false },{},{});

    if (!user) return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage?.invalidToken, {}, {}));
    

    if (user?.isActive === false) return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage?.accountBlock, {}, {}));

    if (user?.roles !== USER_ROLES.ADMIN) return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage?.accessDenied, {}, {}));

    req.headers.user = user;
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage?.internalServerError, {}, error));
  }
};

// auth for any logged-in user (admin or user)
export const authJwt = async (req, res, next: any) => {
  const { authorization } = req.headers;
  try {
    if (!authorization) return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage?.tokenNotFound, {}, {}));
    

    const token = getTokenFromHeader(authorization);
    if (!token) return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage?.invalidToken, {}, {}));
    

    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtSecretKey as string);
    } catch (error: any) {
      if (error?.name === "TokenExpiredError") {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage?.tokenExpire, {}, {}));
      }
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage?.invalidToken, {}, {}));
    }

    const user = await getFirstMatch(userModel,{ _id: new ObjectId(decoded?._id), isDeleted: false },{},{});

    if (!user) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage?.invalidToken, {}, {}));
    }

    if (user?.isActive === false) return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage?.accountBlock, {}, {}));
    
    req.headers.user = user;
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage?.internalServerError, {}, error));
  }
};

export const userJwt = async (req, res, next: any) => {
  const { authorization } = req.headers;
  try {
    if (!authorization) return next();

    const token = getTokenFromHeader(authorization);
    if (!token) return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage?.tokenNotFound, {}, {}));

    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtSecretKey as string);
    } catch (error: any) {
      if (error?.name === "TokenExpiredError") {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage?.tokenExpire, {}, {}));
      }
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage?.invalidToken, {}, {}));
    }

    const user = await getFirstMatch(userModel,{ _id: new ObjectId(decoded?._id), isDeleted: false },{},{});

    if (!user) return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage?.invalidToken, {}, {}));

    if (user?.isActive === false) return res.status(HTTP_STATUS.UNAUTHORIZED).json(new apiResponse(HTTP_STATUS.UNAUTHORIZED, responseMessage?.accountBlock, {}, {}));

    req.headers.user = user;
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(new apiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, responseMessage?.internalServerError, {}, error));
  }
};

export const userJWT = userJwt;
