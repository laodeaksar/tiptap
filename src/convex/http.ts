// NOTE: This file requires `npx convex dev` to have been run first
// so that `./_generated/api` exists.
import { httpRouter } from 'convex/server';
import { authComponent, createAuth } from './auth';

const http = httpRouter();

// Register all Better Auth routes (sign-in, sign-up, sessions, OAuth, etc.)
authComponent.registerRoutes(http, createAuth);

export default http;
