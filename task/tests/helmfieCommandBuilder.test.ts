import { expect } from 'chai';
import * as tl from 'azure-pipelines-task-lib/task';
import * as path from 'path';
import * as fs from 'fs';
import * as rimraf from 'rimraf';
import * as sinon from 'sinon';
import { helmfileCommandBuilder, inputNames } from '../src/helmfileCommandBuilder';

const tempDirectory = path.join(__dirname, 'temp');
const toolsDirectory = path.join(__dirname, 'tools');
const inputStub = sinon.stub(tl, 'getInput');
const boolInputStub = sinon.stub(tl, 'getBoolInput');
const delimitedInputStub = sinon.stub(tl, 'getDelimitedInput');

const defaultHelmfilePath = 'helmfile.yaml';

describe('helmfileCommandBuilder', () => {
  before(function() {
    if (!fs.existsSync(tempDirectory)) {
      fs.mkdirSync(tempDirectory);
    }

    if (!fs.existsSync(toolsDirectory)) {
      fs.mkdirSync(toolsDirectory);
    }

    tl.setVariable('agent.TempDirectory', tempDirectory);
    tl.setVariable('agent.ToolsDirectory', toolsDirectory);
  });
  after(function() {
    rimraf(tempDirectory, (_: any) => {
      return;
    });
    rimraf(toolsDirectory, (_: any) => {
      return;
    });
  });
  describe('#helmfileCommandBuilder()', () => {
    it('should find tool and add file argument', async () => {
      inputStub.withArgs(inputNames.helmfilePath).returns(defaultHelmfilePath);

      const helmfileCommand = new helmfileCommandBuilder('diff').build();
      helmfileCommand.execHelmfileCommand();
      expect(helmfileCommand.getToolPath()).to.contain('helmfile');
      expect(helmfileCommand.getArguments()).to.contain(`--file ${defaultHelmfilePath}`);
    });
    it('should add environment argument if not null or empty', async () => {
      const environment = 'production';
      inputStub.withArgs(inputNames.environment).returns(environment);

      const helmfileCommand = new helmfileCommandBuilder('diff').build();
      expect(helmfileCommand.getToolPath()).to.contain('helmfile');
      expect(helmfileCommand.getArguments()).to.contain(`--environment ${environment}`);
    });
    it('should add log level', async () => {
      inputStub.withArgs(inputNames.logLevel).returns('Warn');

      const helmfileCommand = new helmfileCommandBuilder('diff').build();
      expect(helmfileCommand.getToolPath()).to.contain('helmfile');
      expect(helmfileCommand.getArguments()).contain('--log-level Warn');
    });
    it('should add quiet flag if true', async () => {
      boolInputStub.withArgs(inputNames.quiet).returns(true);

      const helmfileCommand = new helmfileCommandBuilder('diff').build();
      expect(helmfileCommand.getToolPath()).to.contain('helmfile');
      expect(helmfileCommand.getArguments()).contain('--quiet');
    });
    it('should add debug flag if true', async () => {
      boolInputStub.withArgs(inputNames.debug).returns(true);

      const helmfileCommand = new helmfileCommandBuilder('diff').build();
      expect(helmfileCommand.getToolPath()).to.contain('helmfile');
      expect(helmfileCommand.getArguments()).contain('--debug');
    });
    it('should parse selectors', async () => {
      const input = ' tier=frontend,tier!=proxy \n tier=backend ';
      inputStub.withArgs(inputNames.selector).returns(input);
      delimitedInputStub.callsFake((_name, delim) => {
        return input.split(delim);
      });

      const helmfileCommand = new helmfileCommandBuilder('diff').build();
      expect(helmfileCommand.getArguments()).contain('-l tier=frontend,tier!=proxy -l tier=backend');
    });
    it('should add selectors', async () => {
      const input = ' tier=frontend,tier!=proxy \n tier=backend ';
      const delimitedInput = ['tier=frontend,tier!=proxy', 'tier=backend'];

      inputStub.withArgs(inputNames.selector).returns(input);
      delimitedInputStub.withArgs(inputNames.selector, sinon.match.any).returns(delimitedInput);

      const helmfileCommand = new helmfileCommandBuilder('diff').build();
      expect(helmfileCommand.getToolPath()).to.contain('helmfile');
      expect(helmfileCommand.getArguments()).contain('-l tier=frontend,tier!=proxy -l tier=backend');
    });
  });
});
