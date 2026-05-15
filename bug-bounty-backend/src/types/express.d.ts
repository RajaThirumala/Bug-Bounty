import type { Profile } from "../db/schema/index.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        fullName: Profile["fullName"];
        username: Profile["username"];
        role: Profile["primaryRole"];
        onboardingCompleted: Profile["onboardingCompleted"];
      };
    }
  }
}

export {};
