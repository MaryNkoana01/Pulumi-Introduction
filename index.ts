import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure";

// Load the configuration file
const config = new pulumi.Config();
const containerNames = config.require("containerNames").split(",");
const location = config.require("azure-native:location");

// Create an Azure Resource Group
const resourceGroup = new azure.core.ResourceGroup("staticWebsiteResourceGroup", {
    location: location,
});

// Create a Storage Account
const storageAccount = new azure.storage.Account("staticWebsiteStorageAccount", {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    accountTier: "Standard",
    accountReplicationType: "LRS",
    staticWebsite: {
        indexDocument: "index.html",
        error404Document: "error.html",
    },
});

// Create Blob Containers
containerNames.forEach(containerName => {
    new azure.storage.Container(containerName, {
        storageAccountName: storageAccount.name,
        containerAccessType: "blob",
    });
});

// Export the primary endpoint of the static website
export const staticEndpoint = storageAccount.primaryWebEndpoint;
