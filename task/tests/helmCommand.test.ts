import { expect } from 'chai';
import { IExecSyncResult } from 'azure-pipelines-task-lib/toolrunner';
import * as sinon from 'sinon';
import helmCommand from '../src/helmCommand';

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
      sinon.stub(command, 'installPlugin').callsFake((_url, _silent) => {
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
    it('should try to update if found and auto update true', async () => {
      const command = new helmCommand();
      let triedInstalled = false;
      let triedUpdated = false;
      sinon.stub(command, 'installPlugin').callsFake((_url, _silent) => {
        triedInstalled = true;
        return error;
      });

      sinon.stub(command, 'updatePlugin').callsFake((_url, _silent) => {
        triedUpdated = true;
        return ok;
      });

      command.execHelmPluginInstallCommand(helmDiffPluginName, helmDiffPluginUrl);

      expect(triedInstalled).true;
      expect(triedUpdated).true;
    });
    it('should not try to update if found and auto update false', async () => {
      const command = new helmCommand();
      let triedInstalled = false;
      let triedUpdated = false;
      sinon.stub(command, 'installPlugin').callsFake((_url, _silent) => {
        triedInstalled = true;
        return error;
      });

      sinon.stub(command, 'updatePlugin').callsFake((_url, _silent) => {
        triedUpdated = true;
        return ok;
      });

      command.execHelmPluginInstallCommand(helmDiffPluginName, helmDiffPluginUrl, false);

      expect(triedInstalled).true;
      expect(triedUpdated).false;
    });
  });
});
