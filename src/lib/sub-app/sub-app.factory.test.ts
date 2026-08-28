import { EmptyTree } from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import type { SubAppOptions } from './sub-app.schema.js';

const readJson = (tree: UnitTestTree, filePath: string) =>
  tree.readJson(filePath) as Record<string, any>;

describe('SubApp Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  it('should manage name only', async () => {
    const options: SubAppOptions = {
      name: 'project',
    };
    const tree: UnitTestTree = await runner.runSchematic('sub-app', options);

    const files: string[] = tree.files;
    expect(files.sort()).toEqual(
      [
        '/nest-cli.json',
        '/apps/nestjs-schematics/tsconfig.app.json',
        '/apps/project/tsconfig.app.json',
        '/apps/project/src/main.ts',
        '/apps/project/src/project.controller.spec.ts',
        '/apps/project/src/project.controller.ts',
        '/apps/project/src/project.module.ts',
        '/apps/project/src/project.service.ts',
        '/apps/project/test/app.e2e-spec.ts',
        '/apps/project/test/jest-e2e.json',
      ].sort(),
    );
  });
  it('should manage name to normalize', async () => {
    const options: SubAppOptions = {
      name: 'awesomeProject',
    };
    const tree: UnitTestTree = await runner.runSchematic('sub-app', options);

    const files: string[] = tree.files;
    expect(files.sort()).toEqual(
      [
        '/nest-cli.json',
        '/apps/nestjs-schematics/tsconfig.app.json',
        '/apps/awesome-project/tsconfig.app.json',
        '/apps/awesome-project/src/main.ts',
        '/apps/awesome-project/src/awesome-project.controller.spec.ts',
        '/apps/awesome-project/src/awesome-project.controller.ts',
        '/apps/awesome-project/src/awesome-project.module.ts',
        '/apps/awesome-project/src/awesome-project.service.ts',
        '/apps/awesome-project/test/app.e2e-spec.ts',
        '/apps/awesome-project/test/jest-e2e.json',
      ].sort(),
    );
  });
  it("should keep underscores in sub-app's path and file name", async () => {
    const options: SubAppOptions = {
      name: '_project',
    };
    const tree: UnitTestTree = await runner.runSchematic('sub-app', options);

    const files: string[] = tree.files;
    expect(files.sort()).toEqual(
      [
        '/nest-cli.json',
        '/apps/nestjs-schematics/tsconfig.app.json',
        '/apps/_project/tsconfig.app.json',
        '/apps/_project/src/main.ts',
        '/apps/_project/src/_project.controller.spec.ts',
        '/apps/_project/src/_project.controller.ts',
        '/apps/_project/src/_project.module.ts',
        '/apps/_project/src/_project.service.ts',
        '/apps/_project/test/app.e2e-spec.ts',
        '/apps/_project/test/jest-e2e.json',
      ].sort(),
    );
  });
  it('should manage javascript files', async () => {
    const options: SubAppOptions = {
      name: 'project',
      language: 'js',
    };
    const tree: UnitTestTree = await runner.runSchematic('sub-app', options);

    const files: string[] = tree.files;
    expect(files.sort()).toEqual(
      [
        '/nest-cli.json',
        '/apps/nestjs-schematics/.babelrc',
        '/apps/nestjs-schematics/index.js',
        '/apps/nestjs-schematics/jsconfig.json',
        '/apps/project/.babelrc',
        '/apps/project/index.js',
        '/apps/project/jsconfig.json',
        '/apps/project/src/app.controller.js',
        '/apps/project/src/app.controller.spec.js',
        '/apps/project/src/app.module.js',
        '/apps/project/src/app.service.js',
        '/apps/project/src/main.js',
        '/apps/project/test/app.e2e-spec.js',
        '/apps/project/test/jest-e2e.json',
      ].sort(),
    );
  });
  it('should generate spec files with custom suffix', async () => {
    const options: SubAppOptions = {
      name: 'project',
      specFileSuffix: 'test',
    };
    const tree: UnitTestTree = await runner.runSchematic('sub-app', options);

    const files: string[] = tree.files;
    expect(files.sort()).toEqual(
      [
        '/nest-cli.json',
        '/apps/nestjs-schematics/tsconfig.app.json',
        '/apps/project/tsconfig.app.json',
        '/apps/project/src/main.ts',
        '/apps/project/src/project.controller.test.ts',
        '/apps/project/src/project.controller.ts',
        '/apps/project/src/project.module.ts',
        '/apps/project/src/project.service.ts',
        '/apps/project/test/jest-e2e.json',
        '/apps/project/test/app.e2e-test.ts',
      ].sort(),
    );
  });

  it('should set rspack as default builder in nest-cli.json', async () => {
    const options: SubAppOptions = {
      name: 'project',
    };
    const tree: UnitTestTree = await runner.runSchematic('sub-app', options);

    const config = readJson(tree, '/nest-cli.json');
    expect(config['compilerOptions']['builder']).toEqual('rspack');
  });

  it('should convert tsconfig.json to solution-style with project references', async () => {
    const options: SubAppOptions = {
      name: 'project',
    };

    let tree: UnitTestTree = new UnitTestTree(new EmptyTree());
    tree.create(
      '/tsconfig.json',
      JSON.stringify({
        compilerOptions: {
          baseUrl: './',
          paths: { '@app/*': ['src/*'] },
          target: 'ES2023',
        },
        include: ['src'],
      }),
    );

    tree = await runner.runSchematic('sub-app', options, tree);

    const tsconfig = readJson(tree, '/tsconfig.json');
    // Should be converted to solution-style
    expect(tsconfig['files']).toEqual([]);
    expect(tsconfig['include']).toBeUndefined();
    expect(tsconfig['exclude']).toBeUndefined();
    // baseUrl should be removed, while paths (e.g. library aliases) survive
    expect(tsconfig['compilerOptions']['baseUrl']).toBeUndefined();
    expect(tsconfig['compilerOptions']['paths']).toEqual({
      '@app/*': ['src/*'],
    });
    // Other compiler options should be preserved
    expect(tsconfig['compilerOptions']['target']).toEqual('ES2023');
    // Should have references to both apps
    expect(tsconfig['references']).toEqual([
      { path: './apps/nestjs-schematics/tsconfig.app.json' },
      { path: './apps/project/tsconfig.app.json' },
    ]);
  });

  it('should add project reference when adding sub-app to existing monorepo', async () => {
    let tree: UnitTestTree = new UnitTestTree(new EmptyTree());
    tree.create(
      '/nest-cli.json',
      JSON.stringify({ monorepo: true, projects: {} }),
    );
    tree.create(
      '/tsconfig.json',
      JSON.stringify({
        compilerOptions: {},
        files: [],
        references: [{ path: './apps/existing-app/tsconfig.app.json' }],
      }),
    );

    tree = await runner.runSchematic(
      'sub-app',
      { name: 'new-app' } as SubAppOptions,
      tree,
    );

    const tsconfig = readJson(tree, '/tsconfig.json');
    // Only the new app is referenced. There is no root app to relocate in a
    // workspace that is already a monorepo, so no "original app" reference is
    // added -- it would point at a directory that never existed.
    expect(tsconfig['references']).toEqual([
      { path: './apps/existing-app/tsconfig.app.json' },
      { path: './apps/new-app/tsconfig.app.json' },
    ]);
  });

  it('should sort sub-app names in nest-cli.json', async () => {
    const options: SubAppOptions[] = [
      {
        name: 'c',
        language: 'ts',
      },
      {
        name: 'a',
        language: 'ts',
      },
      {
        name: 'b',
        language: 'ts',
      },
    ];

    let tree: UnitTestTree = new UnitTestTree(new EmptyTree());
    tree.create('/nest-cli.json', `{"monorepo": true, "projects": {}}`);

    for (const o of options) {
      tree = await runner.runSchematic('sub-app', o, tree);
    }

    const config = readJson(tree, '/nest-cli.json');
    expect(Object.keys(config['projects'])).toEqual(['a', 'b', 'c']); // Sorted
  });

  it('should generate files with .js imports for ESM projects', async () => {
    let tree: UnitTestTree = new UnitTestTree(new EmptyTree());
    tree.create(
      '/package.json',
      JSON.stringify({ name: 'test', type: 'module' }),
    );
    tree.create('/tsconfig.json', JSON.stringify({ compilerOptions: {} }));

    const options: SubAppOptions = { name: 'project' };
    tree = await runner.runSchematic('sub-app', options, tree);

    // Spec file should have .js imports
    const specContent = tree.readContent(
      '/apps/project/src/project.controller.spec.ts',
    );
    expect(specContent).toContain(
      "import { ProjectController } from './project.controller.js'",
    );
    expect(specContent).toContain(
      "import { ProjectService } from './project.service.js'",
    );

    // Non-spec files should have .js imports
    const moduleContent = tree.readContent(
      '/apps/project/src/project.module.ts',
    );
    expect(moduleContent).toContain(
      "import { ProjectController } from './project.controller.js'",
    );
    expect(moduleContent).toContain(
      "import { ProjectService } from './project.service.js'",
    );

    const controllerContent = tree.readContent(
      '/apps/project/src/project.controller.ts',
    );
    expect(controllerContent).toContain(
      "import { ProjectService } from './project.service.js'",
    );

    const mainContent = tree.readContent('/apps/project/src/main.ts');
    expect(mainContent).toContain(
      "import { ProjectModule } from './project.module.js'",
    );
  });

  describe('when the workspace was created empty (--no-create-application)', () => {
    const createEmptyWorkspace = (
      type: 'esm' | 'cjs' = 'esm',
    ): Promise<UnitTestTree> =>
      runner.runSchematic('application', {
        name: 'my-workspace',
        type,
        createApplication: false,
        directory: '.',
      } as any);

    it('should add the app without firing any conversion side effects', async () => {
      let tree = await createEmptyWorkspace();
      const workspaceFiles = tree.files.sort();

      tree = await runner.runSchematic(
        'sub-app',
        { name: 'api' } as SubAppOptions,
        tree,
      );

      // Every workspace-root file survives untouched, and the only additions
      // are under apps/api. Nothing was moved out of a root `src/`/`test/`,
      // because there was none.
      expect(tree.files.sort()).toEqual(
        [
          ...workspaceFiles,
          '/apps/api/src/api.controller.spec.ts',
          '/apps/api/src/api.controller.ts',
          '/apps/api/src/api.module.ts',
          '/apps/api/src/api.service.ts',
          '/apps/api/src/main.ts',
          '/apps/api/test/app.e2e-spec.ts',
          '/apps/api/test/jest-e2e.json',
          '/apps/api/tsconfig.app.json',
        ].sort(),
      );
    });

    it('should register exactly one project and keep no default project', async () => {
      let tree = await createEmptyWorkspace();
      tree = await runner.runSchematic(
        'sub-app',
        { name: 'api' } as SubAppOptions,
        tree,
      );

      const nestCli = readJson(tree, '/nest-cli.json');
      expect(Object.keys(nestCli['projects'])).toEqual(['api']);
      expect(nestCli['projects']['api']).toEqual({
        type: 'application',
        root: 'apps/api',
        entryFile: 'main',
        sourceRoot: 'apps/api/src',
        compilerOptions: { tsConfigPath: 'apps/api/tsconfig.app.json' },
      });
      expect(nestCli['monorepo']).toBe(true);
      expect(nestCli).not.toHaveProperty('root');
      expect(nestCli).not.toHaveProperty('sourceRoot');
      expect(nestCli['compilerOptions']).toEqual({
        deleteOutDir: true,
        builder: 'rspack',
      });
    });

    it('should reference only the new app in the root tsconfig', async () => {
      let tree = await createEmptyWorkspace();
      tree = await runner.runSchematic(
        'sub-app',
        { name: 'api' } as SubAppOptions,
        tree,
      );

      const tsconfig = readJson(tree, '/tsconfig.json');
      expect(tsconfig['references']).toEqual([
        { path: './apps/api/tsconfig.app.json' },
      ]);
      expect(tsconfig['files']).toEqual([]);
      expect(tsconfig['include']).toBeUndefined();
      expect(tsconfig['exclude']).toBeUndefined();
    });

    it('should leave the workspace npm scripts untouched', async () => {
      let tree = await createEmptyWorkspace();
      const before = readJson(tree, '/package.json')['scripts'];

      tree = await runner.runSchematic(
        'sub-app',
        { name: 'api' } as SubAppOptions,
        tree,
      );

      // In particular `test:e2e` must not be re-pointed at a root app that
      // does not exist.
      expect(readJson(tree, '/package.json')['scripts']).toEqual(before);
    });

    it('should produce the same apps/<name> tree as the conversion path', async () => {
      let empty = await createEmptyWorkspace();
      empty = await runner.runSchematic(
        'sub-app',
        { name: 'api' } as SubAppOptions,
        empty,
      );

      // The conversion path: a standard-mode project turned into a monorepo by
      // the very first `nest g app`.
      let converted: UnitTestTree = await runner.runSchematic('application', {
        name: 'my-workspace',
        type: 'esm',
        directory: '.',
      } as any);
      converted = await runner.runSchematic(
        'sub-app',
        { name: 'api' } as SubAppOptions,
        converted,
      );

      const appFiles = empty.files
        .filter((file) => file.startsWith('/apps/api/'))
        .sort();
      expect(appFiles.length).toBeGreaterThan(0);
      expect(
        converted.files.filter((file) => file.startsWith('/apps/api/')).sort(),
      ).toEqual(appFiles);

      for (const file of appFiles) {
        expect(empty.readContent(file)).toEqual(converted.readContent(file));
      }
    });

    it('should support adding several apps in a row', async () => {
      let tree = await createEmptyWorkspace();
      for (const name of ['worker', 'api']) {
        tree = await runner.runSchematic(
          'sub-app',
          { name } as SubAppOptions,
          tree,
        );
      }

      const nestCli = readJson(tree, '/nest-cli.json');
      expect(Object.keys(nestCli['projects'])).toEqual(['api', 'worker']);
      expect(readJson(tree, '/tsconfig.json')['references']).toEqual([
        { path: './apps/worker/tsconfig.app.json' },
        { path: './apps/api/tsconfig.app.json' },
      ]);
    });

    it('should work for a cjs workspace too', async () => {
      let tree = await createEmptyWorkspace('cjs');
      tree = await runner.runSchematic(
        'sub-app',
        { name: 'api' } as SubAppOptions,
        tree,
      );

      expect(readJson(tree, '/nest-cli.json')['projects']).toHaveProperty(
        'api',
      );
      expect(readJson(tree, '/tsconfig.json')['references']).toEqual([
        { path: './apps/api/tsconfig.app.json' },
      ]);
      expect(tree.files).toContain('/jest.config.ts');
    });
  });
});
