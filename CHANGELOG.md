# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.2.0](https://github.com/stLmpp/api-bff/compare/v0.1.6...v0.2.0) (2023-02-19)

### Features

- **cli:** added new command generate, to help generate files in the project ([8bf0dc6](https://github.com/stLmpp/api-bff/commits/8bf0dc67814d111efa3995eb533686aa2c112153))
- **core:** added http methods as methods in the HttpClient abstract class ([a5cf963](https://github.com/stLmpp/api-bff/commits/a5cf963c779510eb8399005b5d9e9bf811488d58))

- added changelog ([32226f3](https://github.com/stLmpp/api-bff/commits/32226f3a4977fc85065447c56da9e8d83a179afd))
- **cli:** removed TODO ([df53584](https://github.com/stLmpp/api-bff/commits/df535849ef6ae533d156823bfd12c44bcd9bdf0b))
- **core:** added fs-extra and replaced path_exists method with pathExists ([f1a6f0b](https://github.com/stLmpp/api-bff/commits/f1a6f0b404eb94157243ebd09b1e2ef46edc4b56))
- override clone method on HttpClientResponse ([a60cbbc](https://github.com/stLmpp/api-bff/commits/a60cbbc8be5f96b18f827ec09fba73c26815e55a))
- revert CHANGELOG deleted ([bcb574f](https://github.com/stLmpp/api-bff/commits/bcb574f80d9eb0eb6d2d6fb91d764de36ae882f4))
- update dependencies ([437cb7c](https://github.com/stLmpp/api-bff/commits/437cb7cc06d2c7d00e5e58d70ae629feea49732e))
- updated dependencies ([ce294b5](https://github.com/stLmpp/api-bff/commits/ce294b59dab6bff7381d06d9d9f4f683dcdd56b9))

## [0.1.6](https://github.com/stLmpp/api-bff/compare/v0.1.5...v0.1.6) (2023-02-05)

## [0.1.5](https://github.com/stLmpp/api-bff/compare/v0.1.3...v0.1.5) (2023-02-05)

### Bug Fixes

- **core:** body was not being used in the HttpClientFetch ([fa9e7e0](https://github.com/stLmpp/api-bff/commit/fa9e7e0dd303f7cf9f053366740f0a6adf82893a))

## [0.1.3](https://github.com/stLmpp/api-bff/compare/v0.1.2...v0.1.3) (2023-02-03)

### Bug Fixes

- **core:** include correct files in the npm publish ([268bfd4](https://github.com/stLmpp/api-bff/commit/268bfd4573cc7ab7a7c3e421c691b0c8c41134ba))

## [0.1.2](https://github.com/stLmpp/api-bff/compare/v0.1.1...v0.1.2) (2023-02-03)

### Bug Fixes

- **cli:** fix version of @api-bff/core dependency ([e929765](https://github.com/stLmpp/api-bff/commit/e9297652aca8007a230192f41d7e386962d76f15))

## [0.1.1](https://github.com/stLmpp/api-bff/compare/d1ee50394f8de8df9936cf244732980c48632558...v0.1.1) (2023-02-03)

### Bug Fixes

- **all:** fix all return type eslint errors ([fb5a841](https://github.com/stLmpp/api-bff/commit/fb5a8411660b5a379a7db04a8c52acb55fe7af0b))
- **cli:** add sideEffects = false to package.json template ([3d865c9](https://github.com/stLmpp/api-bff/commit/3d865c9d5d9f70a484622d4a245a87ffac3f8a36))
- **cli:** fixed devDependency that should be depencency ([dc1900b](https://github.com/stLmpp/api-bff/commit/dc1900b107d0817c60039ae512ce5ac72042aaa2))
- **core:** delete RequestSchema to fix typing issues ([d1ee503](https://github.com/stLmpp/api-bff/commit/d1ee50394f8de8df9936cf244732980c48632558))
- **core:** expiry date should not be null when ttl is fasly, it would cause an error of never invalidating a cache that was created before the ttl change ([7a0cb93](https://github.com/stLmpp/api-bff/commit/7a0cb93cb3fbb362478a10e1e46e54b66ba168f0))
- **core:** fix ApiConfig type ([e874317](https://github.com/stLmpp/api-bff/commit/e874317187d3c406c2fb74fea4f8e55bd60b2ba3))
- **core:** register openapi route before other routes ([2d2d321](https://github.com/stLmpp/api-bff/commit/2d2d3213d6f66189f7d3b55ba9a1c26aae7d68d9))
- **core:** validate_body should always return a string ([d9971a2](https://github.com/stLmpp/api-bff/commit/d9971a2840f9ace7805c2776ec60a60b399a0ab9))

### Features

- **all:** added husky ([5908adf](https://github.com/stLmpp/api-bff/commit/5908adf284bff5b11b3a82fe382a727daca32715))
- **cli:** added comments to the template files ([8fd4657](https://github.com/stLmpp/api-bff/commit/8fd4657635bcb2ca4a468a3604229261a39b8dc7))
- **cli:** added more options to the NewCommand ([66e1626](https://github.com/stLmpp/api-bff/commit/66e162652728741b0bfec7c3346edb1750978847))
- **cli:** added one more example of end-point ([30a0de1](https://github.com/stLmpp/api-bff/commit/30a0de16280c3afe692c423e690fc72c326bd07d))
- **cli:** added unit testing with vitest ([7310923](https://github.com/stLmpp/api-bff/commit/7310923b190eb40e1c0f503ed4045f81de34f2f5))
- **cli:** added vitest as the default testing library in the scaffold ([f4bae41](https://github.com/stLmpp/api-bff/commit/f4bae41a03aeaa123847a68acf43945f95f0f58e))
- **cli:** changed how the options of NewCommand are presented ([7c1d41c](https://github.com/stLmpp/api-bff/commit/7c1d41c5050e53de40fc95e8d1cd4703ecd4280c))
- **cli:** started implementation of new project scaffold ([c6681ab](https://github.com/stLmpp/api-bff/commit/c6681abeff1a83c5a09a27d3158cabb9c1351a45))
- **cli:** started working on the CLI ([288f72e](https://github.com/stLmpp/api-bff/commit/288f72ebdca9a564a6919aba1415d3e22dcf3c81))
- **core:** added end-point to get the swagger schema ([eb83434](https://github.com/stLmpp/api-bff/commit/eb834349d3a15dbc3209bb00aa0993d2a3b14781))
- **core:** added vitest ([af03b52](https://github.com/stLmpp/api-bff/commit/af03b521ab9f449403b1e8ebf893b5bb70a8a655))
- **core:** do not minify identifiers to help the debugging experience (needs discussion... but since I'm the only one working here, I think I'll keep it this way) ([038da80](https://github.com/stLmpp/api-bff/commit/038da80b1a932755fcb6a95688c095ebc696d01c))
- **core:** increase coverage ([1a7049b](https://github.com/stLmpp/api-bff/commit/1a7049b2d280c9649b1f7703309d861a075adc34))
