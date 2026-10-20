"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface UseRfqFormParams {
  loadData: () => Promise<void>;
  setActiveTab: (tab: string) => void;
}

export function useRfqForm({ loadData, setActiveTab }: UseRfqFormParams) {
  const [editingRfqId, setEditingRfqId] = useState<number | null>(null);
  const [rfqTitle, setRfqTitle] = useState("");
  const [rfqDescription, setRfqDescription] = useState("");
  const [rfqCategory, setRfqCategory] = useState("Industrial Automation");
  const [rfqLocation, setRfqLocation] = useState("");
  const [rfqCurrency, setRfqCurrency] = useState("INR");
  const [rfqBudget, setRfqBudget] = useState("");
  const [rfqDeadline, setRfqDeadline] = useState("");
  const [rfqLineItems, setRfqLineItems] = useState<
    Array<{
      name: string;
      description?: string;
      quantity: number | string;
      unit: string;
      specifications?: string;
    }>
  >([
    {
      name: "High Precision Optical Sensor (PNP)",
      quantity: 100,
      unit: "pcs",
      specifications: "IP67 rated, 10-30V DC, M12 connector",
    },
  ]);
  const [isCreatingRfq, setIsCreatingRfq] = useState(false);

  // Helper to open Create RFQ tab
  const handleOpenCreateRfq = () => {
    setEditingRfqId(null);
    setRfqTitle("");
    setRfqDescription("");
    setRfqLocation("");
    setRfqCurrency("INR");
    setRfqBudget("");
    setRfqDeadline("");
    setRfqLineItems([
      {
        name: "High Precision Optical Sensor (PNP)",
        quantity: 100,
        unit: "pcs",
        specifications: "IP67 rated, 10-30V DC, M12 connector",
      },
    ]);
    setActiveTab("create-rfq");
  };

  // RFQ Line Item Handlers
  const handleAddLineItem = () => {
    setRfqLineItems((prev) => [
      ...prev,
      { name: "", quantity: 1, unit: "pcs", specifications: "" },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (rfqLineItems.length <= 1) {
      toast.error("At least one line item is required");
      return;
    }
    setRfqLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index: number, field: string, value: any) => {
    setRfqLineItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Start Editing an RFQ
  const handleStartEdit = (rfq: any) => {
    setEditingRfqId(rfq.id);
    setRfqTitle(rfq.title || "");
    setRfqDescription(rfq.description || "");
    setRfqCategory(rfq.categories?.[0]?.category?.name || "Industrial Automation");
    setRfqLocation(rfq.location || "");
    setRfqCurrency(rfq.currency || "INR");
    setRfqBudget(rfq.optionalBudget ? String(rfq.optionalBudget) : "");
    setRfqDeadline(rfq.deadline ? rfq.deadline.split("T")[0] : "");

    if (rfq.lineItems && rfq.lineItems.length > 0) {
      setRfqLineItems(
        rfq.lineItems.map((li: any) => ({
          name: li.name,
          description: li.description || "",
          quantity: Number(li.quantity),
          unit: li.unit || "pcs",
          specifications: li.specifications || "",
        }))
      );
    } else {
      setRfqLineItems([{ name: "", quantity: 1, unit: "pcs", specifications: "" }]);
    }

    setActiveTab("create-rfq");
    toast.info(`Loaded RFQ #${rfq.id} for editing`, {
      description: "Modify scope or line items and click 'Update RFQ'.",
    });
  };

  const handleCancelEdit = () => {
    setEditingRfqId(null);
    setRfqTitle("");
    setRfqDescription("");
    setRfqLocation("");
    setRfqBudget("");
    setRfqDeadline("");
    setRfqLineItems([
      { name: "Precision Industrial Component", quantity: 100, unit: "pcs", specifications: "" },
    ]);
    setActiveTab("overview");
  };

  // Create / Update RFQ API
  const handleSaveRfq = async (status: "DRAFT" | "PUBLISHED" = "PUBLISHED") => {
    if (!rfqTitle.trim()) {
      toast.error("RFQ Title is required");
      return;
    }
    if (!rfqDescription.trim()) {
      toast.error("RFQ Description is required");
      return;
    }
    if (!rfqLocation.trim()) {
      toast.error("Delivery Location is required");
      return;
    }
    if (!rfqDeadline) {
      toast.error("Submission Deadline is required");
      return;
    }

    for (let i = 0; i < rfqLineItems.length; i++) {
      const item = rfqLineItems[i];
      if (!item.name.trim()) {
        toast.error(`Line item #${i + 1} must have a name`);
        return;
      }
      if (Number(item.quantity) <= 0 || isNaN(Number(item.quantity))) {
        toast.error(`Line item #${i + 1} must have a valid positive quantity`);
        return;
      }
    }

    setIsCreatingRfq(true);
    try {
      const payload = {
        title: rfqTitle.trim(),
        description: rfqDescription.trim(),
        category: rfqCategory,
        location: rfqLocation.trim(),
        currency: rfqCurrency,
        optionalBudget: rfqBudget ? Number(rfqBudget) : null,
        deadline: new Date(rfqDeadline).toISOString(),
        status: status,
        lineItems: rfqLineItems.map((item) => ({
          name: item.name.trim(),
          description: item.description?.trim() || undefined,
          quantity: Number(item.quantity),
          unit: item.unit.trim() || "pcs",
          specifications: item.specifications?.trim() || undefined,
        })),
      };

      if (editingRfqId) {
        const updated = await api.updateRfq(editingRfqId, payload);
        toast.success("RFQ Updated Successfully!", {
          description: `RFQ #${updated.id} "${updated.title}" changes have been saved.`,
        });
      } else {
        const newRfq = await api.createRfq(payload);
        toast.success(
          status === "PUBLISHED"
            ? "RFQ Created & Published Successfully!"
            : "RFQ Draft Saved Successfully!",
          {
            description: `RFQ #${newRfq.id} "${newRfq.title}" with ${newRfq.lineItems.length} line items is saved.`,
          }
        );
      }

      setEditingRfqId(null);
      setRfqTitle("");
      setRfqDescription("");
      setRfqLocation("");
      setRfqBudget("");
      setRfqDeadline("");
      setRfqLineItems([
        { name: "Precision Industrial Component", quantity: 100, unit: "pcs", specifications: "" },
      ]);

      await loadData();
      setActiveTab("overview");
    } catch (err: any) {
      toast.error(editingRfqId ? "Failed to update RFQ" : "Failed to create RFQ", {
        description: err.message || "An error occurred while communicating with the backend.",
      });
    } finally {
      setIsCreatingRfq(false);
    }
  };

  return {
    editingRfqId,
    rfqTitle,
    setRfqTitle,
    rfqDescription,
    setRfqDescription,
    rfqCategory,
    setRfqCategory,
    rfqLocation,
    setRfqLocation,
    rfqCurrency,
    setRfqCurrency,
    rfqBudget,
    setRfqBudget,
    rfqDeadline,
    setRfqDeadline,
    rfqLineItems,
    isCreatingRfq,
    handleOpenCreateRfq,
    handleAddLineItem,
    handleRemoveLineItem,
    handleLineItemChange,
    handleStartEdit,
    handleCancelEdit,
    handleSaveRfq,
  };
}
