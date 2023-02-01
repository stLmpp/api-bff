import { type ChildProcess, spawn } from 'child_process';

import { type Plugin } from 'esbuild';

export function typecheckingPlugin(): Plugin {
  return {
    name: 'typechecking',
    setup: (build) => {
      let program: ChildProcess | null = null;
      const clearProgram = (): void => {
        if (program) {
          program.kill();
          program = null;
        }
      };
      build.onEnd(() => {
        clearProgram();
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
        clearProgram();
      });
    },
  };
}
