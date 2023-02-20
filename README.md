# api-bff

// TODO add description here

The project is in its early development stages,
but basically it is a way
to simplify the creation of a [BFF (Backend for frontend)](https://www.linkedin.com/pulse/bff-backend-frontend-pattern-microservices-arpit-bhayani/) or a [Aggregator/Proxy](https://medium.com/nerd-for-tech/design-patterns-for-microservices-aggregator-pattern-99c122ac6b73).
API BFF uses file-system based routes to create the end-points, and [Zod](https://zod.dev/) for data validation.

## Getting started

`npm install @api-bff/cli -g`

To create a new application with the CLI, use `bff new my-application`.

Currently, there are two pacakges to help create the BFF:

| Package | Version | State |
| - | - | - |
| [@api-bff/core](packages/core/README.md) | 0.2.0 | Alpha |
| [@api-bff/cli](packages/cli/README.md) | 0.2.0 | Alpha |
