import { main } from "@digicert/ssm-client-tools-installer";
import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import path from "path";
import fs from "fs";
import os from "os";

const osPlat: string = os.platform();
const signtools =
  osPlat == "win32" ? ["smctl", "ssm-scd", "signtool"] : ["smctl", "ssm-scd"];
const toolInstaller = async (toolName: string, toolPath: string = "") => {
  let cacheDir;
  switch (toolName) {
    case "smctl":
      cacheDir = await tc.cacheDir(toolPath, toolName, "latest");
      core.addPath(cacheDir);
      core.debug(`tools cache has been updated with the path: ${cacheDir}`);
      break;
    case "signtool":
      const sign =
        "C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.17763.0\\x86\\";
      cacheDir = await tc.cacheDir(sign, toolName, "latest");
      core.addPath(cacheDir);
      core.debug(`tools cache has been updated with the path: ${cacheDir}`);
      break;
    case "ssm-scd":
      cacheDir = await tc.cacheDir(toolPath, toolName, "latest");
      core.addPath(cacheDir);
      core.debug(`tools cache has been updated with the path: ${cacheDir}`);
      break;
  }
};
const getdaemonPath = async (scdPath: string, extractPath: string) => {
  const installPath =
    osPlat == "win32" ? "C:\\Users\\RUNNER~1\\.gnupg" :osPlat=="linux"? "/home/runner/.gnupg":"/Users/runner/.gnupg";

  const configFilePath = path.join(installPath, "gpg-agent.conf");
  console.info(
    "The scd path set is ",
    path.join(extractPath, scdPath),
    "and config file path is ",
    configFilePath
  );
  try {
    fs.mkdirSync(installPath);
  } catch {}
  fs.writeFileSync(
    configFilePath,
    `verbose 
    debug-all 
    scdaemon-program ${path.join(extractPath, scdPath)}\r\n`
  );

  return configFilePath;
};
(async () => {
  try {
    process.env.SHOULD_CHECK_INSTALLED = "false";
    const result = await main("gpg-signing");
    const message = JSON.parse(result);
    if (message) {
      const extractPath =
        osPlat == "win32"
          ? message.imp_file_paths.directoryPath
          : message.imp_file_paths.extractPath;
      core.setOutput("extractPath", extractPath);

      signtools.map(async (sgtool) =>
        (await (sgtool == "smctl" || sgtool == "ssm-scd"))
          ? toolInstaller(sgtool, extractPath)
          : toolInstaller(sgtool)
      );
      const getfile = await getdaemonPath("ssm-scd.exe", extractPath);
      core.debug(`scd card is set ${getfile}`);
      core.setOutput("ConfigFile", getfile);
    } else {
      core.setFailed("Installation Failed");
    }
  } catch (error: any) {
    core.setFailed(error.message);
  }
})();
