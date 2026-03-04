import { QuoteDetails, QuoteLine } from "../../types";
import QuoteSummary from "./QuoteSummary";
import QuoteKeyDates from "./QuoteKeyDates";
import QuoteBillingInfo from "./QuoteBillingInfo";
import QuoteShippingInfo from "./QuoteShippingInfo";
import QuoteNotes from "./QuoteNotes";

interface QuoteDetailsProps {
    quote: QuoteDetails;
    lines: QuoteLine[];
    isUploading?: boolean;
    handleFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function QuoteDetailsSection({ quote, lines, isUploading, handleFileUpload }: QuoteDetailsProps) {
    return (
        <div className="grid grid-cols-1 w1025:grid-cols-10 gap-6 items-stretch">
            {/* Row 1 Left - Key Dates (70%) */}
            <div className="w1025:col-span-7">
                <QuoteKeyDates quote={quote} className="h-full" />
            </div>

            {/* Row 1 Right - Quote Notes (30%) */}
            <div className="w1025:col-span-3">
                <QuoteNotes notes={quote.notes || ""} className="h-full" />
            </div>

            {/* Row 2 Left - Billing & Shipping (70%) */}
            <div className="w1025:col-span-7">
                <div className="grid grid-cols-1 w1025:grid-cols-2 gap-4 h-full">
                    <QuoteBillingInfo quote={quote} />
                    <QuoteShippingInfo quote={quote} />
                </div>
            </div>

            {/* Row 2 Right - Quote Summary (30%) */}
            <div className="w1025:col-span-3 flex flex-col">
                <QuoteSummary
                    className="h-full"
                    quote={quote}
                    lines={lines}
                    grandTotal={quote.grandTotal}
                    isUploading={isUploading}
                    handleFileUpload={handleFileUpload}
                />
            </div>
        </div>
    );
}
