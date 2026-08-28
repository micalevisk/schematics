import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import { readFileSync } from 'fs';
import * as path from 'path';
import type { ApplicationOptions } from './application.schema.js';

describe('Application Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  describe('when only the name is supplied', () => {
    it('should manage basic (ie., cross-platform) name', async () => {
      const options: ApplicationOptions = {
        name: 'project',
        type: 'cjs',
      };
      const tree: UnitTestTree = await runner.runSchematic(
        'application',
        options,
      );

      const files: string[] = tree.files;
      expect(files.sort()).toEqual(
        [
          '/project/oxlint.json',
          '/project/.gitignore',
          '/project/.prettierrc',
          '/project/README.md',
          '/project/jest.config.ts',
          '/project/nest-cli.json',
          '/project/package.json',
          '/project/tsconfig.build.json',
          '/project/tsconfig.json',
          '/project/src/app.controller.spec.ts',
          '/project/src/app.controller.ts',
          '/project/src/app.module.ts',
          '/project/src/app.service.ts',
          '/project/src/main.ts',
          '/project/test/app.e2e-spec.ts',
          '/project/test/jest-e2e.json',
        ].sort(),
      );

      expect(
        JSON.parse(tree.readContent('/project/package.json')),
      ).toMatchObject({
        name: 'project',
      });

      expect(
        JSON.parse(tree.readContent('/project/tsconfig.json')),
      ).toMatchObject({
        compilerOptions: {
          types: ['node', 'jest'],
        },
      });
    });
    it('should manage name with dots in it', async () => {
      const options: ApplicationOptions = {
        name: 'project.foo.bar',
        type: 'cjs',
      };
      const tree: UnitTestTree = await runner.runSchematic(
        'application',
        options,
      );
      const files: string[] = tree.files;
      expect(files.sort()).toEqual(
        [
          `/project.foo.bar/oxlint.json`,
          `/project.foo.bar/.gitignore`,
          `/project.foo.bar/.prettierrc`,
          `/project.foo.bar/README.md`,
          `/project.foo.bar/jest.config.ts`,
          `/project.foo.bar/nest-cli.json`,
          `/project.foo.bar/package.json`,
          `/project.foo.bar/tsconfig.build.json`,
          `/project.foo.bar/tsconfig.json`,
          `/project.foo.bar/src/app.controller.spec.ts`,
          `/project.foo.bar/src/app.controller.ts`,
          `/project.foo.bar/src/app.module.ts`,
          `/project.foo.bar/src/app.service.ts`,
          `/project.foo.bar/src/main.ts`,
          `/project.foo.bar/test/app.e2e-spec.ts`,
          `/project.foo.bar/test/jest-e2e.json`,
        ].sort(),
      );

      expect(
        JSON.parse(tree.readContent('/project.foo.bar/package.json')),
      ).toMatchObject({
        name: 'project.foo.bar',
      });
    });
    it('should manage name to normalize from camel case name', async () => {
      const options: ApplicationOptions = {
        name: 'awesomeProject',
        type: 'cjs',
      };
      const tree: UnitTestTree = await runner.runSchematic(
        'application',
        options,
      );
      const files: string[] = tree.files;
      expect(files.sort()).toEqual(
        [
          '/awesome-project/oxlint.json',
          '/awesome-project/.gitignore',
          '/awesome-project/.prettierrc',
          '/awesome-project/README.md',
          '/awesome-project/jest.config.ts',
          '/awesome-project/nest-cli.json',
          '/awesome-project/package.json',
          '/awesome-project/tsconfig.build.json',
          '/awesome-project/tsconfig.json',
          '/awesome-project/src/app.controller.spec.ts',
          '/awesome-project/src/app.controller.ts',
          '/awesome-project/src/app.module.ts',
          '/awesome-project/src/app.service.ts',
          '/awesome-project/src/main.ts',
          '/awesome-project/test/app.e2e-spec.ts',
          '/awesome-project/test/jest-e2e.json',
        ].sort(),
      );

      expect(
        JSON.parse(tree.readContent('/awesome-project/package.json')),
      ).toMatchObject({
        name: 'awesome-project',
      });
    });
    it('should keep underscores', async () => {
      const options: ApplicationOptions = {
        name: '_awesomeProject',
        type: 'cjs',
      };
      const tree: UnitTestTree = await runner.runSchematic(
        'application',
        options,
      );
      const files: string[] = tree.files;
      expect(files.sort()).toEqual(
        [
          '/_awesome-project/oxlint.json',
          '/_awesome-project/.gitignore',
          '/_awesome-project/.prettierrc',
          '/_awesome-project/README.md',
          '/_awesome-project/jest.config.ts',
          '/_awesome-project/nest-cli.json',
          '/_awesome-project/package.json',
          '/_awesome-project/tsconfig.build.json',
          '/_awesome-project/tsconfig.json',
          '/_awesome-project/src/app.controller.spec.ts',
          '/_awesome-project/src/app.controller.ts',
          '/_awesome-project/src/app.module.ts',
          '/_awesome-project/src/app.service.ts',
          '/_awesome-project/src/main.ts',
          '/_awesome-project/test/app.e2e-spec.ts',
          '/_awesome-project/test/jest-e2e.json',
        ].sort(),
      );

      expect(
        JSON.parse(tree.readContent('/_awesome-project/package.json')),
      ).toMatchObject({
        name: '_awesome-project',
      });
    });
    it('should manage basic name that has no scope name in it but starts with "@"', async () => {
      const options: ApplicationOptions = {
        name: '@/package',
        type: 'cjs',
      };
      const tree: UnitTestTree = await runner.runSchematic(
        'application',
        options,
      );
      const files: string[] = tree.files;
      expect(files.sort()).toEqual(
        [
          '/@/package/oxlint.json',
          '/@/package/.gitignore',
          '/@/package/.prettierrc',
          '/@/package/README.md',
          '/@/package/jest.config.ts',
          '/@/package/nest-cli.json',
          '/@/package/package.json',
          '/@/package/tsconfig.build.json',
          '/@/package/tsconfig.json',
          '/@/package/src/app.controller.spec.ts',
          '/@/package/src/app.controller.ts',
          '/@/package/src/app.module.ts',
          '/@/package/src/app.service.ts',
          '/@/package/src/main.ts',
          '/@/package/test/app.e2e-spec.ts',
          '/@/package/test/jest-e2e.json',
        ].sort(),
      );

      expect(
        JSON.parse(tree.readContent('/@/package/package.json')),
      ).toMatchObject({
        name: 'package',
      });
    });
    it('should manage the name "." (ie., current working directory)', async () => {
      const options: ApplicationOptions = {
        name: '.',
        type: 'cjs',
      };
      const tree: UnitTestTree = await runner.runSchematic(
        'application',
        options,
      );
      const files: string[] = tree.files;
      expect(files.sort()).toEqual(
        [
          '/oxlint.json',
          '/.gitignore',
          '/.prettierrc',
          '/README.md',
          '/jest.config.ts',
          '/nest-cli.json',
          '/package.json',
          '/tsconfig.build.json',
          '/tsconfig.json',
          '/src/app.controller.spec.ts',
          '/src/app.controller.ts',
          '/src/app.module.ts',
          '/src/app.service.ts',
          '/src/main.ts',
          '/test/app.e2e-spec.ts',
          '/test/jest-e2e.json',
        ].sort(),
      );

      expect(JSON.parse(tree.readContent('/package.json'))).toMatchObject({
        name: path.basename(process.cwd()),
      });
    });
    describe('and it meant to be a scoped package', () => {
      describe('that leads to a valid scope name', () => {
        it('should manage basic name', async () => {
          const options: ApplicationOptions = {
            name: '@scope/package',
            type: 'cjs',
          };
          const tree: UnitTestTree = await runner.runSchematic(
            'application',
            options,
          );
          const files: string[] = tree.files;
          expect(files.sort()).toEqual(
            [
              '/@scope/package/oxlint.json',
              '/@scope/package/.gitignore',
              '/@scope/package/.prettierrc',
              '/@scope/package/README.md',
              '/@scope/package/jest.config.ts',
              '/@scope/package/nest-cli.json',
              '/@scope/package/package.json',
              '/@scope/package/tsconfig.build.json',
              '/@scope/package/tsconfig.json',
              '/@scope/package/src/app.controller.spec.ts',
              '/@scope/package/src/app.controller.ts',
              '/@scope/package/src/app.module.ts',
              '/@scope/package/src/app.service.ts',
              '/@scope/package/src/main.ts',
              '/@scope/package/test/app.e2e-spec.ts',
              '/@scope/package/test/jest-e2e.json',
            ].sort(),
          );

          expect(
            JSON.parse(tree.readContent('/@scope/package/package.json')),
          ).toMatchObject({
            name: '@scope/package',
          });
        });
        it('should manage name with blank space right after the "@" symbol', async () => {
          const options: ApplicationOptions = {
            name: '@ /package',
            type: 'cjs',
          };
          const tree: UnitTestTree = await runner.runSchematic(
            'application',
            options,
          );
          const files: string[] = tree.files;
          expect(files.sort()).toEqual(
            [
              '/@-/package/oxlint.json',
              '/@-/package/.gitignore',
              '/@-/package/.prettierrc',
              '/@-/package/README.md',
              '/@-/package/jest.config.ts',
              '/@-/package/nest-cli.json',
              '/@-/package/package.json',
              '/@-/package/tsconfig.build.json',
              '/@-/package/tsconfig.json',
              '/@-/package/src/app.controller.spec.ts',
              '/@-/package/src/app.controller.ts',
              '/@-/package/src/app.module.ts',
              '/@-/package/src/app.service.ts',
              '/@-/package/src/main.ts',
              '/@-/package/test/app.e2e-spec.ts',
              '/@-/package/test/jest-e2e.json',
            ].sort(),
          );

          expect(
            JSON.parse(tree.readContent('/@-/package/package.json')),
          ).toMatchObject({
            name: '@-/package',
          });
        });
      });
    });
  });
  it('should manage name as number', async () => {
    const options: ApplicationOptions = {
      name: 123,
      type: 'cjs',
    };
    const tree: UnitTestTree = await runner.runSchematic(
      'application',
      options,
    );

    const files: string[] = tree.files;
    expect(files.sort()).toEqual(
      [
        '/123/oxlint.json',
        '/123/.gitignore',
        '/123/.prettierrc',
        '/123/README.md',
        '/123/jest.config.ts',
        '/123/nest-cli.json',
        '/123/package.json',
        '/123/tsconfig.build.json',
        '/123/tsconfig.json',
        '/123/src/app.controller.spec.ts',
        '/123/src/app.controller.ts',
        '/123/src/app.module.ts',
        '/123/src/app.service.ts',
        '/123/src/main.ts',
        '/123/test/app.e2e-spec.ts',
        '/123/test/jest-e2e.json',
      ].sort(),
    );

    expect(JSON.parse(tree.readContent('/123/package.json'))).toMatchObject({
      name: '123',
    });
  });
  it('should manage javascript files', async () => {
    const options: ApplicationOptions = {
      name: 'project',
      language: 'js',
    };
    const tree: UnitTestTree = await runner.runSchematic(
      'application',
      options,
    );

    const files: string[] = tree.files;
    expect(files.sort()).toEqual(
      [
        '/project/.babelrc',
        '/project/.gitignore',
        '/project/.prettierrc',
        '/project/README.md',
        '/project/index.js',
        '/project/jest.config.js',
        '/project/jsconfig.json',
        '/project/nest-cli.json',
        '/project/nodemon.json',
        '/project/package.json',
        '/project/src/app.controller.js',
        '/project/src/app.controller.spec.js',
        '/project/src/app.module.js',
        '/project/src/app.service.js',
        '/project/src/main.js',
        '/project/test/app.e2e-spec.js',
        '/project/test/jest-e2e.json',
      ].sort(),
    );

    expect(JSON.parse(tree.readContent('/project/package.json'))).toMatchObject(
      {
        name: 'project',
      },
    );
  });
  it('should manage destination directory', async () => {
    const options: ApplicationOptions = {
      name: 'project',
      directory: 'app',
      type: 'cjs',
    };
    const tree: UnitTestTree = await runner.runSchematic(
      'application',
      options,
    );

    const files: string[] = tree.files;
    expect(files.sort()).toEqual(
      [
        '/app/oxlint.json',
        '/app/.gitignore',
        '/app/.prettierrc',
        '/app/README.md',
        '/app/jest.config.ts',
        '/app/nest-cli.json',
        '/app/package.json',
        '/app/tsconfig.build.json',
        '/app/tsconfig.json',
        '/app/src/app.controller.spec.ts',
        '/app/src/app.controller.ts',
        '/app/src/app.module.ts',
        '/app/src/app.service.ts',
        '/app/src/main.ts',
        '/app/test/app.e2e-spec.ts',
        '/app/test/jest-e2e.json',
      ].sort(),
    );

    expect(JSON.parse(tree.readContent('/app/package.json'))).toMatchObject({
      name: 'project',
    });
  });
  it('should not create a spec file', async () => {
    const options: ApplicationOptions = {
      name: 'project',
      spec: false,
      language: 'js',
    };
    const tree: UnitTestTree = await runner.runSchematic(
      'application',
      options,
    );

    const files: string[] = tree.files;
    expect(files.sort()).toEqual(
      [
        '/project/.babelrc',
        '/project/.gitignore',
        '/project/.prettierrc',
        '/project/README.md',
        '/project/index.js',
        '/project/jest.config.js',
        '/project/jsconfig.json',
        '/project/nest-cli.json',
        '/project/nodemon.json',
        '/project/package.json',
        '/project/src/app.controller.js',
        '/project/src/app.module.js',
        '/project/src/app.service.js',
        '/project/src/main.js',
        '/project/test/jest-e2e.json',
      ].sort(),
    );
  });
  it('should create a spec file', async () => {
    const options: ApplicationOptions = {
      name: 'project',
      spec: true,
      language: 'js',
    };
    const tree: UnitTestTree = await runner.runSchematic(
      'application',
      options,
    );

    const files: string[] = tree.files;
    expect(files.sort()).toEqual(
      [
        '/project/.babelrc',
        '/project/.gitignore',
        '/project/.prettierrc',
        '/project/README.md',
        '/project/index.js',
        '/project/jest.config.js',
        '/project/jsconfig.json',
        '/project/nest-cli.json',
        '/project/nodemon.json',
        '/project/package.json',
        '/project/src/app.controller.js',
        '/project/src/app.controller.spec.js',
        '/project/src/app.module.js',
        '/project/src/app.service.js',
        '/project/src/main.js',
        '/project/test/app.e2e-spec.js',
        '/project/test/jest-e2e.json',
      ].sort(),
    );
  });
  it('should create a spec file with custom file suffix', async () => {
    const options: ApplicationOptions = {
      name: 'project',
      spec: true,
      specFileSuffix: 'test',
      type: 'cjs',
    };
    const tree: UnitTestTree = await runner.runSchematic(
      'application',
      options,
    );

    const files: string[] = tree.files;
    expect(files.sort()).toEqual(
      [
        '/project/oxlint.json',
        '/project/.gitignore',
        '/project/.prettierrc',
        '/project/README.md',
        '/project/jest.config.ts',
        '/project/nest-cli.json',
        '/project/package.json',
        '/project/tsconfig.build.json',
        '/project/tsconfig.json',
        '/project/src/app.controller.test.ts',
        '/project/src/app.controller.ts',
        '/project/src/app.module.ts',
        '/project/src/app.service.ts',
        '/project/src/main.ts',
        '/project/test/app.e2e-test.ts',
        '/project/test/jest-e2e.json',
      ].sort(),
    );
  });
  it('should propagate a custom spec file suffix to the test runner configs', async () => {
    const options: ApplicationOptions = {
      name: 'project',
      spec: true,
      specFileSuffix: 'test',
      type: 'cjs',
    };
    const tree: UnitTestTree = await runner.runSchematic(
      'application',
      options,
    );

    expect(tree.readContent('/project/jest.config.ts')).toContain(
      "testRegex: '.*\\\\.test\\\\.ts$'",
    );
    expect(
      JSON.parse(tree.readContent('/project/test/jest-e2e.json')).testRegex,
    ).toEqual('.e2e-test.ts$');
    expect(
      JSON.parse(tree.readContent('/project/tsconfig.build.json')).exclude,
    ).toContain('**/*test.ts');
  });
  it('should limit the build tsconfig to src so the entry point stays at dist/main', async () => {
    const options: ApplicationOptions = {
      name: 'project',
      type: 'cjs',
    };
    const tree: UnitTestTree = await runner.runSchematic(
      'application',
      options,
    );

    expect(
      JSON.parse(tree.readContent('/project/tsconfig.build.json')).include,
    ).toEqual(['src']);
  });
  describe('when type is "esm"', () => {
    it('should generate ESM project files with vitest', async () => {
      const options: ApplicationOptions = {
        name: 'project',
        type: 'esm',
      };
      const tree: UnitTestTree = await runner.runSchematic(
        'application',
        options,
      );

      const files: string[] = tree.files;
      expect(files.sort()).toEqual(
        [
          '/project/oxlint.json',
          '/project/.gitignore',
          '/project/.prettierrc',
          '/project/README.md',
          '/project/nest-cli.json',
          '/project/package.json',
          '/project/tsconfig.build.json',
          '/project/tsconfig.json',
          '/project/src/app.controller.spec.ts',
          '/project/src/app.controller.ts',
          '/project/src/app.module.ts',
          '/project/src/app.service.ts',
          '/project/src/main.ts',
          '/project/test/app.e2e-spec.ts',
          '/project/vitest.config.ts',
          '/project/vitest.config.e2e.ts',
        ].sort(),
      );
    });

    it('should generate ESM package.json with type module and vitest', async () => {
      const options: ApplicationOptions = {
        name: 'project',
        type: 'esm',
      };
      const tree: UnitTestTree = await runner.runSchematic(
        'application',
        options,
      );

      const packageJson = JSON.parse(tree.readContent('/project/package.json'));
      expect(packageJson.type).toBe('module');
      expect(packageJson.devDependencies).toHaveProperty('vitest');
      expect(packageJson.devDependencies).not.toHaveProperty('unplugin-swc');
      // `test:cov` is unusable without an explicit coverage provider
      expect(packageJson.devDependencies).toHaveProperty('@vitest/coverage-v8');
      expect(packageJson.devDependencies).not.toHaveProperty('@swc/core');
      expect(packageJson.devDependencies).not.toHaveProperty('jest');
      expect(packageJson.devDependencies).not.toHaveProperty('ts-jest');
      expect(packageJson.devDependencies).not.toHaveProperty('@types/jest');
      expect(packageJson.devDependencies).not.toHaveProperty('ts-node');
      expect(packageJson.devDependencies).not.toHaveProperty('tsconfig-paths');
      expect(packageJson.devDependencies).toHaveProperty('oxlint');
      expect(packageJson.devDependencies).not.toHaveProperty('eslint');
      expect(packageJson.scripts.test).toBe('vitest run');
      expect(packageJson.scripts['test:e2e']).toBe(
        'vitest run --config ./vitest.config.e2e.ts',
      );
    });

    it('should generate ESM source files with .js import extensions', async () => {
      const options: ApplicationOptions = {
        name: 'project',
        type: 'esm',
      };
      const tree: UnitTestTree = await runner.runSchematic(
        'application',
        options,
      );

      const mainContent = tree.readContent('/project/src/main.ts');
      expect(mainContent).toContain("from './app.module.js'");

      const moduleContent = tree.readContent('/project/src/app.module.ts');
      expect(moduleContent).toContain("from './app.controller.js'");
      expect(moduleContent).toContain("from './app.service.js'");

      const controllerContent = tree.readContent(
        '/project/src/app.controller.ts',
      );
      expect(controllerContent).toContain("from './app.service.js'");
    });

    it('should generate oxlint.json config', async () => {
      const options: ApplicationOptions = {
        name: 'project',
        type: 'esm',
      };
      const tree: UnitTestTree = await runner.runSchematic(
        'application',
        options,
      );

      const oxlintContent = tree.readContent('/project/oxlint.json');
      const oxlintConfig = JSON.parse(oxlintContent);
      expect(oxlintConfig.rules).toBeDefined();
    });

    it('should generate CJS project files with jest', async () => {
      const options: ApplicationOptions = {
        name: 'project',
        type: 'cjs',
      };
      const tree: UnitTestTree = await runner.runSchematic(
        'application',
        options,
      );

      const files: string[] = tree.files;
      expect(files).toContain('/project/test/jest-e2e.json');
      expect(files).toContain('/project/jest.config.ts');
      expect(files).not.toContain('/project/vitest.config.ts');

      const packageJson = JSON.parse(tree.readContent('/project/package.json'));
      expect(packageJson.type).toBeUndefined();
      expect(packageJson.devDependencies).toHaveProperty('jest');
      expect(packageJson.devDependencies).toHaveProperty('oxlint');
      expect(packageJson.devDependencies).not.toHaveProperty('eslint');
    });
  });

  describe('when createApplication is false', () => {
    describe('and the module type is "esm" (default)', () => {
      it('should generate an empty workspace with no application sources', async () => {
        const options: ApplicationOptions = {
          name: 'workspace',
          type: 'esm',
          createApplication: false,
        };
        const tree: UnitTestTree = await runner.runSchematic(
          'application',
          options,
        );

        const files: string[] = tree.files;
        expect(files.sort()).toEqual(
          [
            '/workspace/.gitignore',
            '/workspace/.prettierrc',
            '/workspace/README.md',
            '/workspace/nest-cli.json',
            '/workspace/oxlint.json',
            '/workspace/package.json',
            '/workspace/tsconfig.json',
            '/workspace/vitest.config.e2e.ts',
            '/workspace/vitest.config.ts',
          ].sort(),
        );
        expect(files.some((file) => file.startsWith('/workspace/src/'))).toBe(
          false,
        );
        expect(files.some((file) => file.startsWith('/workspace/test/'))).toBe(
          false,
        );
        expect(files).not.toContain('/workspace/tsconfig.build.json');
      });

      it('should declare an empty monorepo in nest-cli.json with no default project', async () => {
        const options: ApplicationOptions = {
          name: 'workspace',
          type: 'esm',
          createApplication: false,
        };
        const tree: UnitTestTree = await runner.runSchematic(
          'application',
          options,
        );

        const nestCli = JSON.parse(
          tree.readContent('/workspace/nest-cli.json'),
        );
        expect(nestCli.monorepo).toBe(true);
        expect(nestCli.projects).toEqual({});
        expect(nestCli.compilerOptions).toEqual({
          deleteOutDir: true,
          builder: 'rspack',
        });
        // There is no default project, so these must be absent.
        expect(nestCli).not.toHaveProperty('root');
        expect(nestCli).not.toHaveProperty('sourceRoot');
        expect(nestCli).not.toHaveProperty('entryFile');
      });

      it('should generate a solution-style tsconfig.json', async () => {
        const options: ApplicationOptions = {
          name: 'workspace',
          type: 'esm',
          createApplication: false,
        };
        const tree: UnitTestTree = await runner.runSchematic(
          'application',
          options,
        );

        const tsconfig = JSON.parse(
          tree.readContent('/workspace/tsconfig.json'),
        );
        expect(tsconfig.files).toEqual([]);
        expect(tsconfig.references).toEqual([]);
        expect(tsconfig).not.toHaveProperty('include');
        expect(tsconfig).not.toHaveProperty('exclude');
        expect(tsconfig.compilerOptions).not.toHaveProperty('baseUrl');
        expect(tsconfig.compilerOptions.strict).toBe(true);
      });

      it('should generate workspace-shaped npm scripts', async () => {
        const options: ApplicationOptions = {
          name: 'workspace',
          type: 'esm',
          createApplication: false,
        };
        const tree: UnitTestTree = await runner.runSchematic(
          'application',
          options,
        );

        const packageJson = JSON.parse(
          tree.readContent('/workspace/package.json'),
        );
        // Every `start*` script resolves the default project, which an empty
        // workspace does not have.
        const scriptNames = Object.keys(packageJson.scripts);
        expect(scriptNames.filter((name) => name.startsWith('start'))).toEqual(
          [],
        );
        expect(packageJson.scripts.format).toBe(
          'prettier --write "apps/**/*.ts" "libs/**/*.ts"',
        );
        expect(packageJson.scripts.lint).toBe('oxlint apps/ libs/');
        expect(packageJson.scripts.build).toBe('nest build');
        // Root vitest config is workspace-scoped, so these keep working.
        expect(packageJson.scripts.test).toBe('vitest run');
        expect(packageJson.scripts['test:e2e']).toBe(
          'vitest run --config ./vitest.config.e2e.ts',
        );
        expect(packageJson.type).toBe('module');
        expect(packageJson.dependencies).toHaveProperty('@nestjs/core');
        expect(packageJson.devDependencies).toHaveProperty('vitest');
      });
    });

    describe('and the module type is "cjs"', () => {
      it('should generate an empty workspace with a root jest config', async () => {
        const options: ApplicationOptions = {
          name: 'workspace',
          type: 'cjs',
          createApplication: false,
        };
        const tree: UnitTestTree = await runner.runSchematic(
          'application',
          options,
        );

        const files: string[] = tree.files;
        expect(files.sort()).toEqual(
          [
            '/workspace/.gitignore',
            '/workspace/.prettierrc',
            '/workspace/README.md',
            '/workspace/jest.config.ts',
            '/workspace/nest-cli.json',
            '/workspace/oxlint.json',
            '/workspace/package.json',
            '/workspace/tsconfig.json',
          ].sort(),
        );

        const nestCli = JSON.parse(
          tree.readContent('/workspace/nest-cli.json'),
        );
        expect(nestCli.monorepo).toBe(true);
        expect(nestCli.projects).toEqual({});
        expect(nestCli).not.toHaveProperty('sourceRoot');

        const tsconfig = JSON.parse(
          tree.readContent('/workspace/tsconfig.json'),
        );
        expect(tsconfig.files).toEqual([]);
        expect(tsconfig.references).toEqual([]);
        expect(tsconfig.compilerOptions.types).toEqual(['node', 'jest']);

        const packageJson = JSON.parse(
          tree.readContent('/workspace/package.json'),
        );
        expect(packageJson.type).toBeUndefined();
        expect(
          Object.keys(packageJson.scripts).filter((name) =>
            name.startsWith('start'),
          ),
        ).toEqual([]);
        expect(packageJson.scripts.test).toBe('jest');
        // Under jest the e2e config is per-app (apps/<name>/test/jest-e2e.json),
        // so there is nothing for a root `test:e2e` to point at.
        expect(packageJson.scripts).not.toHaveProperty('test:e2e');
      });
    });

    describe('and the language is "js"', () => {
      it('should generate an empty workspace with no index.js', async () => {
        const options: ApplicationOptions = {
          name: 'workspace',
          language: 'js',
          createApplication: false,
        };
        const tree: UnitTestTree = await runner.runSchematic(
          'application',
          options,
        );

        const files: string[] = tree.files;
        expect(files.sort()).toEqual(
          [
            '/workspace/.babelrc',
            '/workspace/.gitignore',
            '/workspace/.prettierrc',
            '/workspace/README.md',
            '/workspace/jest.config.js',
            '/workspace/jsconfig.json',
            '/workspace/nest-cli.json',
            '/workspace/package.json',
          ].sort(),
        );
        expect(files).not.toContain('/workspace/index.js');
        expect(files).not.toContain('/workspace/nodemon.json');

        const nestCli = JSON.parse(
          tree.readContent('/workspace/nest-cli.json'),
        );
        expect(nestCli.monorepo).toBe(true);
        expect(nestCli.language).toBe('js');
        expect(nestCli.projects).toEqual({});
        expect(nestCli).not.toHaveProperty('sourceRoot');

        const packageJson = JSON.parse(
          tree.readContent('/workspace/package.json'),
        );
        expect(
          Object.keys(packageJson.scripts).filter((name) =>
            name.startsWith('start'),
          ),
        ).toEqual([]);
        expect(packageJson.devDependencies).not.toHaveProperty('nodemon');
      });
    });

    describe('and spec files are disabled', () => {
      it('should still generate the workspace unchanged', async () => {
        const withSpec: UnitTestTree = await runner.runSchematic(
          'application',
          {
            name: 'workspace',
            type: 'esm',
            createApplication: false,
          } satisfies ApplicationOptions,
        );
        const withoutSpec: UnitTestTree = await runner.runSchematic(
          'application',
          {
            name: 'workspace',
            type: 'esm',
            spec: false,
            createApplication: false,
          } satisfies ApplicationOptions,
        );

        expect(withoutSpec.files.sort()).toEqual(withSpec.files.sort());
      });
    });

    describe('template hygiene', () => {
      const sharedFiles: Record<string, string[]> = {
        'ts-esm': [
          '.gitignore',
          '.prettierrc',
          'oxlint.json',
          'vitest.config.ts',
          'vitest.config.e2e.ts',
        ],
        ts: ['.gitignore', '.prettierrc', 'oxlint.json', 'jest.config.ts'],
        js: ['.gitignore', '.prettierrc', '.babelrc', 'jsconfig.json'],
      };

      for (const [variant, names] of Object.entries(sharedFiles)) {
        for (const name of names) {
          it(`should keep ${variant}/${name} identical between files/ and workspace/`, () => {
            const base = path.join(process.cwd(), 'src/lib/application');
            const fromFiles = readFileSync(
              path.join(base, 'files', variant, name),
              'utf-8',
            );
            const fromWorkspace = readFileSync(
              path.join(base, 'workspace', variant, name),
              'utf-8',
            );
            expect(fromWorkspace).toEqual(fromFiles);
          });
        }
      }
    });
  });
});
