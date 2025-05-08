import chalk from "chalk";
import ora from "ora";
import { resolve } from 'path';
import {
  rmdir,
  access
} from 'fs/promises';
import fse from 'fs-extra';

main();
async function main() {
  const path = resolve('./mint');
  const isExists = await folderExists(path);
  if (isExists) {
    const spinner = createSpinner({
      color: "blue",
      text: chalk.blue('调试时需，删除资源包'),
    });
    spinner.start();
    fse.emptyDirSync(path);
    await rmdir(path);
    spinner.succeed(chalk.bgGreen('删除完成'));
  }
}

async function folderExists(folderPath) {
  try {
    await access(folderPath);
    return true;
  } catch (err) {
    return false;
  }
}

function createSpinner(opt) {
  const spinner = ora({
    color: opt.color,
    text: opt.text,
  });
  return spinner;
}