export type RfqStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "AWARDED" | "CANCELLED";

export type QuotationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "SHORTLISTED"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

export interface Category {
  id: number;
  name: string;
}

export interface RFQCategory {
  id?: number;
  rfqId?: number;
  categoryId: number;
  category: Category;
}

export interface RFQLineItem {
  id?: number;
  rfqId?: number;
  name: string;
  description?: string | null;
  quantity: number | string;
  unit: string;
  specifications?: string | null;
  createdAt?: string;
}

export interface QuotationLineItem {
  id: number;
  quotationId: number;
  rfqLineItemId: number;
  unitPrice: number | string;
  totalPrice?: number | string | null;
  notes?: string | null;
  createdAt?: string;
  rfqLineItem?: RFQLineItem;
}

export interface QuotationRevision {
  id: number;
  quotationId: number;
  revisionNo: number;
  totalPrice: number | string;
  changedAt: string;
  changedBy: number;
  snapshot?: any;
}

export interface Quotation {
  id: number;
  rfqId: number;
  vendorId: number;
  quoteNo: string;
  currency: string;
  deliveryTime?: string | null;
  status: QuotationStatus;
  totalPriceQuote: number | string;
  createdAt: string;
  updatedAt: string;
  rfq?: {
    id: number;
    title: string;
    currency: string;
    status: RfqStatus;
    location?: string;
    deadline?: string;
  };
  vendor?: {
    id: number;
    name: string;
    email: string;
  };
  lineItems?: QuotationLineItem[];
  revisions?: QuotationRevision[];
}

export interface HistoryItem {
  id: number;
  rfqId?: number | null;
  quotationId?: number | null;
  updatedBy: number;
  action: string;
  details?: any;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface RFQ {
  id: number;
  title: string;
  description: string;
  location: string;
  currency: string;
  optionalBudget?: number | string | null;
  totalPriceRfq?: number | string | null;
  deadline: string;
  status: RfqStatus;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  categories?: RFQCategory[];
  lineItems: RFQLineItem[];
  createdBy?: {
    id: number;
    name: string;
    email: string;
    role?: any;
  };
  quotations?: Quotation[];
  history?: HistoryItem[];
  _count?: {
    quotations: number;
  };
}

export interface CreateRfqInput {
  title: string;
  description: string;
  location: string;
  currency?: string;
  optionalBudget?: number | string | null;
  totalPriceRfq?: number | string | null;
  deadline: string;
  status?: RfqStatus;
  category?: string;
  categories?: string[] | number[];
  lineItems: Array<{
    name: string;
    description?: string;
    quantity: number | string;
    unit: string;
    specifications?: string;
  }>;
}

export interface UpdateRfqInput extends Partial<CreateRfqInput> {
  id?: number;
}

export interface RfqComparisonMetrics {
  quotesCount: number;
  lowestPrice: {
    id: number;
    quoteNo: string;
    vendor: string;
    price: number | string;
  } | null;
  fastestDelivery: {
    id: number;
    quoteNo: string;
    vendor: string;
    deliveryTime: string;
    days?: number;
  } | null;
  awardedQuote: {
    id: number;
    quoteNo: string;
    vendor: string;
    price: number | string;
  } | null;
}

export interface RfqLineItemMatrixRow {
  id: number;
  name: string;
  quantity: number | string;
  unit: string;
  specifications?: string | null;
  vendorPrices: Record<
    string | number,
    {
      unitPrice: number | string;
      totalPrice: number | string;
      notes?: string | null;
    }
  >;
}

export interface RfqComparisonData {
  rfq: RFQ;
  metrics: RfqComparisonMetrics;
  quotations: Quotation[];
  lineItemsMatrix: RfqLineItemMatrixRow[];
}

export interface NavigationBadgeCounts {
  totalRfqs?: number;
  draftRfqs?: number;
  publishedRfqs?: number;
  closedRfqs?: number;
  awardedRfqs?: number;
  totalQuotes?: number;
  totalUsers?: number;
  openRfqs?: number;
  myQuotes?: number;
  submittedQuotes?: number;
  shortlistedQuotes?: number;
  acceptedQuotes?: number;
  rejectedQuotes?: number;
  totalQuotesReceived?: number;
  [key: string]: number | undefined;
}

export interface NavigationCategorySummary {
  id: number;
  name: string;
  activeRfqCount: number;
}

export interface NavigationSummaryData {
  role: string;
  badges: NavigationBadgeCounts;
  categories: NavigationCategorySummary[];
}

export interface GlobalSearchRfqItem {
  id: number;
  title: string;
  status: string;
  location?: string | null;
  currency?: string;
  deadline?: string;
  totalPriceRfq?: number | null;
  categories: string[];
  lineItems: Array<{ id: number; name: string; quantity: number; unit: string }>;
}

export interface GlobalSearchCategoryItem {
  id: number;
  name: string;
  rfqCount: number;
}

export interface GlobalSearchQuoteItem {
  id: number;
  quoteNo: string;
  status: string;
  totalPriceQuote: string;
  rfq?: { id: number; title: string };
}

export interface GlobalSearchResults {
  query: string;
  rfqs: GlobalSearchRfqItem[];
  categories: GlobalSearchCategoryItem[];
  quotations: GlobalSearchQuoteItem[];
}

