"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { uploadAttachment } from "@/lib/files";
import { RFQ, Quotation } from "@/types/rfq";

interface UseQuoteSubmissionParams {
  rfqsList: RFQ[];
  loadData: () => Promise<void>;
}

export function useQuoteSubmission({ rfqsList, loadData }: UseQuoteSubmissionParams) {
  const [quoteModalRfq, setQuoteModalRfq] = useState<RFQ | null>(null);
  const [revisingQuoteId, setRevisingQuoteId] = useState<number | null>(null);
  const [revisingQuoteNo, setRevisingQuoteNo] = useState<string | null>(null);
  const [quoteCurrency, setQuoteCurrency] = useState("INR");
  const [quoteDeliveryTime, setQuoteDeliveryTime] = useState("14 business days");
  const [quoteLineItemPrices, setQuoteLineItemPrices] = useState<
    Record<number, { unitPrice: string; notes: string }>
  >({});
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [quotePendingFile, setQuotePendingFile] = useState<File | null>(null);
  const [quoteFileError, setQuoteFileError] = useState<string | null>(null);

  // VENDOR: Open Quote Submission Modal
  const handleOpenQuoteModal = (rfq: RFQ) => {
    setRevisingQuoteId(null);
    setRevisingQuoteNo(null);
    setQuotePendingFile(null);
    setQuoteFileError(null);
    setQuoteModalRfq(rfq);
    setQuoteCurrency(rfq.currency || "INR");
    setQuoteDeliveryTime("14 business days");

    const initialPrices: Record<number, { unitPrice: string; notes: string }> = {};
    if (rfq.lineItems && rfq.lineItems.length > 0) {
      rfq.lineItems.forEach((item) => {
        if (item.id) {
          initialPrices[item.id] = { unitPrice: "", notes: "" };
        }
      });
    }
    setQuoteLineItemPrices(initialPrices);
  };

  // VENDOR & ADMIN: Open Revise Quotation Modal
  const handleOpenReviseModal = (quote: Quotation) => {
    const rfq = quote.rfq || rfqsList.find((r) => r.id === quote.rfqId);
    if (rfq?.deadline && new Date(rfq.deadline).getTime() < Date.now()) {
      toast.error("RFQ bidding deadline has passed. Quotation revisions are closed.");
      return;
    }
    if (quote.status === "ACCEPTED") {
      toast.error("Accepted/awarded quotations cannot be revised.");
      return;
    }
    if (quote.status === "REJECTED") {
      toast.error("Rejected quotations cannot be revised.");
      return;
    }

    setRevisingQuoteId(quote.id);
    setRevisingQuoteNo(quote.quoteNo);
    setQuotePendingFile(null);
    setQuoteFileError(null);

    const fullRfq = rfqsList.find((r) => r.id === quote.rfqId);
    const targetRfq: RFQ = fullRfq && fullRfq.lineItems?.length ? fullRfq : {
      id: quote.rfqId,
      title: quote.rfq?.title || "RFQ Tender",
      description: "",
      location: quote.rfq?.location || "—",
      currency: quote.currency || "INR",
      deadline: quote.rfq?.deadline || "",
      status: quote.rfq?.status || "PUBLISHED",
      createdById: 0,
      createdAt: "",
      updatedAt: "",
      lineItems: (quote.lineItems || []).map((li: any) => ({
        id: li.rfqLineItemId,
        rfqId: quote.rfqId,
        name: li.rfqLineItem?.name || `Item #${li.rfqLineItemId}`,
        quantity: li.rfqLineItem?.quantity || 1,
        unit: li.rfqLineItem?.unit || "pcs",
        specifications: li.rfqLineItem?.specifications || "",
      })),
    };

    setQuoteModalRfq(targetRfq);
    setQuoteCurrency(quote.currency || targetRfq.currency || "INR");
    setQuoteDeliveryTime(quote.deliveryTime || "14 business days");

    const initialPrices: Record<number, { unitPrice: string; notes: string }> = {};
    if (quote.lineItems && quote.lineItems.length > 0) {
      quote.lineItems.forEach((li) => {
        initialPrices[li.rfqLineItemId] = {
          unitPrice: String(li.unitPrice ?? ""),
          notes: li.notes || "",
        };
      });
    }
    setQuoteLineItemPrices(initialPrices);
  };

  const handleQuotePriceChange = (lineItemId: number, field: "unitPrice" | "notes", val: string) => {
    setQuoteLineItemPrices((prev) => ({
      ...prev,
      [lineItemId]: {
        ...(prev[lineItemId] || { unitPrice: "", notes: "" }),
        [field]: val,
      },
    }));
  };

  // Submit or Revise Quotation API
  const handleCreateQuote = async () => {
    if (!quoteModalRfq) return;

    const lineItemsToSubmit: Array<{ rfqLineItemId: number; unitPrice: number; notes?: string }> = [];

    for (const item of quoteModalRfq.lineItems || []) {
      if (!item.id) continue;
      const entry = quoteLineItemPrices[item.id];
      const priceNum = entry ? Number(entry.unitPrice) : 0;
      if (isNaN(priceNum) || priceNum <= 0) {
        toast.error(`Please enter a valid positive unit price for "${item.name}"`);
        return;
      }
      lineItemsToSubmit.push({
        rfqLineItemId: item.id,
        unitPrice: priceNum,
        notes: entry.notes || undefined,
      });
    }

    if (lineItemsToSubmit.length === 0) {
      toast.error("At least one line item quotation price is required");
      return;
    }

    setIsSubmittingQuote(true);
    try {
      if (revisingQuoteId) {
        const revisedQuote = await api.reviseQuotation(revisingQuoteId, {
          currency: quoteCurrency || quoteModalRfq.currency || "INR",
          deliveryTime: quoteDeliveryTime,
          lineItems: lineItemsToSubmit,
        });

        if (quotePendingFile) {
          try {
            await uploadAttachment({
              file: quotePendingFile,
              quotationId: revisingQuoteId,
            });
            toast.success("Document attached to revised quotation!");
          } catch (uploadErr: any) {
            console.error("Failed to upload attachment on revision:", uploadErr);
            toast.error("Quote revised, but file upload failed: " + (uploadErr.message || "Upload error"));
          }
        }

        const revNumber = revisedQuote.revisions?.[0]?.revisionNo || 2;
        toast.success(`Quotation Revised Successfully! (Revision #${revNumber})`, {
          description: `Quote ${revisedQuote.quoteNo} updated with total: ${revisedQuote.currency} ${Number(revisedQuote.totalPriceQuote).toLocaleString()}`,
        });
      } else {
        const quote = await api.createQuotation({
          rfqId: quoteModalRfq.id,
          currency: quoteCurrency || quoteModalRfq.currency || "INR",
          deliveryTime: quoteDeliveryTime,
          status: "SUBMITTED",
          lineItems: lineItemsToSubmit,
        });

        if (quotePendingFile) {
          try {
            await uploadAttachment({
              file: quotePendingFile,
              quotationId: quote.id,
            });
            toast.success("Proposal document attached to quotation!");
          } catch (uploadErr: any) {
            console.error("Failed to upload attachment on quote creation:", uploadErr);
            toast.error("Quote submitted, but file upload failed: " + (uploadErr.message || "Upload error"));
          }
        }

        toast.success("Quotation Submitted Successfully!", {
          description: `Quote ${quote.quoteNo} (${quote.currency} ${quote.totalPriceQuote}) has been submitted for RFQ #${quoteModalRfq.id}.`,
        });
      }

      setQuotePendingFile(null);
      setQuoteFileError(null);
      setQuoteModalRfq(null);
      setRevisingQuoteId(null);
      setRevisingQuoteNo(null);
      await loadData();
    } catch (err: any) {
      toast.error(revisingQuoteId ? "Failed to revise quotation" : "Failed to submit quotation", {
        description: err.message || "An error occurred while processing quotation.",
      });
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  const handleCloseQuoteModal = () => {
    setQuoteModalRfq(null);
    setRevisingQuoteId(null);
    setRevisingQuoteNo(null);
  };

  return {
    quoteModalRfq,
    setQuoteModalRfq,
    revisingQuoteId,
    revisingQuoteNo,
    quoteCurrency,
    setQuoteCurrency,
    quoteDeliveryTime,
    setQuoteDeliveryTime,
    quoteLineItemPrices,
    isSubmittingQuote,
    quotePendingFile,
    setQuotePendingFile,
    quoteFileError,
    setQuoteFileError,
    handleOpenQuoteModal,
    handleOpenReviseModal,
    handleQuotePriceChange,
    handleCreateQuote,
    handleCloseQuoteModal,
  };
}
