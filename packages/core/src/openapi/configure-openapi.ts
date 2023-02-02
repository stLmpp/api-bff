import { type Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { type OpenAPIObject, type PathsObject } from 'openapi3-ts';
import { serve, setup } from 'swagger-ui-express';

import { getConfig } from '../config/config.js';

export async function configure_openapi(
  router: Router,
  paths: PathsObject
): Promise<void> {
  const config = await getConfig();
  if (!config.openapi) {
    return;
  }
  const { openapi, prefix } = config;
  const openapi_object: OpenAPIObject = {
    openapi: '3.0.2',
    paths,
    info: {
      title: openapi.title,
      version: openapi.version,
      description: openapi.description,
      contact: openapi.contact,
      termsOfService: openapi.termsOfService,
      license: openapi.license,
    },
    tags: openapi.tags,
    externalDocs: openapi.externalDocs,
    security: openapi.security,
    servers: openapi.servers,
  };
  console.log(`Registering end-point: [GET] ${prefix ?? ''}${openapi.path}`);
  console.log(
    `Registering end-point: [GET] ${prefix ?? ''}${openapi.path}/swagger.json`
  );
  router
    .get(`${openapi.path}/swagger.json`, (_, res) => {
      res.status(StatusCodes.OK).send(openapi_object);
    })
    .use(
      openapi.path,
      serve,
      setup(openapi_object, {
        swaggerOptions: {
          displayRequestDuration: true,
          persistAuthorization: true,
        },
      })
    );
}
