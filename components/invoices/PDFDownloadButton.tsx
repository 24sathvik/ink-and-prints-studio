/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Loader2, Download } from "lucide-react";
import { InvoicePDF } from "./InvoicePDF";

export default function PDFDownloadButton({ pdfData, invoiceNumber }: { pdfData: any, invoiceNumber: string }) {
  return (
    <PDFDownloadLink
      document={<InvoicePDF data={pdfData} />}
      fileName={`${invoiceNumber}_${pdfData.customerName || "Customer"}.pdf`}
      className="inline-flex items-center justify-center rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 text-sm font-medium transition-colors"
    >
      {({ loading }) => (
        <>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
          Download PDF
        </>
      )}
    </PDFDownloadLink>
  );
}
