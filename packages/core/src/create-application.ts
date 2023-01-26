import compression from 'compression';
import express, { type Express, json, Router } from 'express';
import fastGlob from 'fast-glob';
import helmet from 'helmet';
import { type PathsObject } from 'openapi3-ts';

import { getConfig } from './config/config.js';
import { EXTENSION, ROUTES } from './constants.js';
import { errorMiddleware } from './error-middleware.js';
import { initApiConfig } from './init-api-config.js';
import { notFoundMiddleware } from './not-found-middleware.js';
import { configureOpenapi } from './openapi/configure-openapi.js';
import { formatEndPoint } from './openapi/format-end-point.js';

export async function createApplication(): Promise<Express> {
  const server = express().use(helmet()).use(compression()).use(json());
  const config = await getConfig();
  const middleGlob = '/**/{GET,POST,PUT,PATCH,DELETE}';
  const globPath = `${ROUTES}${middleGlob}.${EXTENSION}`;
  const paths = await fastGlob(globPath);
  const middlewares = await Promise.all(
    paths.map((path) => initApiConfig(path))
  );
  const middlewaresSorted = [...middlewares].sort(
    ([endPointA], [endPointB]) => endPointB.length - endPointA.length
  );
  const openapiPaths: PathsObject = {};
  const router = Router();
  for (const [endPoint, handler, meta] of middlewaresSorted) {
    const finalEndPoint = `${config.prefix}${endPoint}`;
    console.log(
      `Registering end-point: [${meta.method.toUpperCase()}] ${finalEndPoint}`
    );
    router.use(endPoint, handler);
    if (meta.openapi) {
      const endPointOpenapi = formatEndPoint(endPoint);
      openapiPaths[endPointOpenapi] = {
        ...openapiPaths[endPointOpenapi],
        ...meta.openapi,
      };
    }
  }
  await configureOpenapi(router, openapiPaths);
  server.use(config.prefix ?? '/', router);
  return server.use(notFoundMiddleware()).use(errorMiddleware());
}
