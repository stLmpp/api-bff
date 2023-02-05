import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import inquirer from 'inquirer';
import latestVersion from 'latest-version';
import { coerce as semverCoerce, gt as semverGt } from 'semver';

const DEPENDENCIES_JSON_PATH = join(
  process.cwd(),
  'src',
  'new',
  'dependencies.json'
);

const DEPENDENCIES_JSON: Record<string, string> = await readFile(
  DEPENDENCIES_JSON_PATH,
  { encoding: 'utf-8' }
).then((file) => JSON.parse(file));

const dependencies = await Promise.all(
  Object.entries(DEPENDENCIES_JSON).map(async ([key, version]) => {
    if (key.startsWith('@api-bff')) {
      return null;
    }
    const newVersion = await latestVersion(key);
    const oldVersion = semverCoerce(version)!.version;
    if (semverGt(newVersion, oldVersion)) {
      return { name: key, oldVersion, newVersion };
    }
    return null;
  })
);

const dependencies_filtered = dependencies.filter(
  (value): value is NonNullable<(typeof dependencies)[0]> => !!value
);

if (!dependencies_filtered.length) {
  console.log('None new version of packages were found! Good job 👌');
  process.exit();
}

console.log('New version of package(s) found');
console.table(dependencies_filtered);

const { confirm } = await inquirer.prompt({
  message: () => 'Want to update the dependencies?',
  type: 'confirm',
  name: 'confirm',
});

if (!confirm) {
  process.exit();
}

let choices: string[] = [dependencies_filtered[0].name];

if (dependencies_filtered.length > 1) {
  const result = await inquirer.prompt({
    message: 'Select the packages',
    type: 'checkbox',
    choices: () => dependencies_filtered.map((dep) => dep.name),
    name: 'choices',
  });
  choices = result.choices;
}

if (!choices.length) {
  process.exit();
}

for (const dependency_name of choices) {
  const newVersion = dependencies_filtered.find(
    (dependency) => dependency.name === dependency_name
  )!.newVersion;
  DEPENDENCIES_JSON[dependency_name] = `~${newVersion}`;
}

const JSON_INDENT_SIZE = 2;

await writeFile(
  DEPENDENCIES_JSON_PATH,
  JSON.stringify(DEPENDENCIES_JSON, null, JSON_INDENT_SIZE)
);
