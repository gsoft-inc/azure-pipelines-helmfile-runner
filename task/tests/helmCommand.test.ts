import { expect } from 'chai';
import { IExecSyncResult } from 'azure-pipelines-task-lib/toolrunner';
import * as sinon from 'sinon';
import helmCommand, { PluginInfo } from '../src/helmCommand';

const helmDiffPluginName = 'diff';
const helmDiffPluginUrl = 'https://github.com/databus23/helm-diff';

const ok: IExecSyncResult = {
  code: 0,
  stdout: '',
  stderr: '',
  error: null
};

const error: IExecSyncResult = {
  ...ok,
  code: 1
};

describe('helmCommand', () => {
  describe('#execHelmPluginInstallCommand()', () => {
    it('should try to install if not found', async () => {
      const command = new helmCommand();
      let triedInstalled = false;
      let triedUpdated = false;

      sinon.stub(command, 'listInstalledPlugins').callsFake(_silent => {
        return [];
      });

      sinon.stub(command, 'installPlugin').callsFake((_url, _version, _silent) => {
        triedInstalled = true;
        return ok;
      });

      sinon.stub(command, 'updatePlugin').callsFake((_url, _silent) => {
        triedUpdated = true;
        return ok;
      });

      command.execHelmPluginInstallCommand(helmDiffPluginName, helmDiffPluginUrl);

      expect(triedInstalled).true;
      expect(triedUpdated).false;
    });
    it('should try to update if found and version is latest (default)', async () => {
      const command = new helmCommand();
      let triedInstalled = false;
      let triedUpdated = false;

      sinon.stub(command, 'listInstalledPlugins').callsFake(_silent => {
        return [new PluginInfo('diff', '1.1.1', '')];
      });

      sinon.stub(command, 'installPlugin').callsFake((_url, _version, _silent) => {
        triedInstalled = true;
        return ok;
      });

      sinon.stub(command, 'updatePlugin').callsFake((_url, _silent) => {
        triedUpdated = true;
        return ok;
      });

      command.execHelmPluginInstallCommand(helmDiffPluginName, helmDiffPluginUrl);

      expect(triedInstalled).false;
      expect(triedUpdated).true;
    });
    [
      { asked: '1.1.1', installed: '2.2.2' },
      { asked: '5.5.5', installed: '5.5.0' },
      { asked: 'v1.1.1', installed: 'v2.2.2' },
      { asked: 'v5.5.5', installed: 'v5.5.0' }
    ].forEach(function(version) {
      it(`should reinstall if found ${version.installed} and asked version is ${version.asked}`, async () => {
        const command = new helmCommand();
        let triedUnInstalled = false;
        let triedInstalled = false;
        let triedUpdated = false;

        sinon.stub(command, 'listInstalledPlugins').callsFake(_silent => {
          return [new PluginInfo('diff', version.installed, '')];
        });

        sinon.stub(command, 'unInstallPlugin').callsFake((_name, _silent) => {
          triedUnInstalled = true;
          return ok;
        });

        sinon.stub(command, 'installPlugin').callsFake((_url, _version, _silent) => {
          triedInstalled = true;
          return ok;
        });

        sinon.stub(command, 'updatePlugin').callsFake((_url, _silent) => {
          triedUpdated = true;
          return ok;
        });

        command.execHelmPluginInstallCommand(helmDiffPluginName, helmDiffPluginUrl, version.asked);

        expect(triedUnInstalled).true;
        expect(triedInstalled).true;
        expect(triedUpdated).false;
      });
    });

    it('should not reinstall if and asked version is installed', async () => {
      const version = '1.1.1';
      const command = new helmCommand();
      let triedUnInstalled = false;
      let triedInstalled = false;
      let triedUpdated = false;

      sinon.stub(command, 'listInstalledPlugins').callsFake(_silent => {
        return [new PluginInfo('diff', version, '')];
      });

      sinon.stub(command, 'unInstallPlugin').callsFake((_name, _silent) => {
        triedUnInstalled = true;
        return ok;
      });

      sinon.stub(command, 'installPlugin').callsFake((_url, _version, _silent) => {
        triedInstalled = true;
        return ok;
      });

      sinon.stub(command, 'updatePlugin').callsFake((_url, _silent) => {
        triedUpdated = true;
        return ok;
      });

      command.execHelmPluginInstallCommand(helmDiffPluginName, helmDiffPluginUrl, version);

      expect(triedUnInstalled).false;
      expect(triedInstalled).false;
      expect(triedUpdated).false;
    });
  });
});
