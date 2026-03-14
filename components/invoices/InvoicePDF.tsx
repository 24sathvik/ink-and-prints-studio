import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  header: { borderBottom: 1, borderBottomColor: "#1e293b", paddingBottom: 10, marginBottom: 20 },
  brand: { fontSize: 24, fontWeight: "bold", color: "#1e293b" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  label: { color: "#64748b", width: 100 },
  value: { flex: 1, fontWeight: "bold" },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 10, color: "#ea580c" },
  table: { width: "auto", borderStyle: "solid", borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { flexDirection: "row" },
  tableCol: { width: "25%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
  tableColDesc: { width: "50%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
  tableColQty: { width: "12.5%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
  tableColRate: { width: "12.5%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
  tableCellHeader: { margin: 5, fontSize: 10, fontWeight: "bold" },
  tableCell: { margin: 5, fontSize: 10 },
  footer: { position: "absolute", bottom: 40, left: 40, right: 40, textAlign: "center", borderTop: 1, borderTopColor: "#e2e8f0", paddingTop: 10, color: "#64748b" }
});

interface PDFData {
  invoiceNumber?: string;
  date?: string | Date;
  customerName: string;
  phone: string;
  brideName?: string | null;
  groomName?: string | null;
  modelNumber?: string | null;
  description: string;
  quantity: number;
  unitRate: number;
  advancePaid: boolean;
  advanceAmount?: number | null;
  advanceMode?: string | null;
  balanceMode?: string | null;
  estimatedDesignTime?: string | null;
  estimatedPrintTime?: string | null;
  packing: string;
}

export const InvoicePDF = ({ data }: { data: PDFData }) => {
  const quantity = Number(data.quantity);
  const toleranceQuantity = Math.floor(quantity * 0.95);
  const unitRate = Number(data.unitRate);
  const totalAmount = quantity * unitRate;
  
  const advanceAmount = data.advancePaid ? Number(data.advanceAmount || 0) : 0;
  const balance = totalAmount - advanceAmount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>Ink and Prints Studio</Text>
          <View style={[styles.row, { marginTop: 10 }]}>
            <Text style={{ fontSize: 12 }}>Invoice No: {data.invoiceNumber || "DRAFT"}</Text>
            <Text style={{ fontSize: 12 }}>Date: {data.date ? format(new Date(data.date), "dd MMM yyyy") : format(new Date(), "dd MMM yyyy")}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{data.customerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{data.phone}</Text>
          </View>
          {(data.brideName || data.groomName) && (
            <View style={styles.row}>
              <Text style={styles.label}>Bride & Groom:</Text>
              <Text style={styles.value}>{(data.brideName || "")} {data.brideName && data.groomName ? "&" : ""} {(data.groomName || "")}</Text>
            </View>
          )}
          {data.modelNumber && (
            <View style={styles.row}>
              <Text style={styles.label}>Model No:</Text>
              <Text style={styles.value}>{data.modelNumber}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableColDesc}><Text style={styles.tableCellHeader}>Description</Text></View>
              <View style={styles.tableColQty}><Text style={styles.tableCellHeader}>Qty</Text></View>
              <View style={styles.tableColRate}><Text style={styles.tableCellHeader}>Rate (₹)</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCellHeader}>Total Amount (₹)</Text></View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableColDesc}><Text style={styles.tableCell}>{data.description}</Text></View>
              <View style={styles.tableColQty}><Text style={styles.tableCell}>{quantity}</Text></View>
              <View style={styles.tableColRate}><Text style={styles.tableCell}>{unitRate.toFixed(2)}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{totalAmount.toFixed(2)}</Text></View>
            </View>
          </View>
          <Text style={{ fontSize: 9, color: "#64748b", marginTop: 5, fontStyle: "italic" }}>
            * 5% tolerance: effective quantity = {toleranceQuantity} units.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment & Delivery</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Advance Paid:</Text>
            <Text style={styles.value}>{data.advancePaid ? `₹${advanceAmount.toFixed(2)} (${data.advanceMode})` : "No"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Balance:</Text>
            <Text style={styles.value}>
              {!data.advancePaid ? "Unpaid" : `₹${balance.toFixed(2)} ${data.balanceMode ? `(${data.balanceMode})` : ""}`}
            </Text>
          </View>
          {data.estimatedDesignTime && (
             <View style={styles.row}>
               <Text style={styles.label}>Est. Design Time:</Text>
               <Text style={styles.value}>{data.estimatedDesignTime}</Text>
             </View>
          )}
          {data.estimatedPrintTime && (
             <View style={styles.row}>
               <Text style={styles.label}>Est. Print Time:</Text>
               <Text style={styles.value}>{data.estimatedPrintTime}</Text>
             </View>
          )}
          <View style={styles.row}>
             <Text style={styles.label}>Packing:</Text>
             <Text style={styles.value}>{data.packing === "WITH_PACKING" ? "With Packing" : "Without Packing"}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Thank you for choosing Ink and Prints Studio! We appreciate your business.
        </Text>
      </Page>
    </Document>
  );
};
