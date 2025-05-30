import { categorizeFilePaths, update } from '@mintlify/prebuild';
import {
  rmdir,
  access,
  readdir,
} from 'fs/promises';
import {
  writeFileSync,
  readFileSync,
} from "node:fs";
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
const TAR_PATH = join(contentDirectoryPath, './tar/mint.tar.gz');
const docs_path = join(gen_path, './apps/client');//最后存放地址
const TAR_URL = 'https://mint-releases.b-cdn.net/mint-0.0.1165.tar.gz';
const TARGET_MINT_VERSION = 'v0.0.1165';
const inText = '"subdomain": "docs.hhw31.com","actualSubdomain": "hc-2ade1025","trieve": {"datasetId": "236e3901-9a2c-46db-9c07-13723d537375"},';
const apiKey = 'tr-Ef0O1GG473PDFHfclCabtti5n0mHNolw';

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
      if (await folderExists(TAR_PATH)) {
        // 不处理
      } else {
        const spinner = createSpinner({
          color: "green",
          text: chalk.blue('开始下载资源包，请稍等'),
        });
        spinner.start();
        await pipeline(got.stream(TAR_URL), fse.createWriteStream(TAR_PATH));
        spinner.succeed(chalk.bgGreen('资源包下载完成'));
      }
      
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

      // fse.removeSync(TAR_PATH);
      fse.writeFileSync(VERSION_PATH, TARGET_MINT_VERSION);
      spinner.succeed(chalk.bgGreen('资源包解压完成'));
    } catch (error) {
      console.error(error);
      spinner.fail(chalk.bgRed('资源包解压失败'));
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

  const mint_path = join(docs_path, './public/mint');
  if (await folderExists(mint_path)) {
    fse.emptyDirSync(mint_path);
    await rmdir(mint_path);
  }

  const tar_path = join(docs_path, './public/tar');
  if (await folderExists(tar_path)) {
    fse.emptyDirSync(tar_path);
    await rmdir(tar_path);
  }

  await fse.copyFileSync(join(contentDirectoryPath, './srcipt/server.cjs'), join(docs_path, './server.js'));

  try {
    //骚操作
    const spinner = createSpinner({
      color: "green",
      text: chalk.blue('开始执行骚操作'),
    });
    spinner.start();
    const chunks_path = join(docs_path, './.next/static/chunks');
    const files = await readdir(chunks_path);
    for (const file of files) {
      const match = file.match(/^webpack-(.+?)\.js$/);
      if (match?.[1]) {
        const webpack_file = join(chunks_path, file);
        console.log(webpack_file);
        const content = readFileSync(webpack_file, 'utf-8');
    
        const flag = content.includes('window.injectSrcipt');
        if (!flag) {
          const arr = content.split('}()');
          arr[arr.length - 2] = arr[arr.length - 2] + '; window.injectSrcipt = i;'
      
          const newContent = arr.join('}()');
          writeFileSync(webpack_file, newContent, 'utf-8');
        }
      } else {
        const match = file.match(/(.+?)\.js$/);
        if (match?.[1]) {
          const file_path = join(chunks_path, file);
          const content = readFileSync(file_path, 'utf-8');
          if (content.includes('y.F9.TRIEVE_API_KEY') && !content.includes(`y.F9.TRIEVE_API_KEY||"${apiKey}"`)) {
            const arr = content.split('y.F9.TRIEVE_API_KEY');
            const newContent = arr.join(`y.F9.TRIEVE_API_KEY||"${apiKey}"`);
            writeFileSync(file_path, newContent, 'utf-8');
          }
        }
      }
    }

    const temp_file = join(docs_path, './.next/server/pages/[[...slug]].js');
    const content = readFileSync(temp_file, 'utf-8');
    const flag = content.includes(inText);
    if (!flag) {
      const arr = content.split('/browserconfig.xml"},');
      const newContent = arr.join('/browserconfig.xml"},' + inText);
      writeFileSync(temp_file, newContent, 'utf-8');
    }


    spinner.succeed(chalk.bgGreen('骚操完成'));
  } catch (error) {
    console.error(error);
    spinner.fail(chalk.bgRed('骚操作失败'));
  }

  spinner.succeed(chalk.bgGreen('打包完成'));
  process.exit(0);
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

function createSpinner(opt) {
  const spinner = ora({
    color: opt.color,
    text: opt.text,
  });
  return spinner;
}