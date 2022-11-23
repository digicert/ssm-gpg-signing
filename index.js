import { main } from "@digicert/ssm-client-tools-installer";
import * as core from "@actions/core";

try {
  const result = await main("gpg-signing");
  const message = JSON.parse(result);
  if (message) {
    core.setOutput("extractPath", message.imp_file_paths.extractPath);
    core.setOutput("directoryPath", message.imp_file_paths.directoryPath);
  } else {
    core.setFailed("Installation Failed");
  }
} catch (error) {
  core.setFailed(error.message);
}
