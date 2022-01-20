import * as tr from 'azure-pipelines-task-lib/toolrunner';
import baseCommand from './baseCommand';
import * as semver from 'semver';
import { IExecSyncResult } from 'azure-pipelines-task-lib/toolrunner';

export class PluginInfo {
  name: string;
  version: string;
  description: string;

  constructor(name: string, version: string, description: string) {
    this.name = name;
    this.version = version;
    this.description = description;
  }
}

export default class helmCommand extends baseCommand {
  constructor() {
    super(true);
  }

  public getTool(): string {
    return 'helm';
  }

  login(): void {}

  logout(): void {}

  installPlugin(url: string, version: string, silent?: boolean) {
    let command = this.createCommand().line(`plugin install ${url}`);
    if (version !== 'latest') {
      command = this.createCommand().line(`plugin install ${url} --version ${version}`);
    }

    return this.execCommandSync(command, { silent: !!silent } as tr.IExecOptions);
  }

  unInstallPlugin(name: string, silent?: boolean) {
    let command = this.createCommand().line(`plugin uninstall ${name}`);

    return this.execCommandSync(command, { silent: !!silent } as tr.IExecOptions);
  }

  listInstalledPlugins(silent?: boolean): PluginInfo[] {
    let listCommand = this.createCommand().line('plugin list');
    const listCommandResult = this.execCommandSync(listCommand, { silent: !!silent } as tr.IExecOptions);
    if (listCommandResult.code === 0 && listCommandResult.stdout) {
      // split by line return and trim first and last line (header and footer)
      let lines = listCommandResult.stdout.split('\n').slice(1, -1);
      return lines.map(value => {
        const fields = value.split('\t');
        return new PluginInfo(fields[0].trim(), fields[1].trim(), fields[2].trim());
      });
    }

    return [];
  }

  updatePlugin(pluginName: string, silent?: boolean) {
    const installCommand = this.createCommand().line(`plugin update ${pluginName}`);

    return this.execCommandSync(installCommand, { silent: !!silent } as tr.IExecOptions);
  }

  public execHelmPluginInstallCommand(pluginName: string, pluginUrl: string, version = 'latest', silent?: boolean): tr.IExecSyncResult {
    const plugins = this.listInstalledPlugins();
    const installedPlugin = plugins.find(plugin => plugin.name === pluginName);
    if (installedPlugin) {
      if (version == 'latest') {
        return this.updatePlugin(pluginName, silent);
      } else if (semver.neq(version, installedPlugin.version, true)) {
        this.unInstallPlugin(pluginName, silent);
        return this.installPlugin(pluginUrl, version, silent);
      } else {
        return {
          code: 0,
          stdout: '',
          stderr: '',
          error: null
        } as IExecSyncResult;
      }
    }

    return this.installPlugin(pluginUrl, version, silent);
  }
}
