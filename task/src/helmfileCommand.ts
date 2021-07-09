import * as tr from "azure-pipelines-task-lib/toolrunner";
import baseCommand from "./baseCommand";

export default class helmfileCommand extends baseCommand {

    private command: string;
    private arguments: string[] = [];
    private commandArguments: string;

    constructor() {
        super(true)
    }

    public getTool(): string {
        return "helmfile";
    }

    public login(): void {

    }

    public logout(): void {

    }

    public setCommand(command: string): void {
        this.command = command;
    }

    public getCommand(): string {
        return this.command;
    }

    public addArgument(argument: string): void {
        this.arguments.push(argument);
    }

    public setCommandArgument(commandArguments: string): void {
        this.commandArguments = commandArguments;
    }

    public getArguments(): string[] {
        return this.arguments;
    }

    public resetArguments(): void {
        this.arguments = [];
    }

    public execHelmfileCommand(silent?: boolean): tr.IExecSyncResult {
        var command = this.createCommand();
        this.arguments.forEach((value) => {
            command.line(value);
        });

        command.arg(this.command);

        if (this.commandArguments) {
            command.line(this.commandArguments);
        }

        return this.execCommandSync(command, { silent: !!silent } as tr.IExecOptions);
    }
}