import { type ChildProcess, spawn } from 'child_process';

import { type Plugin } from 'esbuild';

export function typechecking_plugin(): Plugin {
  return {
    name: 'typechecking',
    setup: (build) => {
      let program: ChildProcess | null = null;
      const clear_program = (): void => {
        if (program) {
          program.kill();
          program = null;
        }
      };
      build.onEnd(() => {
        clear_program();
        program = spawn(
          'node',
          ['node_modules/typescript/bin/tsc', '--noEmit'],
          {
            env: process.env,
            stdio: 'inherit',
          }
        );
      });
      build.onDispose(() => {
        clear_program();
      });
    },
  };
}
