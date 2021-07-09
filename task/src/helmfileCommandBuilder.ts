import helmfileCommand from "./helmfileCommand";
import * as tl from "azure-pipelines-task-lib/task";

export const inputNames = {
    helmfilePath: "helmfilePath",
    environment: "environment",
    stateValuesSet: "stateValuesSet",
    stateValuesFile: "stateValuesFile",
    quiet: "quiet",
    kubeContext: "kubeContext",
    debug: "debug",
    noColor: "noColor",
    logLevel: "logLevel",
    namespace: "namespace",
    selector: "selector",
    allowNoMatchingRelease: "allowNoMatchingRelease",
    commandArgs: "commandArgs",
};

export class helmfileCommandBuilder {

    private _helmfile: helmfileCommand;
    private _baseCommand: string;

    constructor(baseCommand: string, helmfile?: helmfileCommand) {
        this._helmfile = helmfile ? helmfile : new helmfileCommand();
        this._baseCommand = baseCommand;
    }

    private addArguments() {
        // helmfile path
        const helmfilePath = tl.getInput(inputNames.helmfilePath);
        this._helmfile.addArgument(`--file ${helmfilePath}`);

        // environment  
        const environment = tl.getInput(inputNames.environment);
        if (environment) {
            this._helmfile.addArgument(`--environment ${environment}`);
        }

        // stateValuesSet
        const stateValuesSet = tl.getInput(inputNames.stateValuesSet);
        if (stateValuesSet) {
            this._helmfile.addArgument(`--state-values-set ${stateValuesSet}`);
        }

        // stateValuesFile
        const stateValuesFile = tl.getInput(inputNames.stateValuesFile);
        if (stateValuesFile) {
            this._helmfile.addArgument((`--state-values-file ${stateValuesFile}`));
        }

        // quiet
        const quiet = tl.getBoolInput(inputNames.quiet);
        if (quiet) {
            this._helmfile.addArgument("--quiet");
        }

        // kubeContext
        const kubeContext = tl.getInput(inputNames.kubeContext);
        if (kubeContext) {
            this._helmfile.addArgument(`--kube-context ${kubeContext}`);
        }

        // debug
        const debug = tl.getBoolInput(inputNames.debug);
        if (debug) {
            this._helmfile.addArgument("--debug");
        }

        // logLevel
        const logLevel = tl.getInput(inputNames.logLevel);
        if (logLevel) {
            this._helmfile.addArgument(`--log-level ${logLevel}`);
        }

        // namespace
        const namespace = tl.getInput(inputNames.namespace);
        if (namespace) {
            this._helmfile.addArgument(`--namespace ${namespace}`);
        }

        // selector(s)
        if (tl.getInput(inputNames.selector)) {
            const selectors = tl.getDelimitedInput(inputNames.selector, new RegExp("[\r\n]", "g"));
            if (selectors) {
                this._helmfile.addArgument(selectors.map(selector => `-l ${selector.trim()}`).join(" ").trim());
            }
        }

        // noColor
        const noColor = tl.getBoolInput(inputNames.noColor);
        if (noColor) {
            this._helmfile.addArgument("--no-color");
        }

        // allowNoMatchingRelease
        const allowNoMatchingRelease = tl.getBoolInput(inputNames.allowNoMatchingRelease);
        if (allowNoMatchingRelease) {
            this._helmfile.addArgument("--allow-no-matching-release");
        }

        // commandArgs
        if (tl.getInput(inputNames.commandArgs)) {
            const commandArgs = tl.getDelimitedInput(inputNames.commandArgs, new RegExp("[\r\n]", "g"));
            if (commandArgs) {
                this._helmfile.addArgument(commandArgs.map(commandArg => `${commandArg.trim()}`).join(" ").trim());
            }
        }
    }

    public build() {

        switch (this._baseCommand) {
            case "help":
            case "version":
                this._helmfile.setCommand(this._baseCommand);
                break;
            default:
                this.addArguments();
                this._helmfile.setCommand(this._baseCommand);
        }

        return this._helmfile;
    }
}