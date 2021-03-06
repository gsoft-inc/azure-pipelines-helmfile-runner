import * as tl from "azure-pipelines-task-lib/task";
import * as fs from "fs";
import * as tr from "azure-pipelines-task-lib/toolrunner";
import baseCommand from "./baseCommand"

const EXIT_CODE_SUCCESS = 0;
const EXIT_CODE_FAILURE = 2;
const namespace = tl.getInput('namespace');

export default class k8sCommand extends baseCommand {

    private kubeconfigPath: string;

    constructor(kubeconfigPath: string) {
        super(true);
        this.kubeconfigPath = kubeconfigPath;
    }
    public getTool(): string {
        return "kubectl";
    }

    public login(): void {
        process.env["KUBECONFIG"] = this.kubeconfigPath;
    }

    public logout(): void {
        if (this.kubeconfigPath != null && fs.existsSync(this.kubeconfigPath)) {
            delete process.env["KUBECONFIG"];
            fs.unlinkSync(this.kubeconfigPath);
        }
    }

    public setKubeConfigEnvVariable() {
        if (this.kubeconfigPath && fs.existsSync(this.kubeconfigPath)) {
            tl.setVariable("KUBECONFIG", this.kubeconfigPath);
            tl.setVariable('HelmfileExitCode', EXIT_CODE_SUCCESS.toString());
        }
        else {
            tl.error('KubernetesServiceConnectionNotFound');
            tl.setVariable('HelmfileExitCode', EXIT_CODE_FAILURE.toString());
            throw new Error('KubernetesServiceConnectionNotFound');
        }
    }

    public unsetKubeConfigEnvVariable() {
        var kubeConfigPath = tl.getVariable("KUBECONFIG");
        if (kubeConfigPath) {
            tl.setVariable("KUBECONFIG", "");
        }
        tl.setVariable('HelmfileExitCode', EXIT_CODE_SUCCESS.toString());
    }

    public getAllPods(): tr.IExecSyncResult {
        var command = this.createCommand();
        command.arg('get');
        command.arg('pods');
        command.arg(['-o', 'json']);
        if (namespace)
            command.arg(['--namespace', namespace]);
        return this.execCommandSync(command, { silent: true } as tr.IExecOptions);
    }

    public getClusterInfo(): tr.IExecSyncResult {
        const command = this.createCommand();
        command.arg('cluster-info');
        return this.execCommandSync(command);
    }
}