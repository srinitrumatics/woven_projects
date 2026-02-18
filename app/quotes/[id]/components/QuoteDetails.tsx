import { QuoteDetails, QuoteLine } from "../../types";
import QuoteSummary from "./QuoteSummary";
import QuoteKeyDates from "./QuoteKeyDates";
import QuoteBillingInfo from "./QuoteBillingInfo";
import QuoteShippingInfo from "./QuoteShippingInfo";
import QuoteNotes from "./QuoteNotes";

interface QuoteDetailsProps {
    quote: QuoteDetails;
    lines: QuoteLine[];
}

export default function QuoteDetailsSection({ quote, lines }: QuoteDetailsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            <div className="lg:col-span-7 flex flex-col gap-6 ">

                {/* Key Dates */}
                <QuoteKeyDates quote={quote} />

                {/* Billing & Shipping */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 ">
                    <QuoteBillingInfo quote={quote} />
                    <QuoteShippingInfo quote={quote} />
                </div>

            </div>

            <div className="lg:col-span-3 flex flex-col gap-6 h-full">
                {/* Notes Card */}
                <QuoteNotes notes={quote.notes || ""} />

                <QuoteSummary quote={quote} lines={lines} grandTotal={quote.grandTotal} />
            </div>
        </div>
    );
}
