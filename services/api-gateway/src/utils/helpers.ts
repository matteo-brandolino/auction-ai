import { Application } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";

/**
 * Helper to create authenticated proxy for a service
 */
export const createProtectedProxy = (
  app: Application,
  path: string,
  targetUrl: string | undefined
) => {
  if (!targetUrl) {
    console.error(`⚠️  Missing target URL for ${path}`);
    return;
  }

  // Apply authentication
  app.use(path, authMiddleware);

  // Create proxy
  app.use(
    createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      logger: console,
      pathFilter: `${path}/**`,
      on: {
        proxyReq: fixRequestBody,
      },
    })
  );

  console.log(`✅ Protected proxy registered: ${path} -> ${targetUrl}`);
};

/**
 * Helper to create public proxy for a service
 */
export const createPublicProxy = (
  app: Application,
  path: string,
  targetUrl: string | undefined
) => {
  if (!targetUrl) {
    console.error(`⚠️  Missing target URL for ${path}`);
    return;
  }

  app.use(
    createProxyMiddleware({
      target: targetUrl,
      changeOrigin: true,
      logger: console,
      pathFilter: `${path}/**`,
      on: {
        proxyReq: fixRequestBody,
      },
    })
  );

  console.log(`✅ Public proxy registered: ${path} -> ${targetUrl}`);
};
