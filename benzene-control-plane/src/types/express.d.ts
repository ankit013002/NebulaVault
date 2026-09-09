declare global {
  namespace Express {
    interface Request {
      /** Set by requireUser from the gateway-injected X-User-Id header. */
      ownerId?: string;
    }
  }
}

export {};
