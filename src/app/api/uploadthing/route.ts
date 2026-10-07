/**
 * Uploadthing App Router Route Handler
 * 
 * @agent engineering-backend-architect
 */

import { createRouteHandler } from 'uploadthing/next';
import { ourFileRouter } from './core';

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    token: process.env.UPLOADTHING_TOKEN,
  },
});
