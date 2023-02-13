import * as core from "@actions/core"

import { toolName } from "./constants";

export type VersionConfig = {
  Error?: string;
  TargetVersion: string;
};

const versionRe = /^v(\d+)\.(\d+)(?:\.(\d+))?$/

export async function findVersion(): Promise<VersionConfig> {
  core.info(`Finding needed ${toolName} version...`);
  let requestedVersion = core.getInput(`version`);
  const [, major, minor, patch] = versionRe.exec(requestedVersion)?.map((v, idx) => idx > 0 ? parseInt(v, 10) : v) || [];

  // if the patched version is passed, just use it
  if (
    typeof major === "number" && typeof minor === "number" && typeof patch === "number"
  ) {
    return new Promise((resolve) => {
      const versionWithoutV = `${major}.${minor}.${patch}`;
      resolve({
        TargetVersion: `v${versionWithoutV}`,
      });
    });
  }

  throw new Error(`failed to get version '${requestedVersion}'`);
}
