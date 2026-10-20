"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2, Package } from "lucide-react";
import { Category } from "@/types/rfq";

export interface CreateRfqTabProps {
  editingRfqId: number | null;
  rfqTitle: string;
  setRfqTitle: (title: string) => void;
  rfqDescription: string;
  setRfqDescription: (desc: string) => void;
  rfqCategory: string;
  setRfqCategory: (cat: string) => void;
  rfqLocation: string;
  setRfqLocation: (loc: string) => void;
  rfqCurrency: string;
  setRfqCurrency: (curr: string) => void;
  rfqBudget: string;
  setRfqBudget: (budget: string) => void;
  rfqDeadline: string;
  setRfqDeadline: (deadline: string) => void;
  rfqLineItems: Array<{
    name: string;
    description?: string;
    quantity: number | string;
    unit: string;
    specifications?: string;
  }>;
  categoriesList: Category[];
  isCreatingRfq: boolean;
  handleAddLineItem: () => void;
  handleRemoveLineItem: (index: number) => void;
  handleLineItemChange: (index: number, field: string, value: any) => void;
  handleSaveRfq: (status: "DRAFT" | "PUBLISHED") => Promise<void>;
  handleCancelEdit: () => void;
  setActiveTab: (tab: string) => void;
}

export function CreateRfqTab({
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
  categoriesList,
  isCreatingRfq,
  handleAddLineItem,
  handleRemoveLineItem,
  handleLineItemChange,
  handleSaveRfq,
  handleCancelEdit,
  setActiveTab,
}: CreateRfqTabProps) {
  return (
    <Card className="border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 w-full shadow-xs rounded-xl overflow-hidden">
      <CardHeader className="p-6 sm:p-8 pb-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {editingRfqId
                ? `Edit Request for Quotation (RFQ #${editingRfqId})`
                : "Create Request for Quotation (RFQ)"}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {editingRfqId
                ? "Update procurement specifications, quantities, or submission deadline"
                : "Author an itemized procurement request conforming to database specifications"}
            </CardDescription>
          </div>
          {editingRfqId ? (
            <Badge variant="warning" className="text-xs font-semibold px-2.5 py-1">
              Draft Edit Mode
            </Badge>
          ) : (
            <Badge variant="buyer" className="text-xs font-semibold px-2.5 py-1">
              Buyer Sourcing
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* 1. Title */}
        <div className="space-y-2">
          <Label htmlFor="rfq-title" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            RFQ Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="rfq-title"
            value={rfqTitle}
            onChange={(e) => setRfqTitle(e.target.value)}
            placeholder="e.g. Precision CNC Machined Aluminum Enclosures"
            className="h-11"
          />
        </div>

        {/* 2. Description */}
        <div className="space-y-2">
          <Label htmlFor="rfq-desc" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Detailed Procurement Description <span className="text-red-500">*</span>
          </Label>
          <textarea
            id="rfq-desc"
            value={rfqDescription}
            onChange={(e) => setRfqDescription(e.target.value)}
            placeholder="Describe technical standards, tolerance requirements, surface treatment, quality testing, and delivery conditions..."
            rows={3}
            className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-sm shadow-2xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* 3. Category, Location, Currency */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="rfq-category" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Category <span className="text-red-500">*</span>
            </Label>
            <select
              id="rfq-category"
              value={rfqCategory}
              onChange={(e) => setRfqCategory(e.target.value)}
              className="w-full h-11 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {categoriesList.length > 0 ? (
                categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))
              ) : (
                <>
                  <option value="Industrial Automation">Industrial Automation</option>
                  <option value="Metals & Mining">Metals & Mining</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Mechanical Components">Mechanical Components</option>
                  <option value="Electrical & Electronics">Electrical & Electronics</option>
                </>
              )}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rfq-location" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Delivery Location <span className="text-red-500">*</span>
            </Label>
            <Input
              id="rfq-location"
              value={rfqLocation}
              onChange={(e) => setRfqLocation(e.target.value)}
              placeholder="e.g. Frankfurt, Germany / Chicago, IL"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rfq-currency" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Currency
            </Label>
            <select
              id="rfq-currency"
              value={rfqCurrency}
              onChange={(e) => setRfqCurrency(e.target.value)}
              className="w-full h-11 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="CAD">CAD ($)</option>
            </select>
          </div>
        </div>

        {/* 4. Target Budget & Deadline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="rfq-budget" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Optional Target Budget ({rfqCurrency})
            </Label>
            <Input
              id="rfq-budget"
              type="number"
              value={rfqBudget}
              onChange={(e) => setRfqBudget(e.target.value)}
              placeholder="e.g. 45000"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rfq-deadline" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Submission Deadline <span className="text-red-500">*</span>
            </Label>
            <Input
              id="rfq-deadline"
              type="date"
              value={rfqDeadline}
              onChange={(e) => setRfqDeadline(e.target.value)}
              className="h-11"
            />
          </div>
        </div>

        {/* 5. Itemized Line Items Builder */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Package className="size-4 text-[#008779] dark:text-[#00a896]" />
                Itemized Line Items ({rfqLineItems.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define product specifications, units, and quantities for vendor quote itemization
              </p>
            </div>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddLineItem}
              className="border-[#008779]/40 dark:border-[#008779]/50 text-[#008779] dark:text-[#00a896] hover:bg-[#008779]/10 dark:hover:bg-[#008779]/20 text-xs h-8 cursor-pointer"
            >
              <Plus className="size-3.5 mr-1" />
              Add Line Item
            </Button>
          </div>

          <div className="space-y-3">
            {rfqLineItems.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Item #{idx + 1}
                  </span>
                  {rfqLineItems.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveLineItem(idx)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 h-7 w-7 p-0 cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-6 space-y-1">
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Item Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={item.name}
                      onChange={(e) => handleLineItemChange(idx, "name", e.target.value)}
                      placeholder="e.g. Optical Proximity Sensor"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="md:col-span-3 space-y-1">
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Quantity <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(idx, "quantity", e.target.value)}
                      placeholder="100"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="md:col-span-3 space-y-1">
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Unit <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={item.unit}
                      onChange={(e) => handleLineItemChange(idx, "unit", e.target.value)}
                      placeholder="pcs, kg, meters"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Technical Specifications / Notes
                  </Label>
                  <Input
                    value={item.specifications || ""}
                    onChange={(e) => handleLineItemChange(idx, "specifications", e.target.value)}
                    placeholder="e.g. IP67 rated, 10-30V DC, M12 connector, RoHS certified"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="outline"
            type="button"
            onClick={editingRfqId ? handleCancelEdit : () => setActiveTab("overview")}
            className="h-10 px-5 cursor-pointer border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={isCreatingRfq}
            onClick={() => handleSaveRfq("DRAFT")}
            className="h-10 px-5 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-semibold cursor-pointer"
          >
            {editingRfqId ? "Update as Draft" : "Save as Draft"}
          </Button>

          <Button
            type="button"
            disabled={isCreatingRfq}
            onClick={() => handleSaveRfq("PUBLISHED")}
            className="h-10 px-6 bg-[#008779] text-white hover:bg-[#007063] active:bg-[#005c52] font-semibold cursor-pointer shadow-xs"
          >
            <span className="text-white font-semibold">
              {editingRfqId ? "Update & Publish RFQ" : "Publish RFQ"}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
