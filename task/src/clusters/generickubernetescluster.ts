import * as tl from "azure-pipelines-task-lib/task";
import * as kubectlutility from "azure-pipelines-tasks-kubernetes-common-v2/kubectlutility";

export async function getKubeConfig(): Promise<string> {
    var kubernetesServiceEndpoint = tl.getInput("kubernetesServiceEndpoint", true);
    var authorizationType = tl.getEndpointDataParameter(kubernetesServiceEndpoint, 'authorizationType', true);
    if (!authorizationType || authorizationType === "Kubeconfig") {
        return kubectlutility.getKubeconfigForCluster(kubernetesServiceEndpoint);
    }
    else if (authorizationType === "ServiceAccount" || authorizationType === "AzureSubscription") {
        return kubectlutility.createKubeconfig(kubernetesServiceEndpoint);
    }
}