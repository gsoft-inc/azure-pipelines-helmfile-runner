# Helmfile runner for Azure Pipelines

This is an [Azure DevOps extension](https://marketplace.visualstudio.com/items?itemName=GSoft.HelmfileRunner) that allows you to run the [helmfile cli tool](https://github.com/roboll/helmfile).

## Installation

Helmfile runner for Azure Pipelines can be installed from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=GSoft.HelmfileRunner).

## Usage

**Prerequesites:** To use this extension, you must have the [Helm](https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/tool/helm-installer?view=azure-devops) and [Helmfile](https://marketplace.visualstudio.com/items?itemName=GSoft.HelmfileInstaller) cli tools installed beforehand.

To use the helmfile runner, simply set up the Kubernetes cluster on which you wish to execute the command with either ARM or an existing service connection.

![authentication](https://raw.githubusercontent.com/gsoft-inc/azure-pipelines-helmfile-runner/master/docs/authentication.png)

Then configure the task and required parameters. If you need to pass command specific arguments, for example the output format for the diff command (`--output value`), insert one argument per line in the parameter's field.

**Note**: This extension automatically installs or updates the [helm diff plugin](https://github.com/databus23/helm-diff) required for the `helmfile diff` command. You can disable this in the 'Advanced' section.

![diff command](https://raw.githubusercontent.com/gsoft-inc/azure-pipelines-helmfile-runner/master/docs/diff_command.png)

## Compiling

There are GitHub actions that take care of compiling, packaging and publishing the extension.

## License

Copyright © 2021, Groupe GSoft Inc. This code is licensed under the Apache License, Version 2.0. You may obtain a copy of this license at https://github.com/gsoft-inc/azure-pipelines-helmfile-runner/blob/main/LICENSE.
