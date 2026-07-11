// NOTE: The imports from './_generated/api' are created automatically
// when you run `npx convex dev` for the first time. Run that command first.
import { createClient, type CreateAuth } from '@convex-dev/better-auth';
import { convex } from '@convex-dev/better-auth/plugins';
import { components } from './_generated/api';
import { query } from './_generated/server';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import authConfig from './auth.config';

const siteUrl = process.env.SITE_URL!;

// The component client wraps the betterAuth component with Convex-aware helpers.
export const authComponent = createClient(components.betterAuth);

// createAuth is called per-request inside Convex HTTP actions.
export const createAuth: CreateAuth = (ctx) => {
  const options: BetterAuthOptions = {
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false
    },
    // Uncomment and set env vars to enable GitHub OAuth:
    // socialProviders: {
    //   github: {
    //     enabled: true,
    //     clientId: process.env.GITHUB_CLIENT_ID as string,
    //     clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    //   },
    //   google: {
    //     enabled: true,
    //     clientId: process.env.GOOGLE_CLIENT_ID as string,
    //     clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    //   },
    // },
    plugins: [
      // Required: wires Convex JWT issuance and session validation
      convex({
        authConfig,
        jwksRotateOnTokenGenerationError: true
      })
    ]
  };

  return betterAuth(options);
};

/** Returns the currently authenticated user, or null if not signed in. */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.safeGetAuthUser(ctx);
  }
});
