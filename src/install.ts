import * as core from "@actions/core"
import * as tc from "@actions/tool-cache"
import { execSync } from "child_process"
import { chmodSync, existsSync } from "fs"
import os from "os"
import { join } from "path"

import { downloadURL, toolName } from "./constants"
import { VersionConfig } from "./version"

const getAssetURL = (versionConfig: VersionConfig): string => {
  let ext = "tar.gz"
  let platform = os.platform().toString()
  switch (platform) {
    case "win32":
      platform = "windows"
      ext = "zip"
      break
  }
  let arch = os.arch()
  switch (arch) {
    case "x64":
      arch = "amd64"
      break
    case "x32":
    case "ia32":
      arch = "386"
      break
  }

  return `${downloadURL}/${versionConfig.TargetVersion}/${toolName}-${platform}-${arch}.${ext}`
}

// The installLint returns path to installed binary of golangci-lint.
export async function install(versionConfig: VersionConfig): Promise<string> {
  core.info(`Installing ${toolName} ${versionConfig.TargetVersion}...`)
  const startedAt = Date.now()
  const assetURL = getAssetURL(versionConfig)
  core.info(`Downloading ${assetURL} ...`)
  const archivePath = await tc.downloadTool(assetURL)
  let extractedDir = ""
  let repl = /\.tar\.gz$/
  if (assetURL.endsWith("zip")) {
    extractedDir = await tc.extractZip(archivePath, process.env.HOME)
    repl = /\.zip$/
  } else {
    // We want to always overwrite files if the local cache already has them
    const args = ["xz"]
    if (process.platform.toString() != "darwin") {
      args.push("--overwrite")
    }
    extractedDir = await tc.extractTar(archivePath, process.env.HOME, args)
  }

  const urlParts = assetURL.split(`/`)
  const dirName = urlParts[urlParts.length - 1].replace(repl, ``)
  const path = existsSync(join(extractedDir, dirName, toolName))
    ? join(extractedDir, dirName, toolName)
    : join(extractedDir, toolName)

  core.info(`Installed ${toolName} into ${path} in ${Date.now() - startedAt}ms`)

  return path
}
