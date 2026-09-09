declare global {
  namespace Express {
    interface Request {
      /** Set by requireUser from the gateway-injected X-User-Id header. */
      ownerId?: string;
      /** Set by requireDevice once a node agent's signature verifies. */
      deviceId?: string;
      /** Vault the authenticated device belongs to. */
      vaultId?: string;
      /**
       * Exact request body as received. Device signatures cover the body, so
       * the parsed object is not sufficient to verify them.
       */
      rawBody?: string;
    }
  }
}

export {};
