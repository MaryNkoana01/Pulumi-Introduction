import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure";
import * as fs from "fs";

// Load the configuration file
const config = new pulumi.Config();
const containerNames = config.require("containerNames").split(",");
const location = config.require("azure-native:location");

// Create an Azure Resource Group
const resourceGroup = new azure.core.ResourceGroup("staticWebResourceGroup", {
    location: location,
});

// Create a Storage Account with a shorter name
const storageAccount = new azure.storage.Account("staticsa", {
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

// Upload index.html to the storage account
const indexHtml = new azure.storage.Blob("index.html", {
    storageAccountName: storageAccount.name,
    storageContainerName: "$web",  // $web is the default container for static websites
    type: "Block",  // Type of blob
    source: new pulumi.asset.FileAsset("index.html"),
    contentType: "text/html",
});

// Export the primary endpoint of the static website
export const staticEndpoint = storageAccount.primaryWebEndpoint;
