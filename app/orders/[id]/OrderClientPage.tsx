"use client";

import { use, useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import Pagination from "@/components/ui/Pagination";
import { useSortableData } from "@/hooks/useSortableData";
import { formatCurrency, formatNumber } from "@/lib/utils/formatting";
import { Product, ShippingMethodOption } from "@/app/orders/types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import OrderHeader from "./components/OrderHeader";
import BillingInfo from "./components/BillingInfo";
import ShippingInfo from "./components/ShippingInfo";
import ShipToContact from "./components/ShipToContact";
import DeliveryOptions from "./components/DeliveryOptions";
import OrderTotal from "./components/OrderTotal";
import OrderNotes from "./components/OrderNotes";
import FilesTab from "./components/FilesTab";
import ProductCatalog from "./components/ProductCatalog";
import MyOrderTable from "./components/MyOrderTable";
import PDFTemplate from "./components/PDFTemplate";
import TaxesTab from "./components/TaxesTab";
import FulfillmentTab, { FulfillmentPreloadedData } from "./components/FulfillmentTab";
import ReturnsTab, { ReturnsPreloadedData } from "./components/ReturnsTab";
import { useResizableColumns } from "@/hooks/useResizableColumns";
import { useUserSession } from "@/components/UserSessionContext";
import { useToast } from "@/components/ui/Toast";
import algoliasearch from 'algoliasearch';
import Tabs from "@/components/ui/Tabs";

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "",
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || ""
);
// import { mockProducts } from "@/app/products/mockData"; // Removed in favor of API data

interface Address {
  city: string;
  country: string;
  countryCode: string;
  postalCode: string;
  state: string;
  stateCode: string;
  street: string;
}

interface AuthorizedLocation {
  Id: string;
  Name: string;
  Account_Name__c: string;
  Account_Name: string;
  Account_Name__r?: { Name: string };
  Active__c: boolean;
  Lift_Gate__c: boolean;
  Inside_Delivery__c: boolean;
  Address__c: Address;
  Authorized_Ship_To_Location_Delivery_Notes?: string;
  Authorized_Ship_To_Location_Delivery_Notes__c?: string;
  Delivery_Notes__c?: string;
  Site_Name?: string;

}

interface LocationResponse {
  Payment_Terms__c: string;
  AuthorizedLocation: AuthorizedLocation[];
}

interface Contact {
  Id: string;
  Name: string;
  Email: string;
  Phone: string;
}

interface OrderItem {
  Id: string;
  Name: string;
  Product_Name__c: string; // Product ID
  ProductName: string; // Product Name
  Product_Description__c?: string;
  Order_Qty__c: number;
  Unit_Price__c: number;
  Total_Price__c: number;
  MOQ__c?: number;
  Status__c?: string;
  Manufacturer_Name__c?: string;
  ProductFamily?: string;
}

interface Order {
  Id: string;
  Name: string;
  Status__c: string;
  Total_Price__c: number;
  Grand_Total__c: number;
  Total_Taxes_Amount__c: number;
  Total_Shipping_Charges__c: number;
  Request_Date__c: string;
  Customer_PO__c?: string;
  Customer_Order_Notes__c?: string;
  Drop_Ship__c?: boolean;
  Authorized_Ship_To_Location__c?: string;
  Authorized_Bill_To_Location__c?: string;
  Incoterms__c?: string;
  Shipping_Method__c?: string;
  Assigned_Price_Book__c?: string;
  Site_Name?: string;
  Total_Lines__c?: number;
  Ship_to_Contact_Name?: string;
  Ship_to_Contact_Phone?: string;
  Ship_to_Contact_Email?: string;
  Ship_to_Contact__c?: string;
  Bill_to_Contact_Name?: string;
  Authorized_Ship_To_Location__Address?: Address;
  Authorized_Bill_To_Location_Address?: Address;
  Bill_to_Account_Name?: string;
  Ship_to_Account_Name?: string;
  Authorized_Ship_To_Location_Delivery_Notes?: string;
  Authorized_Ship_To_Location_Inside_Delivery?: boolean;
  Authorized_Ship_To_Location_Lift_Gate?: boolean;
  Authorized_Ship_To_Location_Name?: string;

  CustomerOrderLines?: OrderItem[];

  // Tax fields
  Sales_Tax_Rate__c?: number;
  Total_Sales_Tax_Amount__c?: number;
  Use_Tax_Rate__c?: number;
  Total_Use_Tax_Amount__c?: number;
  Local_Tax_Rate__c?: number;
  Total_Local_Tax_Amount__c?: number;
  Excise_Tax_Rate__c?: number;
  Total_Excise_Tax_Amount__c?: number;
  Gross_Receipts_Tax_Rate__c?: number;
  Total_Gross_Receipts_Tax_Amount__c?: number;
  GST_Rate__c?: number;
  Total_GST_Amount__c?: number;
  VAT_Rate__c?: number;
  Total_VAT_Amount__c?: number;
  Proposal_Requested__c?: boolean;
  Transfer_Order__c?: boolean;

  [key: string]: any;
}

