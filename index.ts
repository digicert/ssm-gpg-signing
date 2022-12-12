import { main } from "@digicert/ssm-client-tools-installer";
import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import path from "path";
import * as io from "@actions/io";
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

(async () => {
  try {
    process.env.SHOULD_CHECK_INSTALLED = "false";
    const result = await main("gpg-signing");
    const message = JSON.parse(result);
    if (message) {
      (osPlat=="win32")?
      core.setOutput("extractPath", message.imp_file_paths.directoryPath):core.setOutput("extractPath", message.imp_file_paths.extractPath);
      signtools.map(async (sgtool) =>
        (await (sgtool == "smctl" || sgtool == "ssm-scd"))
          ? toolInstaller(sgtool, message.imp_file_paths.extractPath)
          : toolInstaller(sgtool)
      );
    } else {
      core.setFailed("Installation Failed");
    }
  } catch (error: any) {
    core.setFailed(error.message);
  }
})();
