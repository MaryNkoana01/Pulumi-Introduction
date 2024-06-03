import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as storage from "@pulumi/azure-native/storage";
import * as azure from "@pulumi/azure";
// Load the configuration file
const config = new pulumi.Config();
const containerNames = config.require("containerNames").split(",");

// Create an Azure Resource Group
const resourceGroup = new azure.core.ResourceGroup("staticWebsiteResourceGroup");

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