export default function OrderClientPage({ params, indexName }: { params: Promise<{ id: string }>, indexName: string }) {
  const { id } = use(params);
  const router = useRouter();
  const { success, error: toastError, warning, confirm: confirmToast } = useToast();

  // This page is always in edit mode (order must be created first via the orders list page)

  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "true";
  const isTransfer = searchParams.get("transfer") === "true";
  const isProposal = searchParams.get("proposal") === "true";
  const isFromConfigure = searchParams.get("from_configure") === "true";
  const transferProductsStr = searchParams.get("products");

  const { user, selectedAccount } = useUserSession();
  const SF_ACCOUNT_ID = selectedAccount?.Id || selectedAccount?.id || "";
  const SF_CONTACT_ID = user?.Id || user?.contact?.Id || user?.contact?.id || "";

  // header order status
  const [orderStatus, setOrderStatus] = useState<string>("Draft");
  const [isEditing, setIsEditing] = useState(isNew);

  // Editing is only allowed while the order is a Draft — force-exit edit mode if the
  // status changes away from Draft (e.g. Submit) while the user is still editing.
  useEffect(() => {
    if (orderStatus !== "Draft") setIsEditing(false);
  }, [orderStatus]);

  // State management for product tables
  const [catalogSearchQuery, setCatalogSearchQuery] = useState("");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"myOrder" | "catalog" | "files" | "taxes" | "fulfillment" | "returns">("myOrder"); // Default to My Order table
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [loading, setLoading] = useState(true);
  const [orderProducts, setOrderProducts] = useState<Product[]>([]);
  // Tracks order line IDs deleted this session so the post-save reload can verify
  // Salesforce's read path has actually caught up before reloading (see handleSubmitOrder).
  const recentlyDeletedOrderLineIds = useRef<Set<string>>(new Set());
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filesCount, setFilesCount] = useState(0);
  const [fulfillmentCount, setFulfillmentCount] = useState(0);
  const [returnsCount, setReturnsCount] = useState(0);
  const [fulfillmentData, setFulfillmentData] = useState<FulfillmentPreloadedData | null>(null);
  const [returnsData, setReturnsData] = useState<ReturnsPreloadedData | null>(null);

  // Initialize resizable columns for My Order Table
  const myOrderColumns = useResizableColumns({
    image: 60,
    sku: 200,
    name: 200,
    manufacturer: 120,
    productFamily: 120,
    listPrice: 100,
    unitPrice: 120,
    orderQty: 180,
    subtotal: 180,
    actions: 80
  });

  // Initialize resizable columns for Product Catalog
  const catalogColumns = useResizableColumns({
    selection: 50,
    image: 60,
    name: 250,
    manufacturer: 150,
    productFamily: 150,
    productGrouping: 150,
    listPrice: 100,
    unitPrice: 100,
    orderQty: 120,
    actions: 80
  });

  // Initialize resizable columns for Taxes Tab
  const taxesColumns = useResizableColumns({
    salesRate: 130,
    salesAmount: 130,
    useRate: 130,
    useAmount: 130,
    localRate: 130,
    localAmount: 130,
    exciseRate: 130,
    exciseAmount: 130,
    grtRate: 130,
    grtAmount: 130,
    gstRate: 130,
    gstAmount: 130,
    vatRate: 130,
    vatAmount: 130
  });

  // Store contact ID for order submission
  const [contactId, setContactId] = useState<string>("");

  // Tooltip state
  const [tooltipState, setTooltipState] = useState<{ product: Product; x: number; y: number } | null>(null);


  // Multi-select state
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

  // Image popup state
  const [popupProduct, setPopupProduct] = useState<Product | null>(null);

  // Track quantities in catalog view
  const [catalogQuantities, setCatalogQuantities] = useState<Record<string, number>>({});

  const handleCatalogQuantityChange = (productId: string, quantity: number, moq: number) => {
    // Ensure quantity respects MOQ steps and minimum
    // But allow typing freely, validation happens on blur or we can force steps
    // For better UX with "step" input, we just set the value
    setCatalogQuantities(prev => ({
      ...prev,
      [productId]: quantity
    }));
  };



  // Multi-select handlers
  const handleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProductIds);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProductIds(newSelected);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = new Set(paginatedCatalogProducts.map(p => p.id));
      setSelectedProductIds(allIds);
    } else {
      setSelectedProductIds(new Set());
    }
  };

  const handleAddSelectedProducts = () => {
    const selectedProducts = catalogProducts.filter(p => selectedProductIds.has(p.id));
    const newLineItems = selectedProducts.map(product => {
      const qty = catalogQuantities[product.id] ?? product.moq ?? 1;
      return {
        ...product,
        orderQty: qty,
        subtotal: product.unitPrice * qty,
        lineItemKey: `${product.id}-${Date.now()}-${Math.random()}`
      };
    });

    setOrderProducts([...orderProducts, ...newLineItems]);
    setSelectedProductIds(new Set()); // Clear selection
    // Optional: Switch to My Order view or show success message
    // setViewMode("myOrder");
  };

  // Popup handlers
  const handleImageClick = (product: Product) => {
    setPopupProduct(product);
  };

  const handleClosePopup = () => {
    setPopupProduct(null);
  };

  const handleDownloadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    uploadedFiles.forEach(file => {
      handleDownloadFile(file);
    });
  };

  const [formData, setFormData] = useState({
    // Primary Details
    shipTo: "",
    shippingAddress: "",
    billTo: "",
    billingAddress: "",
    purchaseOrder: "",
    requestedDeliveryDate: "",

    // Billing Contact Info
    billingContact: "",
    billingEmail: "",
    billingPhone: "",

    // Contact Information
    locationContact: "",
    contactPhone: "",
    contactEmail: "",

    // Delivery Preferences
    paymentTerms: "",
    priceBook: "",
    dropShip: false,
    liftGateRequired: false,
    insideDelivery: false,
    deliveryNotes: "",
    site: "",
    shippingMethod: "",
    incoterms: "",

    // Account Info
    billToAccountName: "",
    billToAccountId: SF_ACCOUNT_ID,
    shipToAccountName: "",
    shipToAccountId: SF_ACCOUNT_ID,

    // Order Name
    orderName: "",

    // Order Notes
    orderNotes: ""
  });

  // Ship-to locations loaded from Salesforce via server proxy
  const [shipLocations, setShipLocations] = useState<AuthorizedLocation[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [initialOrderShipToId, setInitialOrderShipToId] = useState<string | null>(null);
  const [initialOrderBillToId, setInitialOrderBillToId] = useState<string | null>(null);
  const [initialOrderContactId, setInitialOrderContactId] = useState<string | null>(null);

  // Shipping Methods
  const [shippingMethods, setShippingMethods] = useState<ShippingMethodOption[]>([]);
  const [incotermsOptions, setIncotermsOptions] = useState<ShippingMethodOption[]>([]);

  // Ship-to contacts loaded from Salesforce
  const [shipContacts, setShipContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");

  // Product catalog loaded from Salesforce
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  // Tracks viewMode's previous value so the refetch effect below can fire only on the
  // transition into "catalog" (reactivating the tab), not on every render while it stays active.
  const prevViewModeRef = useRef(viewMode);

  useEffect(() => {
    if (!SF_ACCOUNT_ID || !SF_CONTACT_ID) return;
    let mounted = true;
    async function loadLocations() {
      try {
        setLocationsLoading(true);
        // pass accountId, role and contactId as needed
        const res = await fetch(`/api/salesforce/orders?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&action=locations`);
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Failed to fetch locations:", errorText);
          return;
        }

        const data = await res.json();
        //console.log('locations', data);
        if (mounted) {
          // Handle the actual API response structure
          let locations: AuthorizedLocation[] = [];
          let paymentTerms = '';
          let priceBook = '';
          let incoterms: any[] = [];

          // The API route returns resultdata.data directly, so check if data is an array first
          if (Array.isArray(data)) {
            //console.log('Response is a direct array, length:', data.length);
            // If it's an array, check if first element has AuthorizedLocation
            if (data.length > 0 && data[0].AuthorizedLocation && Array.isArray(data[0].AuthorizedLocation)) {
              locations = data[0].AuthorizedLocation;
              paymentTerms = data[0].Payment_Terms__c || '';
              priceBook = data[0].Assigned_Price_Book_Name || '';
            } else {
              // Otherwise treat the array itself as locations
              locations = data;
            }
          } else if (data.data && Array.isArray(data.data)) {
            if (data.data.length > 0) {
              const firstRecord = data.data[0];
              if (firstRecord.AuthorizedLocation && Array.isArray(firstRecord.AuthorizedLocation)) {
                locations = firstRecord.AuthorizedLocation;
                paymentTerms = firstRecord.Payment_Terms__c || '';
                priceBook = firstRecord.Assigned_Price_Book_Name || '';
              } else {
                locations = data.data;
              }
            }
          } else if (data.AuthorizedLocation && Array.isArray(data.AuthorizedLocation)) {
            locations = data.AuthorizedLocation;
            paymentTerms = data.Payment_Terms__c || '';
            priceBook = data.Assigned_Price_Book_Name || '';
          }

          // Fetch Account Name

          // Fetch Account Name
          try {
            const accRes = await fetch(`/api/salesforce/orders?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&action=account`);
            if (accRes.ok) {
              const accData = await accRes.json();
              if (Array.isArray(accData) && accData.length > 0 && accData[0].Name) {
                setAccountName(accData[0].Name);
              } else if (accData && accData.Name) {
                setAccountName(accData.Name);
              }
            }
          } catch (e) { console.error("Error fetching account name:", e); }

          if (locations.length > 0) {
            // Try to find the account name from locations if not already set
            const currentAccountName = accountName;
            const foundLocWithName = locations.find(loc =>
              loc.Account_Name__r?.Name ||
              (loc as any)['Account_Name__r.Name'] ||
              (loc as any).Account_Name_Name ||
              (loc as any).Account_Name__c_Name
            );
            const foundName = foundLocWithName?.Account_Name__r?.Name || (foundLocWithName as any)?.['Account_Name__r.Name'] || (foundLocWithName as any)?.Account_Name_Name || (foundLocWithName as any)?.Account_Name__c_Name;

            if (foundName && (!currentAccountName || currentAccountName.startsWith('001'))) {
              setAccountName(foundName);
            }

            // Deduplicate locations by ID and filter out any with missing IDs
            const validLocations = locations.filter(loc => {
              const isValid = loc && loc.Id && loc.Name;
              if (!isValid) {
                console.warn('Invalid location found:', loc);
              }
              return isValid;
            });

            const uniqueLocations = Array.from(
              new Map(validLocations.map(item => [item.Id, item])).values()
            );

            setShipLocations(uniqueLocations);
          } else {
            console.warn('No locations found in response');
            setShipLocations([]);
          }

          // Set payment terms if available
          if (paymentTerms) {
            setFormData(prev => ({ ...prev, paymentTerms }));
          }
          // Set price book if available
          if (priceBook) {
            setFormData(prev => ({ ...prev, priceBook }));
          }
        }
      } catch (e) {
        console.error("Error loading ship locations:", e);
      } finally {
        if (mounted) setLocationsLoading(false);
      }
    }
    loadLocations();
    return () => {
      mounted = false;
    };
  }, [SF_ACCOUNT_ID, SF_CONTACT_ID]); // run when IDs are available

  // Load contacts from Salesforce
  useEffect(() => {
    if (!SF_ACCOUNT_ID || !SF_CONTACT_ID) return;
    let mounted = true;
    async function loadContacts() {
      try {
        setContactsLoading(true);
        const res = await fetch(`/api/salesforce/orders?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&action=contacts`);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Failed to fetch contacts:", errorText);
          return;
        }

        const data = await res.json();

        if (mounted) {
          // Handle the API response structure
          let contacts: Contact[] = [];

          // The API returns data directly as an array
          if (Array.isArray(data)) {
            contacts = data;
          } else if (data.data && Array.isArray(data.data)) {
            contacts = data.data;
          }

          if (contacts.length > 0) {
            setShipContacts(contacts);
          } else {
            console.warn('No contacts found in response');
            setShipContacts([]);
          }
        }
      } catch (e) {
        console.error("Error loading contacts:", e);
      } finally {
        if (mounted) setContactsLoading(false);
      }
    }
    loadContacts();
    return () => {
      mounted = false;
    };
  }, [SF_ACCOUNT_ID, SF_CONTACT_ID]); // run when IDs are available

  // Load picklists for dropdown fields
  useEffect(() => {
    if (!SF_ACCOUNT_ID || !SF_CONTACT_ID) return;

    async function loadPicklists() {
      try {
        const res = await fetch(`/api/salesforce/picklists?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}`);
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data && result.data.length > 0) {
            const picklistData = result.data[0];
            if (picklistData.Shipping_Method__c) {
              setShippingMethods(picklistData.Shipping_Method__c);
            }
            if (picklistData.Incoterms__c) {
              setIncotermsOptions(picklistData.Incoterms__c);
            }
          }
        }
      } catch (e) {
        console.error("Error loading picklists:", e);
      }
    }
    loadPicklists();
  }, [SF_ACCOUNT_ID, SF_CONTACT_ID]);

  // Load products from Algolia via server-side browse (no 1000-hit cap)
  // Fetches the order's product catalog from Algolia (via the admin-key browse endpoint).
  // Called on mount and whenever the Product Catalog tab is (re)activated (see effects below),
  // so it stays current with the latest completed catalog sync instead of showing a stale
  // one-time snapshot for the lifetime of the order page (see specs/073-fix-stale-catalog-sync).
  const loadProducts = useCallback(async (signal?: AbortSignal) => {
    try {
      setProductsLoading(true);
      // Use the server-side /api/algolia/browse endpoint which calls browseObjects()
      // with the Admin API key — this bypasses Algolia's 1000-hit Search API cap
      // and returns ALL records in the index.
      const res = await fetch("/api/algolia/browse", { signal });
      if (!res.ok) {
        console.error("DEBUG: /api/algolia/browse failed:", res.status, await res.text());
        // Keep showing the last successfully loaded catalog rather than clearing it (FR-005).
        toastError("Unable to refresh the product catalog. Showing the last loaded data.");
        return;
      }

      const data = await res.json();

      if (signal?.aborted) return;

      if (!data.products || data.products.length === 0) {
        setCatalogProducts([]);
        return;
      }

      // The browse endpoint already maps to the slim product shape we need
      const mappedProducts: Product[] = (data.products as any[]).map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        productFamily: p.productFamily,
        productGrouping: p.productGrouping,
        sku: p.sku,
        manufacturer: p.manufacturer,
        brand: p.brand,
        availableQty: Number(p.availableQty) || 0,
        moq: Number(p.moq) || 1,
        listPrice: Number(p.listPrice) || 0,
        unitPrice: Number(p.unitPrice) || 0,
        orderQty: 0,
        subtotal: 0,
      }));

      setCatalogProducts(mappedProducts);
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("DEBUG: Error loading products from Algolia:", error);
      // Keep showing the last successfully loaded catalog rather than clearing it (FR-005).
      toastError("Unable to refresh the product catalog. Showing the last loaded data.");
    } finally {
      if (!signal?.aborted) {
        setProductsLoading(false);
      }
    }
    // toastError intentionally omitted: useToast() returns a new function identity on every
    // ToastProvider render (its `error` helper isn't memoized), so depending on it here would
    // re-trigger the mount/tab-activation effects below on unrelated re-renders. Calling a stale
    // toastError closure is safe — it forwards to useToast's underlying (stable) showToast setter.
  }, []);

  useEffect(() => {
    if (!SF_ACCOUNT_ID || !SF_CONTACT_ID) return;
    const controller = new AbortController();
    loadProducts(controller.signal);
    return () => { controller.abort(); };
  }, [SF_ACCOUNT_ID, SF_CONTACT_ID, loadProducts]);

  // Refetches whenever the user (re)activates the Product Catalog tab, so switching back into
  // it after a catalog sync shows current data (FR-002) instead of the original page-load snapshot.
  useEffect(() => {
    if (viewMode === "catalog" && prevViewModeRef.current !== "catalog") {
      loadProducts();
    }
    prevViewModeRef.current = viewMode;
  }, [viewMode, loadProducts]);

  // Auto-add transfer products once catalog loads
  useEffect(() => {
    if (isNew && isTransfer && transferProductsStr && catalogProducts.length > 0 && orderProducts.length === 0) {
      const transferIds = transferProductsStr.split(',');
      const selectedProducts = catalogProducts.filter(p => transferIds.includes(p.id));

      const newLineItems = selectedProducts.map(product => {
        const qty = product.moq && product.moq > 0
          ? Math.max(1, Math.floor((product.availableQty || 0) / product.moq))
          : Math.max(1, product.availableQty || 0);
        return {
          ...product,
          orderQty: qty,
          unitPrice: 0, // Unit Price as $0.00
          subtotal: 0,
          lineItemKey: `${product.id}-${Date.now()}-${Math.random()}`
        };
      });

      if (newLineItems.length > 0) {
        setOrderProducts(newLineItems);
      }
    }
  }, [isNew, isTransfer, transferProductsStr, catalogProducts, orderProducts.length]);

  // Auto-add Proposal Request line item
  useEffect(() => {
    if (isNew && isProposal && orderProducts.length === 0 && catalogProducts.length > 0) {
      // Find a matching product if it exists, otherwise use a fallback
      const existingProduct = catalogProducts.find(p => p.name === "Proposal Request");
      const productId = existingProduct ? existingProduct.id : "PROPOSAL-REQ";

      const newLineItem = {
        id: productId,
        name: "Proposal Request",
        description: "Special request for proposal",
        sku: existingProduct?.sku || "PROPOSAL-REQ",
        manufacturer: existingProduct?.manufacturer || "",
        productFamily: existingProduct?.productFamily || "Service",
        productGrouping: existingProduct?.productGrouping || "-",
        brand: existingProduct?.brand || "-",
        listPrice: existingProduct?.listPrice || 0,
        unitPrice: existingProduct?.unitPrice || 0,
        availableQty: existingProduct?.availableQty || 1,
        moq: existingProduct?.moq || 1,
        orderQty: 1,
        subtotal: 0,
        lineItemKey: `proposal-req-${Date.now()}-${Math.random()}`
      };
      setOrderProducts([newLineItem]);
    }
  }, [isNew, isProposal, catalogProducts, orderProducts.length]);

  // Auto-add Configure Order lines
  useEffect(() => {
    if (isNew && isFromConfigure && orderProducts.length === 0) {
      try {
        const configuredStr = localStorage.getItem('gth-configured-order');
        if (configuredStr) {
          const lines = JSON.parse(configuredStr);
          const productsOnly = lines.filter((l: any) => l.type === 'product');
          const newLineItems = productsOnly.map((p: any) => ({
            id: p.id || `conf-${Date.now()}-${Math.random()}`,
            name: p.name,
            sku: p.sku,
            description: p.desc,
            productFamily: "General",
            productGrouping: p.groupingLabel || "",
            manufacturer: p.mfr,
            listPrice: p.sell,
            unitPrice: p.sell,
            orderQty: p.qty,
            subtotal: p.sell * p.qty,
            lineItemKey: `conf-${p.id}-${Date.now()}-${Math.random()}`,
            sequence: p.seq
          }));
          if (newLineItems.length > 0) {
            setOrderProducts(newLineItems);
          }
        }
      } catch (e) {
        console.error("Error loading configured order", e);
      }
    }
  }, [isNew, isFromConfigure, orderProducts.length]);

  // Handle contact selection
  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId);
    const selectedContact = shipContacts.find(c => c.Id === contactId);
    if (selectedContact) {
      setFormData(prev => ({
        ...prev,
        locationContact: selectedContact.Name || "",
        contactPhone: selectedContact.Phone || "",
        contactEmail: selectedContact.Email || "",
        // Copy to billing contact fields
        billingContact: selectedContact.Name || "",
        billingPhone: selectedContact.Phone || "",
        billingEmail: selectedContact.Email || "",
      }));
    }
  };

  // Sync initial order contact with loaded contacts
  useEffect(() => {
    if (initialOrderContactId && shipContacts.length > 0) {
      handleContactSelect(initialOrderContactId);
      setInitialOrderContactId(null);
    }
  }, [initialOrderContactId, shipContacts]);

  const handleLocationSelect = (location: AuthorizedLocation) => {
    const address = location.Address__c;
    const formattedAddress = address ? `${address.street}, ${address.city}, ${address.state} ${address.postalCode}` : "";

    // Use fetched account name if available and location account ID matches (or just use it as it's the context account)
    // Fallback to location.Account_Name__r?.Name if backend supports it, otherwise ID
    // Added 15-character match for more robustness and support for dot-notation
    const relationshipName = location.Account_Name__r?.Name || (location as any)['Account_Name__r.Name'];
    const isContextAccount = location.Account_Name__c && SF_ACCOUNT_ID && location.Account_Name__c.substring(0, 15) === SF_ACCOUNT_ID.substring(0, 15);

    const accName = relationshipName ||
      (isContextAccount && accountName && !accountName.startsWith('001') ? accountName : null) ||
      location.Account_Name || "";

    setFormData(prev => ({
      ...prev,
      shipTo: location.Id,
      site: location.Site_Name || "",
      shipToAccountId: location.Account_Name__c || "",
      shipToAccountName: accName,
      shippingAddress: formattedAddress,
      liftGateRequired: location.Lift_Gate__c,
      insideDelivery: location.Inside_Delivery__c,
      deliveryNotes: location.Authorized_Ship_To_Location_Delivery_Notes || location.Authorized_Ship_To_Location_Delivery_Notes__c || location.Delivery_Notes__c || ""
    }));
  };

  // Sync initial order location with loaded locations
  useEffect(() => {
    if (initialOrderShipToId && shipLocations.length > 0) {
      const matchedLocation = shipLocations.find(loc => loc.Id === initialOrderShipToId);
      if (matchedLocation) {
        handleLocationSelect(matchedLocation);
        setInitialOrderShipToId(null); // Clear so we don't re-run if user changes it manually later (though dependency array handles most cases)
      }
    }
  }, [initialOrderShipToId, shipLocations]);



  useEffect(() => {
    if (formData.billTo === "same") {
      setFormData(prev => ({
        ...prev,
        billingAddress: prev.shippingAddress,
        billToAccountName: prev.shipToAccountName
      }));
    }
  }, [formData.billTo, formData.shippingAddress, formData.shipToAccountName]);

  const handleBillToSelect = (locationId: string) => {
    if (locationId === "same") {
      setFormData(prev => ({
        ...prev,
        billTo: "same",
        billingAddress: prev.shippingAddress,
        billToAccountName: prev.shipToAccountName
      }));
    } else {
      const selectedLoc = shipLocations.find(l => l.Id === locationId);
      if (selectedLoc) {
        const address = selectedLoc.Address__c;
        const formattedAddress = address ? `${address.street}, ${address.city}, ${address.state} ${address.postalCode}` : "";

        const relationshipName = selectedLoc.Account_Name__r?.Name || (selectedLoc as any)['Account_Name__r.Name'];
        const isContextAccount = selectedLoc.Account_Name__c && SF_ACCOUNT_ID && selectedLoc.Account_Name__c.substring(0, 15) === SF_ACCOUNT_ID.substring(0, 15);

        const accName = relationshipName ||
          (isContextAccount && accountName && !accountName.startsWith('001') ? accountName : null) ||
          selectedLoc.Account_Name || "";

        setFormData(prev => ({
          ...prev,
          billToAccountName: accName,
          billToAccountId: selectedLoc.Account_Name__c || "",
          billTo: locationId,
          billingAddress: formattedAddress
        }));
      } else {
        setFormData(prev => ({ ...prev, billTo: locationId }));
      }
    }
  };

  const handleBillToChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleBillToSelect(e.target.value);
  };

  // Sync initial order bill to location with loaded locations
  useEffect(() => {
    if (initialOrderBillToId && shipLocations.length > 0) {
      handleBillToSelect(initialOrderBillToId);
      setInitialOrderBillToId(null);
    }
  }, [initialOrderBillToId, shipLocations]);

  // Fetch Order Details
  useEffect(() => {
    if (!id || id === "new") return;
    if (!SF_ACCOUNT_ID || !SF_CONTACT_ID) return;

    async function fetchOrder() {
      try {
        setLoadingOrder(true);
        // Use the new getOrderFromSalesforce service function via API
        // We need to pass accountId and contactId as query params
        const accountId = SF_ACCOUNT_ID;
        const orderId = id;

        const res = await fetch(`/api/salesforce/orders?accountId=${encodeURIComponent(accountId)}&orderId=${encodeURIComponent(orderId)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}`);

        if (!res.ok) {
          throw new Error(`Failed to fetch order: ${res.status} ${res.statusText}`);
        }

        const responseData = await res.json();

        let order: Order | null = null;

        // Robustly extract order from potential response structures
        if (Array.isArray(responseData) && responseData.length > 0) {
          if (responseData[0].Customer_Order__c && Array.isArray(responseData[0].Customer_Order__c) && responseData[0].Customer_Order__c.length > 0) {
            order = responseData[0].Customer_Order__c[0] as Order;
          } else {
            order = responseData[0] as Order;
          }
        } else if (responseData && responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
          if (responseData.data[0].Customer_Order__c && Array.isArray(responseData.data[0].Customer_Order__c) && responseData.data[0].Customer_Order__c.length > 0) {
            order = responseData.data[0].Customer_Order__c[0] as Order;
          } else {
            order = responseData.data[0] as Order;
          }
        }

        if (order) {
          setOrderData(order);

          // Proactively set accountName state from order names if context matches
          if (order.Inventory_Account_Name) {
            setAccountName(order.Inventory_Account_Name);
          } else if (order.Ship_to_Account_Name && !order.Ship_to_Account_Name.startsWith('001')) {
            setAccountName(order.Ship_to_Account_Name);
          } else if (order.Bill_to_Account_Name && !order.Bill_to_Account_Name.startsWith('001')) {
            setAccountName(order.Bill_to_Account_Name);
          }

          // Update Order Status
          if (order.Status__c) setOrderStatus(order.Status__c);

          // Map Order Items to Products
          if (order.Id) {
            try {
              // Fetch order lines separately to ensure we get the latest data
              const linesRes = await fetch(`/api/salesforce/orders?accountId=${encodeURIComponent(accountId)}&orderId=${encodeURIComponent(order.Id)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&action=orderlines`);
              if (linesRes.ok) {
                const linesData = await linesRes.json();

                let lines: any[] = [];
                if (Array.isArray(linesData) && linesData.length > 0) {
                  // Check if it's nested: [{ some_key__c: [...] }]
                  const firstItem = linesData[0];
                  const nestedKey = Object.keys(firstItem).find(key => key.endsWith('__c') && Array.isArray(firstItem[key]));
                  if (nestedKey) {
                    lines = firstItem[nestedKey];
                  } else {
                    lines = linesData;
                  }
                } else if (linesData && linesData.data && Array.isArray(linesData.data)) {
                  const firstItem = linesData.data[0];
                  const nestedKey = Object.keys(firstItem).find(key => key.endsWith('__c') && Array.isArray(firstItem[key]));
                  if (nestedKey) {
                    lines = firstItem[nestedKey];
                  } else {
                    lines = linesData.data;
                  }
                }

                if (lines && Array.isArray(lines)) {
                  const mappedProducts: Product[] = lines.map((item: any, index: number) => ({
                    id: item.Product_Name__c || item.Id, // Use Product_Name__c as product ID if available
                    name: item.Product_Name || "",
                    sku: item.Name || "", // Using Name as SKU/Line ID for now
                    description: item.Product_Description__c || "",
                    unitPrice: item.Unit_Price__c,
                    listPrice: item.Unit_Price__c, // Assuming list price same as unit price for now
                    brand: item.gtherp__brand_name__c ?? item.gtherp__Brand_Name__c ?? item.Brand_Name__c ?? item.Product_Brand_Name__c ?? "",
                    manufacturer: item['Manufacturer_Name__r.Name'] || item.Manufacturer_Name__r?.Name || item.Manufacturer__c || item.ManufacturerName || item.Manufacturer_Name__c || "",
                    productFamily: item.Product_Family__c || "", // Not in API response
                    productGrouping: item.Product_Grouping__c || item.Grouping__c || "",
                    availableQty: item.gtherp__available_to_sell__c ?? item.gtherp__Available_To_Sell__c ?? item.Available_To_Sell__c ?? 0,
                    moq: item.MOQ__c || 1,
                    orderQty: (item.Order_Qty__c || 0) * (item.MOQ__c || 1),
                    subtotal: item.Total_Price__c,
                    // Store the original order line ID for updates
                    orderLineId: item.Id,
                    // Add unique lineItemKey for proper tracking and deletion
                    lineItemKey: `${item.Id}-${Date.now()}-${index}-${Math.random()}`
                  }));
                  setOrderProducts(mappedProducts);
                }
              }
            } catch (lineError) {
              console.error("Error fetching order lines:", lineError);
            }
          }

          // Update Form Data with Order Details
          setFormData(prev => ({
            ...prev,
            purchaseOrder: order.Customer_PO__c || prev.purchaseOrder || "",
            requestedDeliveryDate: order.Request_Date__c || prev.requestedDeliveryDate || "",
            orderNotes: order.Customer_Order_Notes__c || prev.orderNotes || "",
            priceBook: order.Assigned_Price_Book_Name || prev.priceBook || "",
            dropShip: order.Drop_Ship__c || prev.dropShip || false,
            // Set Bill To and Ship To from order data
            billTo: order.Authorized_Bill_To_Location__c || prev.billTo || "",
            site: order.Site_Name || prev.site || "",
            shippingMethod: order.Shipping_Method__c || prev.shippingMethod || "",
            incoterms: order.Incoterms__c || prev.incoterms || "",
            // We set shipTo via handleLocationSelect when initialOrderShipToId triggers, 
            // but we can also set it here as a fallback or initial value
            shipTo: order.Authorized_Ship_To_Location__c || prev.shipTo || "",

            // formatted address from API response objects if available
            shippingAddress: order.Authorized_Ship_To_Location__Address ?
              `${order.Authorized_Ship_To_Location__Address.street}, ${order.Authorized_Ship_To_Location__Address.city}, ${order.Authorized_Ship_To_Location__Address.state} ${order.Authorized_Ship_To_Location__Address.postalCode}`
              : prev.shippingAddress || "",

            billingAddress: order.Authorized_Bill_To_Location_Address ?
              `${order.Authorized_Bill_To_Location_Address.street}, ${order.Authorized_Bill_To_Location_Address.city}, ${order.Authorized_Bill_To_Location_Address.state} ${order.Authorized_Bill_To_Location_Address.postalCode}`
              : prev.billingAddress || "",

            // Contact details
            locationContact: order.Ship_to_Contact_Name || prev.locationContact || "",
            contactPhone: order.Ship_to_Contact_Phone || prev.contactPhone || "",
            contactEmail: order.Ship_to_Contact_Email || prev.contactEmail || "",

            billingContact: order.Bill_to_Contact_Name || prev.billingContact || "",
            billingPhone: order.Ship_to_Contact_Phone || prev.billingPhone || "",
            billingEmail: order.Ship_to_Contact_Email || prev.billingEmail || "",
            billToAccountName: (() => {
              if (order.Inventory_Account_Name) return order.Inventory_Account_Name;
              if (order.Bill_to_Account_Name && !order.Bill_to_Account_Name.startsWith('001')) return order.Bill_to_Account_Name;
              if (order.Bill_to_Account__c && SF_ACCOUNT_ID && order.Bill_to_Account__c.substring(0, 15) === SF_ACCOUNT_ID.substring(0, 15) && accountName && !accountName.startsWith('001')) return accountName;
              return order.Bill_to_Account_Name || "";
            })(),
            billToAccountId: order.Authorized_Bill_To_Location__r?.Account_Name__c || order.Bill_to_Account__c || "",
            shipToAccountName: (() => {
              if (order.Inventory_Account_Name) return order.Inventory_Account_Name;
              if (order.Ship_to_Account_Name && !order.Ship_to_Account_Name.startsWith('001')) return order.Ship_to_Account_Name;
              if (order.Ship_to_Account__c && SF_ACCOUNT_ID && order.Ship_to_Account__c.substring(0, 15) === SF_ACCOUNT_ID.substring(0, 15) && accountName && !accountName.startsWith('001')) return accountName;
              return order.Ship_to_Account_Name || "";
            })(),
            shipToAccountId: order.Authorized_Ship_To_Location__r?.Account_Name__c || order.Ship_to_Account__c || "",
            orderName: order.Name || order.Proposal_Name || order.Proposal_Name__c || "",
            deliveryNotes: order.Authorized_Ship_To_Location_Delivery_Notes || "",
            liftGateRequired: order.Authorized_Ship_To_Location_Lift_Gate || false,
            insideDelivery: order.Authorized_Ship_To_Location_Inside_Delivery || false
          }));

          if (order.Authorized_Ship_To_Location__c) {
            setInitialOrderShipToId(order.Authorized_Ship_To_Location__c);
          }

          if (order.Authorized_Bill_To_Location__c) {
            setInitialOrderBillToId(order.Authorized_Bill_To_Location__c);
          }

          // Store contact ID if available
          if (order.Ship_to_Contact__c) {
            setContactId(order.Ship_to_Contact__c);
            setInitialOrderContactId(order.Ship_to_Contact__c);
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoadingOrder(false);
      }
    }

    // Fetch order data for the given order ID
    if (id) {
      fetchOrder();
    }
  }, [id, SF_ACCOUNT_ID, SF_CONTACT_ID]);

  // Fetch files count for tab header
  useEffect(() => {
    if (!id || id === "new") return;
    const fetchFilesCount = async () => {
      try {
        const res = await fetch(`/api/salesforce/orders?action=files&accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&orderId=${encodeURIComponent(id)}`);
        if (res.ok) {
          const data = await res.json();
          setFilesCount(Array.isArray(data) ? data.length : 0);
        }
      } catch (error) {
        console.error("Error fetching files count:", error);
      }
    };
    fetchFilesCount();
  }, [id, SF_ACCOUNT_ID, SF_CONTACT_ID]);

  // Eager fetch fulfillment data so tab count shows on page load and tab opens without a second spinner
  useEffect(() => {
    if (!id || id === "new" || !SF_ACCOUNT_ID || !SF_CONTACT_ID) return;
    async function fetchFulfillmentEager() {
      try {
        const res = await fetch(`/api/salesforce/orders?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&orderId=${encodeURIComponent(id)}&action=fulfillment`);
        if (!res.ok) return;
        const data = await res.json();
        const parsed: FulfillmentPreloadedData = {
          invoices: data.Invoice__c || [],
          manifests: data.Shipping_Manifest__c || [],
          salesOrders: data.Sales_Order__c || [],
          proposals: data.Proposal__c || [],
          customerQuotes: data.Customer_Quote__c || [],
        };
        setFulfillmentData(parsed);
        setFulfillmentCount(parsed.invoices.length + parsed.manifests.length + parsed.salesOrders.length + parsed.proposals.length + parsed.customerQuotes.length);
      } catch { /* silent — count stays 0 */ }
    }
    fetchFulfillmentEager();
  }, [id, SF_ACCOUNT_ID, SF_CONTACT_ID]);

  // Eager fetch returns data so tab count shows on page load and tab opens without a second spinner
  useEffect(() => {
    if (!id || id === "new" || !SF_ACCOUNT_ID || !SF_CONTACT_ID) return;
    async function fetchReturnsEager() {
      try {
        const res = await fetch(`/api/salesforce/orders?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&orderId=${encodeURIComponent(id)}&action=returns`);
        if (!res.ok) return;
        const data = await res.json();
        const parsed: ReturnsPreloadedData = {
          rmaList: data.RMA__c || [],
          creditMemos: data.Credit_Memo__c || [],
          debitMemos: data.Debit_Memo__c || [],
          rtvList: data.RTV__c || [],
        };
        setReturnsData(parsed);
        const isCustomerOrNSO = (
          selectedAccount?.Account_Record_Type__c?.toLowerCase() === 'customer' ||
          selectedAccount?.Account_Type__c?.toLowerCase() === 'customer' ||
          user?.role?.toLowerCase() === 'customer' ||
          selectedAccount?.Account_Record_Type__c?.toLowerCase() === 'nso' ||
          selectedAccount?.Account_Type__c?.toLowerCase() === 'nso' ||
          user?.role?.toLowerCase() === 'nso'
        );
        setReturnsCount(parsed.rmaList.length + parsed.creditMemos.length + (isCustomerOrNSO ? 0 : parsed.debitMemos.length + parsed.rtvList.length));
      } catch { /* silent — count stays 0 */ }
    }
    fetchReturnsEager();
  }, [id, SF_ACCOUNT_ID, SF_CONTACT_ID]);

  // Calculate dynamic order totals based on actual products in the order
  // Always calculate from orderProducts to ensure real-time updates when products are added/removed
  const productsSubtotal = orderProducts.reduce((sum, product) => sum + product.subtotal, 0);
  const totalExciseTax = orderData ? (orderData.Total_Taxes_Amount__c ?? 0) : (productsSubtotal > 0 ? productsSubtotal * 0.15 : 0);
  const orderProcessing = 0; // Not in API response example, assuming 0
  const shipping = productsSubtotal > 0 ? (orderData?.Total_Shipping_Charges__c ?? 0) : 0;
  const grandTotal = productsSubtotal + totalExciseTax + orderProcessing + shipping;

  const handleAddProduct = (product: Product, quantity?: number) => {
    // Always add as a new line item, even if the same product exists
    // Generate a unique key by combining product id with timestamp
    const qty = quantity !== undefined ? quantity : (catalogQuantities[product.id] ?? product.moq ?? 1);
    const uniqueLineItem = {
      ...product,
      orderQty: qty,
      subtotal: product.unitPrice * qty,
      // Add a unique identifier for this line item
      lineItemKey: `${product.id}-${Date.now()}-${Math.random()}`
    };
    setOrderProducts(prev => [...prev, uniqueLineItem]);
  };

  const handleRemoveProduct = async (lineItemKey: string) => {
    const product = orderProducts.find(p => p.lineItemKey === lineItemKey);

    // If product has an orderLineId, it exists in Salesforce and needs to be deleted via API
    if (product?.orderLineId) {
      // Confirm deletion with user
      confirmToast(`Are you sure you want to delete ${product.name} from this order?`, async () => {
        try {
          const deleteUrl = `/api/salesforce/orders?accountId=${encodeURIComponent(SF_ACCOUNT_ID || '')}&orderLineId=${encodeURIComponent(product.orderLineId || '')}&contactId=${encodeURIComponent(SF_CONTACT_ID || '')}&orderId=${encodeURIComponent(id)}`;

          const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to delete order line' }));
            throw new Error(errorData.error || 'Failed to delete order line from Salesforce');
          }

          const result = await response.json();

          // Remove from state only after successful, confirmed API deletion
          recentlyDeletedOrderLineIds.current.add(product.orderLineId as string);
          setOrderProducts(prev => prev.filter(p => p.lineItemKey !== lineItemKey));
          success('Order line deleted successfully');
        } catch (err) {
          console.error('Error deleting order line:', err);
          toastError(err instanceof Error ? err.message : 'Failed to delete order line. Please try again.');
        }
      });
    } else {
      // Product doesn't exist in Salesforce yet, just remove from state
      setOrderProducts(prev => prev.filter(p => p.lineItemKey !== lineItemKey));
    }
  };

  const handleQuantityChange = (lineItemKey: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    setOrderProducts(prev => prev.map(p => {
      if (p.lineItemKey === lineItemKey) {
        return { ...p, orderQty: newQuantity, subtotal: newQuantity * p.unitPrice };
      }
      return p;
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedExtensions = ['pdf', 'jpeg', 'jpg', 'png', 'csv', 'xls', 'xlsx', 'doc', 'docx', 'txt'];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

    const invalidExtensionFiles = Array.from(files).filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      return !allowedExtensions.includes(ext);
    });

    const oversizedFiles = Array.from(files).filter(file => file.size > MAX_FILE_SIZE);

    if (invalidExtensionFiles.length > 0 || oversizedFiles.length > 0) {
      let errorMessage = '';
      if (invalidExtensionFiles.length > 0) {
        errorMessage += `The following files have invalid extensions and cannot be uploaded:\n${invalidExtensionFiles.map(f => `- ${f.name}`).join('\n')}\n\nAllowed: PDF, JPEG, PNG, CSV, XLS, XLSX, DOC, TXT\n\n`;
      }
      if (oversizedFiles.length > 0) {
        errorMessage += `The following files exceed the 10MB limit:\n${oversizedFiles.map(f => `- ${f.name} (${(f.size / 1024 / 1024).toFixed(2)} MB)`).join('\n')}`;
      }
      warning(errorMessage);
      e.target.value = '';
      return;
    }

    const newFiles = Array.from(files);

    // Add to local state immediately for UI feedback
    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Upload to Salesforce
    try {
      const processedFiles = [];
      for (const file of newFiles) {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = error => reject(error);
        });

        processedFiles.push({
          fileName: file.name,
          fileType: file.name.split('.').pop() || '',
          base64Data: base64Data
        });
      }

      const payload = {
        accountId: SF_ACCOUNT_ID,
        contactId: SF_CONTACT_ID,
        objectId: id,
        objectName: "Customer_Order__c",
        files: processedFiles
      };

      const res = await fetch('/api/salesforce/orders?action=uploadFiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to upload files");

      success("Files uploaded successfully");

      // Reload the page after a short delay to allow Salesforce to propagate
      setTimeout(() => window.location.reload(), 5000);
    } catch (error) {
      console.error("Error uploading files:", error);
      toastError("Failed to upload files. Please try smaller files.");
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Order submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('pdf-template');
    if (!element) {
      console.error("PDF template element not found");
      toastError("Error: PDF template not found");
      return;
    }

    try {
      setIsGeneratingPDF(true);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: true, // Enable logging for debugging
        backgroundColor: '#ffffff',
        windowWidth: 1200,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('pdf-template');
          if (clonedElement) {
            // Ensure it's visible in the clone
            clonedElement.style.display = 'block';
            clonedElement.style.position = 'absolute';
            clonedElement.style.left = '0';
            clonedElement.style.top = '0';
            clonedElement.style.zIndex = '9999';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Order_${id}.pdf`);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toastError(`Failed to generate PDF: ${error.message || error}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Fetch just the current order line IDs from Salesforce, used to verify a save's
  // deletions have actually propagated before reloading (see handleSubmitOrder).
  const fetchOrderLineIds = async (): Promise<Set<string>> => {
    try {
      const linesRes = await fetch(`/api/salesforce/orders?accountId=${encodeURIComponent(SF_ACCOUNT_ID || '')}&orderId=${encodeURIComponent(id)}&contactId=${encodeURIComponent(SF_CONTACT_ID || '')}&action=orderlines`);
      if (!linesRes.ok) return new Set();
      const linesData = await linesRes.json();

      let lines: any[] = [];
      if (Array.isArray(linesData) && linesData.length > 0) {
        const firstItem = linesData[0];
        const nestedKey = Object.keys(firstItem).find(key => key.endsWith('__c') && Array.isArray(firstItem[key]));
        lines = nestedKey ? firstItem[nestedKey] : linesData;
      } else if (linesData?.data && Array.isArray(linesData.data) && linesData.data.length > 0) {
        const firstItem = linesData.data[0];
        const nestedKey = Object.keys(firstItem).find(key => key.endsWith('__c') && Array.isArray(firstItem[key]));
        lines = nestedKey ? firstItem[nestedKey] : linesData.data;
      }

      return new Set((lines || []).map((item: any) => item.Id).filter(Boolean));
    } catch (err) {
      console.error('Error verifying order lines after save:', err);
      return new Set();
    }
  };

  // Handle order submission (update only)
  const handleSubmitOrder = async (isDraft: boolean = false) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);



      // Validate required fields
      const requiredFields = [
        { key: 'billTo', label: 'Bill to Location' },
        { key: 'billingAddress', label: 'Billing Address' },
        { key: 'purchaseOrder', label: 'Customer PO' },
        { key: 'shipTo', label: 'Ship to Location' },
        { key: 'shippingAddress', label: 'Shipping Address' },
        { key: 'requestedDeliveryDate', label: 'Request Date' },
        { key: 'locationContact', label: 'Contact Name' },
      ];

      const missingFields = requiredFields
        .filter(field => !(formData as any)[field.key])
        .map(f => f.label);

      if (missingFields.length > 0) {
        setSubmitError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        setIsSubmitting(false);
        return;
      }
      if (orderProducts.length === 0) {
        setSubmitError("Please add at least one product to the order");
        return;
      }

      // Use the selected contact ID or the contactId from the loaded order
      // Contact IDs should start with "003", not "a05" (which are Location IDs)
      const shipToContactId = selectedContactId || contactId;

      // Validate that we have a proper Contact ID
      if (!shipToContactId || !shipToContactId.startsWith('003')) {
        setSubmitError("Please select a valid ship-to contact from the dropdown");
        return;
      }

      // Prepare order data in the required format
      // Prepare order data in the required format
      const orderPayload = {
        order: {
          Id: id,
          Status__c: isDraft ? "Draft" : "Submitted",
          Bill_to_Account__c: (formData.billTo === "same" ? formData.shipToAccountId : formData.billToAccountId) || SF_ACCOUNT_ID,
          Authorized_Bill_To_Location__c: formData.billTo === "same" ? formData.shipTo : formData.billTo,
          Payment_Term__c: formData.paymentTerms,
          Customer_PO__c: formData.purchaseOrder,
          Ship_to_Account__c: formData.shipToAccountId || SF_ACCOUNT_ID,
          Authorized_Ship_To_Location__c: formData.shipTo,
          Request_Date__c: formData.requestedDeliveryDate,
          Drop_Ship__c: formData.dropShip,
          Customer_Order_Notes__c: formData.orderNotes,
          Bill_to_Contact__c: shipToContactId, // Must be Contact ID (003xxx)
          Ship_to_Contact__c: shipToContactId, // Must be Contact ID (003xxx)
          Inventory_Account__c: SF_ACCOUNT_ID,
          Shipping_Method__c: formData.shippingMethod,
          Incoterms__c: formData.incoterms,
          ...((isTransfer || orderData?.Transfer_Order__c) ? { Transfer_Order__c: true } : {}),
          ...((isTransfer || isProposal || orderData?.Proposal_Requested__c) ? { Proposal_Requested__c: true } : {})
        },
        orderLines: orderProducts
          // Filter out placeholder proposal line items — Product_Name__c is a SF lookup
          // field and rejects non-ID strings like "PROPOSAL-REQ". The Proposal_Requested__c
          // flag on the order record is sufficient for Salesforce to handle proposal orders.
          .filter(product => /^[a-zA-Z0-9]{15,18}$/.test(product.id))
          .map(product => ({
            ...(product.orderLineId ? { Id: product.orderLineId } : {}),
            Status__c: isDraft ? "Draft" : "Submitted",
            Product_Name__c: product.id,
            Order_Qty__c: product.orderQty / (product.moq || 1),
            MOQ__c: product.moq,
            Unit_Price__c: product.unitPrice,
            Inventory_Account__c: SF_ACCOUNT_ID,
            IsTaxable__c: true,
          })),

        accountId: SF_ACCOUNT_ID,
        contactId: SF_CONTACT_ID, // Use actual Contact ID
      };

      // Submit to API (always PATCH for edit mode)
      const endpoint = "/api/salesforce/orders";
      const method = "PATCH";
      const url = `${endpoint}?orderId=${id}`;

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to submit order" }));
        throw new Error(errorData.error || "Failed to submit order");
      }

      const result = await response.json();

      // Update local order status
      setOrderStatus(isDraft ? "Draft" : "Submitted");

      // Show success message
      success(isDraft ? "Order saved as draft" : "Order submitted");
      // After successful save, ensure formData reflects the selected contact details
      if (selectedContactId) {
        const selectedContact = shipContacts.find(c => c.Id === selectedContactId);
        if (selectedContact) {
          setFormData(prev => ({
            ...prev,
            locationContact: selectedContact.Name,
            contactPhone: selectedContact.Phone,
            contactEmail: selectedContact.Email
          }));
        }
      }
      // Verify this session's deletions are actually reflected before reloading,
      // retrying a few times with backoff instead of trusting a fixed delay.
      const deletedIds = Array.from(recentlyDeletedOrderLineIds.current);
      const maxAttempts = 3;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const currentIds = await fetchOrderLineIds();
        const stillStale = deletedIds.some(deletedId => currentIds.has(deletedId));
        if (!stillStale) break;
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
        }
      }
      recentlyDeletedOrderLineIds.current.clear();
      window.location.reload();
    } catch (error) {
      console.error("Error submitting order:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to submit order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => handleSubmitOrder(true);
  const handleSubmit = () => handleSubmitOrder(false);

  const handleClone = async () => {
    confirmToast("Are you sure you want to clone this order?", async () => {
      try {
        setIsSubmitting(true);
        setSubmitError(null);

        // Use the selected contact ID or the contactId from the loaded order
        const shipToContactId = selectedContactId || contactId;

        // Prepare order data similar to submit, but for cloning (no ID, status Draft)
        const orderPayload = {
          order: {
            // Id removed for clone
            Authorized_Bill_To_Location__c: formData.billTo === "same" ? formData.shipTo : formData.billTo,
            Authorized_Ship_To_Location__c: formData.shipTo,
            Bill_to_Account__c: (formData.billTo === "same" ? formData.shipToAccountId : formData.billToAccountId) || SF_ACCOUNT_ID,
            Bill_to_Contact__c: shipToContactId,
            Request_Date__c: formData.requestedDeliveryDate,
            Customer_PO__c: formData.purchaseOrder,
            Drop_Ship__c: formData.dropShip,
            Customer_Order_Notes__c: formData.orderNotes,
            Ship_to_Account__c: formData.shipToAccountId || SF_ACCOUNT_ID,
            Ship_to_Contact__c: shipToContactId,
            Payment_Term__c: formData.paymentTerms,
            Inventory_Account__c: SF_ACCOUNT_ID,
            Status__c: "Draft" // Always Draft for clones
          },
          shipToContact: {
            Id: shipToContactId,
            Phone: formData.contactPhone,
            Email: formData.contactEmail
          },
          orderLines: orderProducts
            // Filter out placeholder proposal line items (same reason as save/submit)
            .filter(product => /^[a-zA-Z0-9]{15,18}$/.test(product.id))
            .map(product => ({
              // Id removed for clone
              Status__c: "Draft",
              Customer_Order_Line_Notes__c: "",
              Product_Name__c: product.id,
              Order_Qty__c: product.orderQty / (product.moq || 1),
              MOQ__c: product.moq,
              Unit_Price__c: product.unitPrice,
              Inventory_Account__c: SF_ACCOUNT_ID,
              IsTaxable__c: true,
            })),

          accountId: SF_ACCOUNT_ID,
          contactId: SF_CONTACT_ID,
        };

        // PATCH without orderId implies clone in our API
        const endpoint = "/api/salesforce/orders";
        const method = "PATCH";
        const url = endpoint;

        const response = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(orderPayload)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to clone order" }));
          throw new Error(errorData.error || "Failed to clone order");
        }

        const result = await response.json();

        if (result.orderId) {
          // Redirect to the new order
          router.push(`/orders/${result.orderId}`);
        } else {
          toastError("Order cloned, but could not retrieve new ID.");
        }
      } catch (error) {
        console.error("Error cloning order:", error);
        setSubmitError(error instanceof Error ? error.message : "Failed to clone order");
        toastError("Failed to clone order: " + (error instanceof Error ? error.message : "Unknown error"));
      } finally {
        setIsSubmitting(false);
      }
    });
  };


  // Filter products for catalog (Add Products) view
  const filteredCatalogProducts = catalogProducts.filter(product => {
    const query = catalogSearchQuery.toLowerCase();
    if (!query) return true;
    return (
      (product.name?.toLowerCase() || "").includes(query) ||
      (product.description?.toLowerCase() || "").includes(query) ||
      (product.sku?.toLowerCase() || "").includes(query) ||
      (product.manufacturer?.toLowerCase() || "").includes(query) ||
      (product.brand?.toLowerCase() || "").includes(query) ||
      (product.productFamily?.toLowerCase() || "").includes(query)
    );
  });

  const filteredOrderProducts = orderProducts.filter(product => {
    const query = orderSearchQuery.toLowerCase();
    if (!query) return true;
    return (
      (product.name?.toLowerCase() || "").includes(query) ||
      (product.brand?.toLowerCase() || "").includes(query) ||
      (product.sku?.toLowerCase() || "").includes(query) ||
      (product.description?.toLowerCase() || "").includes(query) ||
      (product.manufacturer?.toLowerCase() || "").includes(query)
    );
  });

  // Sorting for catalog
  const { items: sortedCatalogProducts, requestSort: requestCatalogSort, sortConfig: catalogSortConfig } = useSortableData<Product>(filteredCatalogProducts);

  // Pagination for catalog
  const totalPages = Math.ceil(sortedCatalogProducts.length / itemsPerPage);
  const paginatedCatalogProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedCatalogProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedCatalogProducts, currentPage, itemsPerPage]);

  // Reset to page 1 when search changes or view mode changes
  useMemo(() => {
    setCurrentPage(1);
  }, [catalogSearchQuery, orderSearchQuery, viewMode]);

  return (
    <>
      {/*Order Header having breadcrumb status and name*/}
      <OrderHeader
        id={id}
        orderStatus={orderStatus}
        name={formData.orderName}
        isEditing={isEditing}
        onEditToggle={() => {
          if (isEditing) setSubmitError(null);
          setIsEditing(!isEditing);
        }}
        onClone={handleClone}
        isNew={isNew}
        isTransfer={isTransfer || !!orderData?.Transfer_Order__c}
        isProposal={!(isTransfer || !!orderData?.Transfer_Order__c) && (isProposal || !!orderData?.Proposal_Requested__c)}
      />
      <div className="grid grid-cols-1 w1025:grid-cols-10 gap-6 items-stretch">
        {/* Row 1 Left - Billing & Shipping (70%) */}
        <div className="w1025:col-span-7">
          <div className="grid grid-cols-1 w1025:grid-cols-2 gap-4 h-full">
            <BillingInfo
              formData={formData}
              setFormData={setFormData}
              shipLocations={shipLocations}
              handleBillToChange={handleBillToChange}
              isEditing={isEditing}
              accountName={accountName}
              SF_ACCOUNT_ID={SF_ACCOUNT_ID}
            />
            <ShippingInfo
              formData={formData}
              setFormData={setFormData}
              shipLocations={shipLocations}
              locationsLoading={locationsLoading}
              handleLocationSelect={handleLocationSelect}
              isEditing={isEditing}
              accountName={accountName}
              SF_ACCOUNT_ID={SF_ACCOUNT_ID}
            />
          </div>
        </div>

        {/* Row 1 Right - Order Notes (30%) */}
        <div className="w1025:col-span-3">
          <OrderNotes
            formData={formData}
            setFormData={setFormData}
            isEditing={isEditing}
            className="h-full"
          />
        </div>

        {/* Row 2 Left - Contact & Delivery (70%) */}
        <div className="w1025:col-span-7 flex flex-col gap-4 h-full">
          <ShipToContact
            className="flex-1"
            shipContacts={shipContacts}
            contactsLoading={contactsLoading}
            selectedContactId={selectedContactId}
            handleContactSelect={handleContactSelect}
            formData={formData}
            setFormData={setFormData}
            isEditing={isEditing}
          />
          <DeliveryOptions
            className="flex-1"
            formData={formData}
            setFormData={setFormData}
            shippingMethods={shippingMethods}
            incotermsOptions={incotermsOptions}
            isEditing={isEditing}
          />
        </div>

        {/* Row 2 Right - Order Total (30%) */}
        <div className="w1025:col-span-3 flex flex-col h-full">
          <OrderTotal
            className="flex-1"
            productsSubtotal={productsSubtotal}
            totalExciseTax={totalExciseTax}
            grandTotal={grandTotal}
            shipping={shipping}
            orderProcessing={orderProcessing}
            formData={formData}
            setFormData={setFormData}
            handleDownloadPDF={handleDownloadPDF}
            isGeneratingPDF={isGeneratingPDF}
            uploadedFiles={uploadedFiles}
            handleFileUpload={handleFileUpload}
            handleDownloadAll={handleDownloadAll}
            handleDownloadFile={handleDownloadFile}
            handleRemoveFile={handleRemoveFile}
            productsCount={orderProducts.length}
            isEditing={isEditing}
          />
        </div>
      </div>

      {/* Products Search - Full Width */}
      <div className="mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700 min-w-0">
            {/* Search — top on mobile/tablet (<1024px), left on desktop (>=1024px) */}
            <div className="flex-1 relative w-full lg:min-w-[300px]">
              <input
                type="text"
                placeholder={viewMode === "catalog" ? "Search by name, SKU, brand or manufacturer" : "Search by name, SKU, brand or manufacturer"}
                value={viewMode === "catalog" ? catalogSearchQuery : viewMode === "myOrder" ? orderSearchQuery : ""}
                onChange={(e) => {
                  if (viewMode === "catalog") setCatalogSearchQuery(e.target.value);
                  else if (viewMode === "myOrder") setOrderSearchQuery(e.target.value);
                }}
                disabled={viewMode !== "catalog" && viewMode !== "myOrder"}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              />
              <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {viewMode === "catalog" && (
              <button
                type="button"
                title="Refresh catalog"
                aria-label="Refresh catalog"
                disabled={productsLoading}
                onClick={() => loadProducts()}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <svg className={`w-5 h-5 ${productsLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            )}
            {/* Tab buttons — below search on mobile/tablet (<1024px), right on desktop (>=1024px) */}
            <Tabs
              tabs={[
                { key: "catalog", label: "Add Products" },
                { key: "myOrder", label: "My Order", count: orderProducts.length },
                { key: "taxes", label: "Taxes", count: (!loadingOrder && !!orderData) ? 1 : 0 },
                { key: "fulfillment", label: "Fulfillment", count: fulfillmentCount },
                { key: "returns", label: "Returns", count: returnsCount },
                { key: "files", label: "Files", count: filesCount },
              ]}
              activeKey={viewMode}
              onChange={(key) => setViewMode(key as typeof viewMode)}
              className="no-scrollbar pb-0.5 flex-shrink-0 lg:w-auto"
            />
          </div>

          {/* Tab Content area */}
          <div className="p-3">
            {/* Files Tab */}
            {viewMode === "files" && (
              <FilesTab
                orderId={id}
                accountId={SF_ACCOUNT_ID}
                contactId={SF_CONTACT_ID}
                isEditing={isEditing}
                onFilesCountChange={setFilesCount}
              />
            )}

            {/* Products Catalog Table */}
            {viewMode === "catalog" && (
              <ProductCatalog
                selectedProductIds={selectedProductIds}
                handleAddSelectedProducts={handleAddSelectedProducts}
                paginatedCatalogProducts={paginatedCatalogProducts}
                handleSelectAll={handleSelectAll}
                handleSelectProduct={handleSelectProduct}
                handleImageClick={handleImageClick}
                catalogQuantities={catalogQuantities}
                handleCatalogQuantityChange={handleCatalogQuantityChange}
                handleAddProduct={handleAddProduct}
                popupProduct={popupProduct}
                handleClosePopup={handleClosePopup}
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
                itemsPerPage={itemsPerPage}
                searchQuery={catalogSearchQuery}
                sortConfig={catalogSortConfig}
                requestSort={requestCatalogSort}
                isEditing={isEditing}
                widths={catalogColumns.widths}
                onResize={catalogColumns.handleResize}
              />
            )}

            {/* My Order Table */}
            {viewMode === "myOrder" && (
              <MyOrderTable
                loadingOrder={loadingOrder}
                filteredOrderProducts={filteredOrderProducts}
                orderId={id}
                handleQuantityChange={handleQuantityChange}
                handleRemoveProduct={handleRemoveProduct}
                searchQuery={orderSearchQuery}
                setHoveredTooltip={setTooltipState}
                accountId={SF_ACCOUNT_ID}
                contactId={SF_CONTACT_ID}
                setOrderProducts={setOrderProducts}
                isEditing={isEditing}
                widths={myOrderColumns.widths}
                onResize={myOrderColumns.handleResize}
              />
            )}

            {viewMode === "taxes" && (
              <TaxesTab order={orderData} loading={loadingOrder} widths={taxesColumns.widths} onResize={taxesColumns.handleResize} />
            )}

            {viewMode === "fulfillment" && (
              <FulfillmentTab orderId={id} accountId={SF_ACCOUNT_ID} contactId={SF_CONTACT_ID} onCountChange={setFulfillmentCount} preloadedData={fulfillmentData} />
            )}

            {viewMode === "returns" && (
              <ReturnsTab orderId={id} accountId={SF_ACCOUNT_ID} contactId={SF_CONTACT_ID} onCountChange={setReturnsCount} preloadedData={returnsData} />
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 px-6 py-4 flex items-center justify-between shadow-lg" style={{ zIndex: 40 }}>
        <button
          onClick={() => router.push("/orders")}
          className="w-full sm:w-auto px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto min-w-0">
          {submitError && (
            <div className="text-sm text-red-600 dark:text-red-400 max-w-md text-center sm:text-left">
              {submitError}
            </div>
          )}

          {/* Action Buttons Logic */}
          {orderStatus === "Draft" && isEditing && (
            <>
              {/* Save Draft - Only visible in Draft mode */}
              <button
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed truncate"
              >
                {isSubmitting ? "Saving..." : "Save Draft"}
              </button>

              {/* Submit Order - Visible in Draft mode */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed truncate"
              >
                {isSubmitting ? "Submitting..." : "Submit Order"}
              </button>
            </>
          )}

          {/* Recall - Visible when status is Submitted / Submit */}
          {(orderStatus?.toLowerCase() === "submitted" || orderStatus?.toLowerCase() === "submit") && (
            <button
              onClick={() => {
                confirmToast("Are you sure you want to recall this order and set it back to Draft?", () => {
                  setOrderStatus("Draft");
                  handleSaveDraft();
                });
              }}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed truncate"
            >
              {isSubmitting ? "Recalling..." : "Recall"}
            </button>
          )}
        </div>
        {/* Fixed Tooltip */}
        {tooltipState && (
          <div
            role="tooltip"
            className="fixed z-50 w-150 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-xs text-gray-900 dark:text-gray-100 pointer-events-none"
            style={{
              left: tooltipState.x,
              top: tooltipState.y - 8, // 8px gap
              transform: "translateY(-100%)"
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-24 h-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-semibold leading-tight">{tooltipState.product.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{tooltipState.product.sku ?? "—"}</div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  <div className="text-gray-500">Brand</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{tooltipState.product.brand ?? "—"}</div>
                  <div className="text-gray-500">Family</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{tooltipState.product.productFamily ?? "—"}</div>
                  <div className="text-gray-500">Unit Price</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(tooltipState.product.unitPrice)}</div>
                  <div className="text-gray-500">Available</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{formatNumber(tooltipState.product.availableQty)}</div>
                  <div className="text-gray-500">MOQ</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{formatNumber(tooltipState.product.moq)}</div>
                </div>
                {tooltipState.product.description && (
                  <div className="mt-2 text-xs text-gray-700 dark:text-gray-300">
                    {tooltipState.product.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add padding to prevent content from being hidden behind fixed footer */}
      <div className="h-20"></div>
    </>
  );
}
