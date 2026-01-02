import { NextRequest, NextResponse } from "next/server";
import { getProposalsFromSalesforce, getFilesFromSalesforce, getProposalElementsFromSalesforce, getProposedProductsFromSalesforce, getGenericTabDataFromSalesforce } from "@/lib/proposal-service";
import { uploadFilesToSalesforce } from "@/lib/salesforce-service";


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

        if ((action == "list") || (action == "view")) {
            data = await getProposalsFromSalesforce(accountId, contactId, proposalId);
        }
        else if (action == "files") {
            data = await getFilesFromSalesforce(accountId, contactId, proposalId);
        }
        else if (action == "elements") {
            data = await getProposalElementsFromSalesforce(accountId, contactId, proposalId);
        }
        else if (action == "products") {
            data = await getProposedProductsFromSalesforce(accountId, contactId, proposalId);
        }
        else if (action == "projects" || action == "orders" || action == "fulfillments" || action == "purchases" || action == "returns") {
            // Map action to correct tabName
            let tabName;
            if (action == "projects") tabName = "Projects";
            else if (action == "orders") tabName = "Orders";
            else if (action == "purchases") tabName = "Purchases"; // Assumed tab name
            else if (action == "returns") tabName = "Returns"; // Assumed tab name
            else tabName = "Fulfillment"; // Note: singular, not plural

            data = await getGenericTabDataFromSalesforce(accountId, contactId, proposalId, tabName, objectName || "Proposal__c");
        }
        console.log("result data", NextResponse.json(data));
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
