import * as path from 'path';
import * as fs from 'fs';
import * as tl from 'azure-pipelines-task-lib/task';
import { IExecSyncResult } from 'azure-pipelines-task-lib/toolrunner';
import { helmfileCommandBuilder } from './helmfileCommandBuilder';
import k8sCommand from './k8sCommand';
import * as utils from './utils';
import helmCommand from './helmCommand';

const environmentVariableMaximumSize = 32766;

function isKubConfigSetupRequired(_command: string): boolean {
  var connectionType = tl.getInput('connectionType', true);
  return connectionType !== 'None';
}

function isKubConfigLogoutRequired(command: string): boolean {
  var connectionType = tl.getInput('connectionType', true);
  return command !== 'login' && connectionType !== 'None';
}

function getClusterType(): any {
  var connectionType = tl.getInput('connectionType', true);
  var endpoint = tl.getInput('azureSubscriptionEndpoint');
  if (connectionType === 'Azure Resource Manager' && endpoint) {
    return require('./clusters/armkubernetescluster');
  }

  return require('./clusters/generickubernetescluster');
}

function getKubeConfigFilePath(): string {
  var userdir = utils.getTaskTempDir();
  return path.join(userdir, 'config');
}

async function getKubeConfigFile(): Promise<string> {
  return getClusterType()
    .getKubeConfig()
    .then(config => {
      var configFilePath = getKubeConfigFilePath();
      tl.debug(`KubeConfigFilePath: ${configFilePath}`);
      fs.writeFileSync(configFilePath, config);
      fs.chmodSync(configFilePath, '600');
      return configFilePath;
    });
}

async function run() {
  var command = tl.getInput('command', true).toLowerCase();
  var isKubConfigRequired = isKubConfigSetupRequired(command);
  var k8s: k8sCommand;
  if (isKubConfigRequired) {
    var kubeconfigfilePath = command === 'logout' ? tl.getVariable('KUBECONFIG') : await getKubeConfigFile();
    k8s = new k8sCommand(kubeconfigfilePath);
    k8s.login();
  }

  try {
    const failOnStderr = tl.getBoolInput('failOnStderr');
    switch (command) {
      case 'diff':
        const installHelmDiff = tl.getBoolInput('installHelmDiff');
        const helmDiffVersion = tl.getInput('helmDiffVersion');
        if (installHelmDiff) {
          const pluginOptions = { name: 'diff', url: 'https://github.com/databus23/helm-diff', version: helmDiffVersion, silent: true };
          const plugInstallResult = new helmCommand().execHelmPluginInstallCommand(
            pluginOptions.name,
            pluginOptions.url,
            pluginOptions.version,
            pluginOptions.silent
          );
          if (
            plugInstallResult.code != tl.TaskResult.Succeeded ||
            !!plugInstallResult.error ||
            (failOnStderr && !!plugInstallResult.stderr)
          ) {
            tl.debug('execResult: ' + JSON.stringify(plugInstallResult));
            tl.setResult(tl.TaskResult.Failed, plugInstallResult.stderr);
          }
        }
      default:
        const execResult: IExecSyncResult = new helmfileCommandBuilder(command).build().execHelmfileCommand();
        if (execResult.code != tl.TaskResult.Succeeded || !!execResult.error || (failOnStderr && !!execResult.stderr)) {
          tl.debug('execResult: ' + JSON.stringify(execResult));
          tl.setResult(tl.TaskResult.Failed, execResult.stderr);
        }
        if (execResult.stdout) {
          var commandOutputLength = execResult.stdout.length;
          if (commandOutputLength > environmentVariableMaximumSize) {
            tl.warning(
              `OutputVariableDataSizeExceeded: commandOutputLength: ${commandOutputLength}, environmentVariableMaximumSize: ${environmentVariableMaximumSize}`
            );
          } else {
            tl.setVariable('helmfileOutput', execResult.stdout);
          }
        }
    }
  } catch (err) {
    // not throw error so that we can logout from kubernetes
    tl.setResult(tl.TaskResult.Failed, err.message);
  } finally {
    if (isKubConfigLogoutRequired(command)) {
      k8s.logout();
    }
  }
}

run();
