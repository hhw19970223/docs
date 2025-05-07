import { exec } from 'child_process';
import chalk from "chalk";
import ora from "ora";
import { resolve, join } from 'path';
import {
  readdir,
  rmdir,
  stat,
  access,
  unlink,
} from 'fs/promises';

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
    await deleteFolderRecursive(path);
    spinner.succeed(chalk.bgGreen('删除完成'));
  }
}

async function deleteFolderRecursive(folderPath) {
  try {
    const files = await readdir(folderPath);

    for (const file of files) {
      const filePath = join(folderPath, file);
      const stats = await stat(filePath);

      if (stats.isDirectory()) {
        await deleteFolderRecursive(filePath);
      } else {
        await unlink(filePath);
      }
    }

    await rmdir(folderPath);
  } catch (err) {
    outputErr('Error deleting folder:', err);
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

export function red(str) {
  // 添加 ANSI 转义字符，以将文本输出为红色
  // return `\x1b[31m${str}\x1b[0m`;
  return '\u001B[31m' + str + '\u001B[0m';
}

export function outputErr(...args) {
  for (let i = 0; i < args.length; i++) {
    args[i] = red(args[i]);
  }
  console.log.apply(console, args);
}