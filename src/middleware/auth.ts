import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthUserDetails, AuthRequest } from "../types/authTypes";
import { validateServiceAccess } from "../services/authenticationService";

const tokenAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
  try {
    // Skip token auth if disabled
    if (process.env.USE_TOKEN_AUTH === "0") {
      next();
      return;
    }

    // Get bearer token from header or query param
    let bearerHeader = req.headers["authorization"];
    if (req.url.includes("/getFile")) {
      const queryBearerHeader = req.query.token;
      if (typeof queryBearerHeader === "string") {
        bearerHeader = queryBearerHeader;
      }
    }

    if (!bearerHeader) {
      return res.status(403).json({ status: 403, message: "Token Missing" });
    }

    // Extract token
    const token = bearerHeader.startsWith("Bearer ")
      ? bearerHeader.split(" ")[1]
      : bearerHeader;

    // Verify JWT token
    const user = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
        if (err) {
          if (err.message === "jwt expired") {
            reject({ status: 403, message: "Token Expired" });
          } else {
            reject({ status: 403, message: "Invalid Token" });
          }
        }
        resolve(decoded);
      });
    });

    console.log(user, " ---userData");

    // Validate service access
    const hasAccess = await validateServiceAccess(
      req.originalUrl,
      user as AuthUserDetails,
    );
    if (!hasAccess) {
      return res.status(403).json({
        status: 403,
        message: "Access Denied",
      });
    }

    // Attach user to request and continue
    req.user = user as AuthUserDetails;
    next();
  } catch (error: any) {
    console.error("Auth middleware error:", error);
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message || "Internal Server Error",
    });
  }
};

export { tokenAuth };
