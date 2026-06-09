import { NextRequest, NextResponse } from "next/server";
import { getFilesFromSalesforce, getGenericTabDataFromSalesforce } from "@/lib/proposal-service";
import { uploadFilesToSalesforce, getFileUrl } from "@/lib/salesforce-service";


export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const accountId = searchParams.get("accountId");
        const contactId = searchParams.get("contactId"); // Default placeholder
        const proposalId = searchParams.get("proposalId") || ""
        const action = searchParams.get("action") || "";
        const objectName = searchParams.get("objectName");

        if (!accountId || !contactId) {
            return NextResponse.json(
                { error: "Missing required parameters: accountId, contactId" },
                { status: 400 }
            );
        }

        let data;

        if (action == "files") {
            data = await getFilesFromSalesforce(accountId, contactId, proposalId);
        }

        else if (action === "download" || action === "preview") {
            const contentVersionId = searchParams.get("contentVersionId");
            if (!contentVersionId) {
                return NextResponse.json({ error: "Missing contentVersionId for file action" }, { status: 400 });
            }
            data = await getFileUrl(contentVersionId);
            if (!data) {
                return NextResponse.json({ error: "Failed to get file URL" }, { status: 500 });
            }
        }

        else {
            // Map action to correct tabName
            let tabName;
            if (action == "products") tabName = "Products";
            else if (action == "elements") tabName = "Elements";
            else if (action == "projects") tabName = "Projects";
            else if (action == "orders") tabName = "Orders";
            else if (action == "purchases") tabName = "Purchases"; // Assumed tab name
            else if (action == "returns") tabName = "Returns"; // Assumed tab name
            else if (action == "taxes") tabName = "Proposal";
            else if (action == "fulfillment" || action == "fulfillments") tabName = "Fulfillment"; // Standardized to Fulfillment
            else tabName = "Proposal";
            data = await getGenericTabDataFromSalesforce(accountId, contactId, proposalId, tabName, objectName || "Proposal__c");
        }
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in proposals API:", error);
        return NextResponse.json({ error: "Failed to fetch proposals" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { accountId, contactId, objectId, files } = body;

        if (!accountId || !contactId || !objectId || !files || !Array.isArray(files)) {
            return NextResponse.json(
                { error: "Missing required parameters or invalid format" },
                { status: 400 }
            );
        }

        const uploadData = {
            accountId,
            contactId,
            objectId,
            objectName: "Proposal__c",
            files
        };

        const result = await uploadFilesToSalesforce(uploadData);
        return NextResponse.json(result);

    } catch (error) {
        console.error("Error in proposal file upload API:", error);
        return NextResponse.json(
            { error: "Failed to upload files" },
            { status: 500 }
        );
    }
}
