import * as tr from 'azure-pipelines-task-lib/toolrunner';
import baseCommand from './baseCommand';

export default class helmCommand extends baseCommand {
  constructor() {
    super(true);
  }

  public getTool(): string {
    return 'helm';
  }

  login(): void {}

  logout(): void {}

  installPlugin(pluginUrl: string, silent?: boolean) {
    const installCommand = this.createCommand().line(`plugin install ${pluginUrl}`);

    return this.execCommandSync(installCommand, { silent: !!silent } as tr.IExecOptions);
  }

  updatePlugin(pluginName: string, silent?: boolean) {
    const installCommand = this.createCommand().line(`plugin update ${pluginName}`);

    return this.execCommandSync(installCommand, { silent: !!silent } as tr.IExecOptions);
  }

  public execHelmPluginInstallCommand(pluginName: string, pluginUrl: string, autoUpdate = true, silent?: boolean): tr.IExecSyncResult {
    const installCommandResult = this.installPlugin(pluginUrl);
    if (installCommandResult.code === 1 && autoUpdate) {
      return this.updatePlugin(pluginName, silent);
    }

    return installCommandResult;
  }
}
