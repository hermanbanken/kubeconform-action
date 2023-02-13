import * as core from "@actions/core"
import { exec } from "child_process"
import * as path from "path"
import { promisify } from "util"

import { install } from "./install"
import { findVersion } from "./version"
import { toolName } from "./constants"
import { cwd } from "process"

const execShellCommand = promisify(exec)

async function prepare(): Promise<string> {
  const versionConfig = await findVersion()
  return await install(versionConfig)
}

type Env = {
  toolPath: string
}

async function prepareEnv(): Promise<Env> {
  const startedAt = Date.now()
  const preparePromise = prepare()
  const toolPath = await preparePromise
  core.info(`Prepared env in ${Date.now() - startedAt}ms`)
  return { toolPath }
}

type ExecRes = {
  stdout: string
  stderr: string
}

const printOutput = (res: ExecRes): void => {
  if (res.stdout) {
    core.info(res.stdout)
  }
  if (res.stderr) {
    core.info(res.stderr)
  }
}

async function runTool(path: string): Promise<void> {
  const userArgs = core.getInput(`args`)
  const cmd = `${path} ${userArgs}`
  core.info(`Running [${cmd}] in [${cwd() || ``}] ...`)
  const startedAt = Date.now()
  try {
    const res = await execShellCommand(cmd, {})
    printOutput(res)
    core.info(`${toolName} found no issues`)
  } catch (exc) {
    // This logging passes issues to GitHub annotations but comments can be more convenient for some users.
    // TODO: support reviewdog or leaving comments by GitHub API.
    printOutput(exc)

    if (exc.code === 1) {
      core.setFailed(`issues found`)
    } else {
      core.setFailed(`${toolName} exit with code ${exc.code}`)
    }
  }

  core.info(`Ran ${toolName} in ${Date.now() - startedAt}ms`)
}

export async function run(): Promise<void> {
  try {
    const { toolPath } = await core.group(`prepare environment`, prepareEnv)
    core.addPath(path.dirname(toolPath))
    await core.group(`run ${toolName}`, () => runTool(toolPath))
  } catch (error) {
    core.error(`Failed to run: ${error}, ${error.stack}`)
    core.setFailed(error.message)
  }
}
