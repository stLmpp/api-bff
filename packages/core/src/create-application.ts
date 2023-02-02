import compression from 'compression';
import express, { type Express, json, Router } from 'express';
import fastGlob from 'fast-glob';
import helmet from 'helmet';
import { type PathsObject } from 'openapi3-ts';

import { getConfig } from './config/config.js';
import { EXTENSION, ROUTES } from './constants.js';
import { error_middleware } from './error-middleware.js';
import { init_api_config } from './init-api-config.js';
import { not_found_middleware } from './not-found-middleware.js';
import { configure_openapi } from './openapi/configure-openapi.js';
import { format_end_point_openapi } from './openapi/format-end-point.js';

/**
 * @public
 */
export async function createApplication(): Promise<Express> {
  const server = express().use(helmet()).use(compression()).use(json());
  const config = await getConfig();
  const glob_path = `${ROUTES}/**/{GET,POST,PUT,PATCH,DELETE}.${EXTENSION}`;
  const paths = await fastGlob(glob_path);
  let handlers = await Promise.all(paths.map((path) => init_api_config(path)));
  handlers = [...handlers].sort(
    ([endPointA], [endPointB]) => endPointB.length - endPointA.length
  );
  const openapi_paths: PathsObject = {};
  const router = Router();
  for (const [end_points, handler, meta] of handlers) {
    const final_end_point = `${config.prefix}${end_points}`;
    console.log(
      `Registering end-point: [${meta.method.toUpperCase()}] ${final_end_point}`
    );
    router.use(end_points, handler);
    if (meta.openapi) {
      const end_point_openapi = format_end_point_openapi(final_end_point);
      openapi_paths[end_point_openapi] = {
        ...openapi_paths[end_point_openapi],
        ...meta.openapi,
      };
    }
  }
  const router_openapi = Router();
  await configure_openapi(router_openapi, openapi_paths);
  server
    .use(config.prefix ?? '/', router_openapi)
    .use(config.prefix ?? '/', router);
  return server.use(not_found_middleware()).use(error_middleware());
}
