import prisma from "../client";
import { AuthUserDetails } from "../types/authTypes";
import jwt from "jsonwebtoken";

const getEndpointsForUser = async (userId: number) => {
  const userAccess = await prisma.userApplicationLink.findMany({
    where: { userId },
    select: {
      application: {
        select: {
          services: {
            select: {
              service: {
                select: {
                  endpoint: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return userAccess
    .flatMap((link) => link.application.services)
    .flatMap((service) => service.service.endpoint);
};

const getEndpointsForApplication = async (applicationId: number) => {
  const appAccess = await prisma.applicationServiceLink.findMany({
    where: { applicationId },
    select: {
      service: {
        select: {
          endpoint: true,
        },
      },
    },
  });

  return appAccess.map((link) => link.service.endpoint);
};

const isUrlAllowed = (url: string, allowedEndpoints: string[]): boolean => {
  return allowedEndpoints.some((endpoint) => {
    if (endpoint.endsWith("/*")) {
      const prefix = endpoint.slice(0, -2);
      return url.startsWith(prefix);
    }
    return url === endpoint;
  });
};

export const validateServiceAccess = async (
  url: string,
  user: AuthUserDetails,
): Promise<boolean> => {
  try {
    // Early return if no valid IDs
    if (!user.userId && !user.applicationId) {
      return false;
    }

    // Get endpoints based on user type
    const allowedEndpoints = user.userId
      ? await getEndpointsForUser(user.userId)
      : await getEndpointsForApplication(user.applicationId!);

    // Log for debugging
    console.log({
      allowedEndpoints,
      requestedUrl: url,
      userType: user.userId ? "user" : "application",
    });

    return isUrlAllowed(url, allowedEndpoints);
  } catch (error) {
    console.error("Error validating service access:", error);
    return false;
  }
};

export function generateApplicationToken(
  applicationId: number,
  expirationDays: number,
): string {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in the environment");
  }

  if (!applicationId) {
    throw new Error("Application ID must be provided.");
  }

  // Calculate expiration time
  const expirationTime =
    Math.floor(Date.now() / 1000) + expirationDays * 24 * 60 * 60;

  // Create payload
  const payload = {
    applicationId: applicationId,
    exp: expirationTime,
  };

  // Generate token
  const token = jwt.sign(payload, process.env.JWT_SECRET);

  return token;
}
