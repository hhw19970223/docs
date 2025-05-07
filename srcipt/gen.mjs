import { categorizeFilePaths, update } from '@mintlify/prebuild';
import {
  readdir,
  rmdir,
  stat,
  access,
  mkdir,
  unlink,
  copyFile
} from 'fs/promises';
import { join, resolve } from 'path';
import { exec } from 'child_process';
import { pipeline } from 'node:stream/promises';
import tar from 'tar';
import fse, { pathExists } from 'fs-extra';
import got from 'got';
import chalk from "chalk";
import ora from "ora";

// 在根目录下执行命令
const contentDirectoryPath = resolve('./');//项目绝对路径
const gen_path = join(contentDirectoryPath, './mint');//最后存放地址
const TAR_PATH = join(contentDirectoryPath, './mint.tar.gz');
const docs_path = join(gen_path, './apps/client');//最后存放地址
const TAR_URL = 'https://mint-releases.b-cdn.net/mint-0.0.1165.tar.gz';
const TARGET_MINT_VERSION = 'v0.0.1165';

main();
async function main() {
  const spinner = createSpinner({
    color: "blue",
    text: chalk.blue('开始打包'),
  });
  spinner.start();

  const VERSION_PATH = join(gen_path, './mint-version.txt');
  const versionString = (await pathExists(VERSION_PATH))
    ? fse.readFileSync(VERSION_PATH, 'utf8')
    : null;
  const shouldDownload = versionString !== TARGET_MINT_VERSION;
  if (shouldDownload) {
    fse.emptyDirSync(gen_path);
    try {
      const spinner = createSpinner({
        color: "green",
        text: chalk.blue('开始下载资源包，请稍等'),
      });
      spinner.start();
      await pipeline(got.stream(TAR_URL), fse.createWriteStream(TAR_PATH));
      spinner.succeed(chalk.bgGreen('资源包下载完成'));
    } catch (error) {
      console.error(error);
      spinner.fail(chalk.bgRed('资源包下载失败'));
      process.exit(1);
    }
    
    try {
      const spinner = createSpinner({
        color: "green",
        text: chalk.blue('开始解压资源包，请稍等'),
      });
      spinner.start();
      tar.x({
        sync: true,
        file: TAR_PATH,
        cwd: './',
      });
  
      fse.removeSync(TAR_PATH);
      fse.writeFileSync(VERSION_PATH, TARGET_MINT_VERSION);
      spinner.succeed(chalk.bgGreen('资源包解压完成'));
      spinner.stop();
    } catch (error) {
      console.error(error);
      spinner.fail(chalk.bgRed('资源包解压失败'));
      spinner.stop();
      process.exit(1);
    }
  }

  process.chdir(docs_path);
  const { contentFilenames, staticFilenames, openApiFiles, asyncApiFiles, snippets, snippetsV2 } = await categorizeFilePaths(contentDirectoryPath);
  await update({
    contentDirectoryPath,
    staticFilenames,
    openApiFiles,
    asyncApiFiles,
    contentFilenames,
    snippets,
    snippetV2Filenames: snippetsV2,
    docsConfigPath: join(contentDirectoryPath, 'docs.json'),
  });
  if (await folderExists(join(docs_path, './public/mint'))) {
    await deleteFolderRecursive(join(docs_path, './public/mint'));
  }
 
  spinner.succeed(chalk.bgGreen('打包完成'));
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

export function outputErr(...args) {
  for (let i = 0; i < args.length; i++) {
    args[i] = red(args[i]);
  }
  console.log.apply(console, args);
}

export function outputInfo(...args) {
  for (let i = 0; i < args.length; i++) {
    args[i] = skyBlue(args[i]);
  }
  console.log.apply(console, args);
}

export function outputSucc(...args) {
  for (let i = 0; i < args.length; i++) {
    args[i] = green(args[i]);
  }
  console.log.apply(console, args);
}


async function folderExists(folderPath) {
  try {
    await access(folderPath);
    return true;
  } catch (err) {
    return false;
  }
}

export function exec_sh(command, path) {
  if (path) {
    return new Promise(function (resolve, reject) {
      exec(command, { cwd: path }, function (error, stdout, stderr) {
        if (error) {
          reject(error);
        } else {
          outputInfo(stdout)
          resolve(0);
        }
      });
    })
  } else {
    return new Promise(function (resolve, reject) {
      exec(command, function (error, stdout, stderr) {
        if (error) {
          reject(error);
        } else {
          outputInfo(stdout)
          resolve(0);
        }
      });
    })
  }
}

export function red(str) {
  // 添加 ANSI 转义字符，以将文本输出为红色
  // return `\x1b[31m${str}\x1b[0m`;
  return '\u001B[31m' + str + '\u001B[0m';
}

export function skyBlue(str) {
  return '\u001B[1;36m' + str + '\u001B[0m';
}

export function green(str) {
  return '\u001B[32m' + str + '\u001B[0m';
}

async function mergeDirectories(srcDir, destDir) {
  await mkdir(destDir, { recursive: true });
  const entries = await readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name);
    const destPath = join(destDir, entry.name);

    if (entry.isDirectory()) {
      // 递归合并子文件夹
      await mergeDirectories(srcPath, destPath);
    } else if (entry.isFile()) {
      // 覆盖复制文件
      await copyFile(srcPath, destPath);
    }
  }
}

function createSpinner(opt) {
  const spinner = ora({
    color: opt.color,
    text: opt.text,
  });
  return spinner;
}