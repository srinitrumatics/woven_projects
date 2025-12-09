"use client";

import { use, useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { formatCurrency, formatNumber } from "@/lib/utils/formatting";
import { Product } from "@/app/orders/types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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
  Active__c: boolean;
  Lift_Gate__c: boolean;
  Inside_Delivery__c: boolean;
  Address__c: Address;
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
  CustomerOrderLines?: OrderItem[];
  [key: string]: any;
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // This page is always in edit mode (order must be created first via the orders list page)

  // header order status
  const [orderStatus, setOrderStatus] = useState<string>("Draft");

  // State management for product tables
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"myOrder" | "catalog" | "files">("myOrder"); // Default to My Order table
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [orderProducts, setOrderProducts] = useState<Product[]>([]);
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Store contact ID for order submission
  const [contactId, setContactId] = useState<string>("");

  // Tooltip state
  const [hoveredTooltip, setHoveredTooltip] = useState<{ product: Product; x: number; y: number } | null>(null);

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

  const handleTooltipEnter = (e: React.MouseEvent<HTMLElement>, product: Product) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredTooltip({
      product,
      x: rect.left,
      y: rect.top
    });
  };

  const handleTooltipLeave = () => {
    setHoveredTooltip(null);
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
      const qty = catalogQuantities[product.id] || product.moq || 1;
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
    dropShip: false,
    liftGateRequired: false,
    insideDelivery: false,
    deliveryNotes: "",

    // Order Notes
    orderNotes: ""
  });

  // Ship-to locations loaded from Salesforce via server proxy
  const [shipLocations, setShipLocations] = useState<AuthorizedLocation[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [initialOrderShipToId, setInitialOrderShipToId] = useState<string | null>(null);
  const [initialOrderBillToId, setInitialOrderBillToId] = useState<string | null>(null);
  const [initialOrderContactId, setInitialOrderContactId] = useState<string | null>(null);

  // Ship-to contacts loaded from Salesforce
  const [shipContacts, setShipContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string>("");

  // Product catalog loaded from Salesforce
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const SF_ACCOUNT_ID = process.env.NEXT_PUBLIC_SALESFORCE_ACCOUNT_ID ?? "001QL00001Kbvt3YAB"; // override with real value
  const SF_CONTACT_ID = process.env.NEXT_PUBLIC_SALESFORCE_ACCOUNT_ID ?? "003QL00001EzLjZYAV" //TODO: Get this from session / auth context

  useEffect(() => {
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

        if (mounted) {
          // Handle the actual API response structure
          let locations: AuthorizedLocation[] = [];
          let paymentTerms = '';

          // The API route returns resultdata.data directly, so check if data is an array first
          if (Array.isArray(data)) {
            console.log('Response is a direct array, length:', data.length);
            // If it's an array, check if first element has AuthorizedLocation
            if (data.length > 0 && data[0].AuthorizedLocation && Array.isArray(data[0].AuthorizedLocation)) {
              locations = data[0].AuthorizedLocation;
              paymentTerms = data[0].Payment_Terms__c || '';
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
              } else {
                locations = data.data;
              }
            }
          } else if (data.AuthorizedLocation && Array.isArray(data.AuthorizedLocation)) {
            locations = data.AuthorizedLocation;
            paymentTerms = data.Payment_Terms__c || '';
          }

          if (locations.length > 0) {

            // Deduplicate locations by ID and filter out any with missing IDs
            const validLocations = locations.filter(loc => {
              const isValid = loc && loc.Id && loc.Name;
              if (!isValid) {
                console.warn('Invalid location found:', loc);
              }
              return isValid;
            });

            console.log('Valid locations count:', validLocations.length);

            const uniqueLocations = Array.from(
              new Map(validLocations.map(item => [item.Id, item])).values()
            );

            console.log('Unique locations count:', uniqueLocations.length);
            console.log('Location names:', uniqueLocations.map(loc => `${loc.Id}: ${loc.Name}`));

            setShipLocations(uniqueLocations);
          } else {
            console.warn('No locations found in response');
            setShipLocations([]);
          }

          // Set payment terms if available
          if (paymentTerms) {
            console.log('Setting payment terms:', paymentTerms);
            setFormData(prev => ({ ...prev, paymentTerms }));
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
  }, [SF_ACCOUNT_ID]); // run once on mount

  // Load contacts from Salesforce
  useEffect(() => {
    let mounted = true;
    async function loadContacts() {
      try {
        setContactsLoading(true);
        const res = await fetch(`/api/salesforce/orders?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&action=contacts`);
        console.log('=== CONTACTS FETCH ===');
        console.log('Response status:', res.status, res.statusText);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Failed to fetch contacts:", errorText);
          return;
        }

        const data = await res.json();
        console.log('Raw contacts API response:', JSON.stringify(data, null, 2));

        if (mounted) {
          // Handle the API response structure
          let contacts: Contact[] = [];

          // The API returns data directly as an array
          if (Array.isArray(data)) {
            contacts = data;
            console.log('Response is a direct array, length:', data.length);
          } else if (data.data && Array.isArray(data.data)) {
            contacts = data.data;
            console.log('Response has data property, length:', data.data.length);
          }

          console.log('Parsed contacts count:', contacts.length);
          if (contacts.length > 0) {
            console.log('Sample contact:', JSON.stringify(contacts[0], null, 2));
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
  }, [SF_ACCOUNT_ID]); // run once on mount

  // Load products from Salesforce
  useEffect(() => {
    async function loadProducts() {
      try {
        setProductsLoading(true);
        const res = await fetch(`/api/salesforce/orders?action=products&accountId=${SF_ACCOUNT_ID}`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();

        if (Array.isArray(data)) {
          const mappedProducts: Product[] = data.map((item: any) => ({
            id: item.Id,
            name: item.Name,
            description: item.Description || "",
            productFamily: item.Family || "General",
            sku: item.Name || "", // Using Name as SKU since StockKeepingUnit is not in response
            manufacturer: item.Manufacturer_Name__r?.Name || "Unknown",
            brand: item.Manufacturer_Name__r?.Name || "Unknown", // Using Manufacturer as Brand
            availableQty: item.Available_To_Sell__c || 0,
            moq: item.MOQ__c || 1, // Use MOQ from API or default to 1
            listPrice: item.List_Price__c || 0,
            unitPrice: item.Unit_Price__c || 0,
            orderQty: 0,
            subtotal: 0
          }));
          setCatalogProducts(mappedProducts);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setProductsLoading(false);
      }
    }
    loadProducts();
  }, [SF_ACCOUNT_ID]);

  // Handle contact selection
  const handleContactSelect = (contactId: string) => {
    setSelectedContactId(contactId);
    const selectedContact = shipContacts.find(c => c.Id === contactId);
    if (selectedContact) {
      setFormData(prev => ({
        ...prev,
        locationContact: selectedContact.Name,
        contactPhone: selectedContact.Phone,
        contactEmail: selectedContact.Email,
        // Copy to billing contact fields
        billingContact: selectedContact.Name,
        billingPhone: selectedContact.Phone,
        billingEmail: selectedContact.Email,
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

    setFormData(prev => ({
      ...prev,
      shipTo: location.Id,
      shippingAddress: formattedAddress,
      liftGateRequired: location.Lift_Gate__c,
      insideDelivery: location.Inside_Delivery__c
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



  // Sync Billing Address with Shipping Address if "Same as Shipping" is selected
  useEffect(() => {
    if (formData.billTo === "same") {
      setFormData(prev => ({
        ...prev,
        billingAddress: prev.shippingAddress
      }));
    }
  }, [formData.billTo, formData.shippingAddress]);

  const handleBillToSelect = (locationId: string) => {
    if (locationId === "same") {
      setFormData(prev => ({
        ...prev,
        billTo: "same",
        billingAddress: prev.shippingAddress
      }));
    } else {
      const selectedLoc = shipLocations.find(l => l.Id === locationId);
      if (selectedLoc) {
        const address = selectedLoc.Address__c;
        const formattedAddress = address ? `${address.street}, ${address.city}, ${address.state} ${address.postalCode}` : "";
        setFormData(prev => ({
          ...prev,
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

    async function fetchOrder() {
      try {
        setLoadingOrder(true);
        // Use the new getOrderFromSalesforce service function via API
        // We need to pass accountId and contactId as query params
        const accountId = SF_ACCOUNT_ID;
        const orderId = id;

        const res = await fetch(`/api/salesforce/orders?accountId=${encodeURIComponent(accountId)}&orderId=${encodeURIComponent(orderId)}&contactId=abc`);

        if (!res.ok) {
          throw new Error(`Failed to fetch order: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        console.log("Fetched order data:", data);

        if (data && data.length > 0) {
          const order: Order = data[0];
          setOrderData(order);

          // Update Order Status
          if (order.Status__c) setOrderStatus(order.Status__c);

          // Map Order Items to Products
          if (order.CustomerOrderLines) {
            const mappedProducts: Product[] = order.CustomerOrderLines.map((item: OrderItem, index: number) => ({
              id: item.Product_Name__c || item.Id, // Use Product_Name__c as product ID if available
              name: item.ProductName || "Unknown Product",
              sku: item.Name || "", // Using Name as SKU/Line ID for now
              description: item.Product_Description__c || "",
              unitPrice: item.Unit_Price__c,
              listPrice: item.Unit_Price__c, // Assuming list price same as unit price for now
              brand: "", // Not in API response
              manufacturer: item.Manufacturer_Name__c || "",
              productFamily: item.ProductFamily || "", // Not in API response
              availableQty: 999,
              moq: item.MOQ__c || 1,
              orderQty: item.Order_Qty__c,
              subtotal: item.Total_Price__c,
              // Store the original order line ID for updates
              orderLineId: item.Id,
              // Add unique lineItemKey for proper tracking and deletion
              lineItemKey: `${item.Id}-${Date.now()}-${index}-${Math.random()}`
            }));
            console.log("Mapped products:", mappedProducts);
            setOrderProducts(mappedProducts);
          }

          // Update Form Data with Order Details
          setFormData(prev => ({
            ...prev,
            purchaseOrder: order.Customer_PO__c || prev.purchaseOrder,
            requestedDeliveryDate: order.Request_Date__c || prev.requestedDeliveryDate,
            orderNotes: order.Customer_Order_Notes__c || prev.orderNotes,
            dropShip: order.Drop_Ship__c || prev.dropShip,
            // Set Bill To and Ship To from order data
            billTo: order.Authorized_Bill_To_Location__c || prev.billTo,
            // We set shipTo via handleLocationSelect when initialOrderShipToId triggers, 
            // but we can also set it here as a fallback or initial value
            shipTo: order.Authorized_Ship_To_Location__c || prev.shipTo,
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
  }, [id, SF_ACCOUNT_ID]);

  // Calculate dynamic order totals based on actual products in the order
  // Always calculate from orderProducts to ensure real-time updates when products are added/removed
  const productsSubtotal = orderProducts.reduce((sum, product) => sum + product.subtotal, 0);
  const totalExciseTax = productsSubtotal > 0 ? productsSubtotal * 0.15 : 0;
  const orderProcessing = 0; // Not in API response example, assuming 0
  const shipping = productsSubtotal > 0 ? 65.00 : 0;
  const grandTotal = productsSubtotal + totalExciseTax + orderProcessing + shipping;

  const handleAddProduct = (product: Product, quantity?: number) => {
    // Always add as a new line item, even if the same product exists
    // Generate a unique key by combining product id with timestamp
    const qty = quantity || catalogQuantities[product.id] || product.moq || 1;
    const uniqueLineItem = {
      ...product,
      orderQty: qty,
      subtotal: product.unitPrice * qty,
      // Add a unique identifier for this line item
      lineItemKey: `${product.id}-${Date.now()}-${Math.random()}`
    };
    setOrderProducts([...orderProducts, uniqueLineItem]);
  };

  const handleRemoveProduct = async (lineItemKey: string) => {
    const product = orderProducts.find(p => p.lineItemKey === lineItemKey);

    // If product has an orderLineId, it exists in Salesforce and needs to be deleted via API
    if (product?.orderLineId) {
      // Confirm deletion with user
      if (!confirm(`Are you sure you want to delete ${product.name} from this order?`)) {
        return;
      }

      try {
        const deleteUrl = `/api/salesforce/orders?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&orderLineId=${encodeURIComponent(product.orderLineId)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}`;

        console.log('Deleting order line:', product.orderLineId);

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
        console.log('Order line deleted successfully:', result);

        // Remove from state only after successful API deletion
        setOrderProducts(orderProducts.filter(p => p.lineItemKey !== lineItemKey));
        alert('Order line deleted successfully');
      } catch (error) {
        console.error('Error deleting order line:', error);
        alert(error instanceof Error ? error.message : 'Failed to delete order line. Please try again.');
      }
    } else {
      // Product doesn't exist in Salesforce yet, just remove from state
      setOrderProducts(orderProducts.filter(p => p.lineItemKey !== lineItemKey));
    }
  };

  const handleQuantityChange = (lineItemKey: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    setOrderProducts(orderProducts.map(p =>
      p.lineItemKey === lineItemKey ? { ...p, orderQty: newQuantity, subtotal: newQuantity * p.unitPrice } : p
    ));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit per file
    const newFiles = Array.from(files);

    // Check file sizes
    const oversizedFiles = newFiles.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      alert(`The following files exceed the 4MB limit and cannot be uploaded:\n${oversizedFiles.map(f => `- ${f.name} (${(f.size / 1024 / 1024).toFixed(2)}MB)`).join('\n')}`);
      // Filter out oversized files
      const validFiles = newFiles.filter(file => file.size <= MAX_FILE_SIZE);
      if (validFiles.length === 0) return;
      // Continue with valid files only
      newFiles.length = 0;
      newFiles.push(...validFiles);
    }

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

      alert("Files uploaded successfully");
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Failed to upload files. Please try smaller files.");
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
    console.log("Starting PDF generation...");
    const element = document.getElementById('pdf-template');
    if (!element) {
      console.error("PDF template element not found");
      alert("Error: PDF template not found");
      return;
    }

    try {
      setIsGeneratingPDF(true);
      console.log("Capturing canvas...");

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

      console.log("Canvas captured, generating PDF...");
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
      console.log("PDF saved");
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error.message || error}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Handle order submission (update only)
  const handleSubmitOrder = async (isDraft: boolean = false) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Validate required fields
      if (!formData.shipTo) {
        setSubmitError("Please select a ship-to location");
        return;
      }
      if (!formData.billTo) {
        setSubmitError("Please select a bill-to location");
        return;
      }
      if (!formData.purchaseOrder) {
        setSubmitError("Please enter a purchase order number");
        return;
      }
      if (!formData.requestedDeliveryDate) {
        setSubmitError("Please select a requested delivery date");
        return;
      }
      if (!formData.locationContact || !formData.contactPhone || !formData.contactEmail) {
        setSubmitError("Please fill in all contact information");
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
      const orderPayload = {
        order: {
          Id: id,
          Authorized_Bill_To_Location__c: formData.billTo === "same" ? formData.shipTo : formData.billTo,
          Authorized_Ship_To_Location__c: formData.shipTo,
          Bill_to_Account__c: SF_ACCOUNT_ID,
          Bill_to_Contact__c: shipToContactId, // Must be Contact ID (003xxx)
          Request_Date__c: formData.requestedDeliveryDate,
          Customer_PO__c: formData.purchaseOrder,
          Drop_Ship__c: formData.dropShip,
          Customer_Order_Notes__c: formData.orderNotes,
          Ship_to_Account__c: SF_ACCOUNT_ID,
          Ship_to_Contact__c: shipToContactId, // Must be Contact ID (003xxx)
          Payment_Term__c: formData.paymentTerms,
          Inventory_Account__c: SF_ACCOUNT_ID,
          Status__c: isDraft ? "Draft" : "Submitted"
        },
        shipToContact: {
          Id: shipToContactId, // Must include Contact ID
          Phone: formData.contactPhone,
          Email: formData.contactEmail
        },
        orderLines: orderProducts.map(product => ({
          ...(product.orderLineId ? { Id: product.orderLineId } : {}),
          Status__c: isDraft ? "Draft" : "Submitted",
          Customer_Order_Line_Notes__c: "",
          Product_Name__c: product.id,
          Order_Qty__c: product.orderQty,
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
      console.log("Order submitted successfully:", result);

      // Update local order status
      setOrderStatus(isDraft ? "Draft" : "Submitted");

      // Show success message
      alert(isDraft ? "Order saved as draft successfully!" : "Order submitted successfully!");
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
      // Refresh the page to reflect latest data
      router.refresh();

    } catch (error) {
      console.error("Error submitting order:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to submit order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => handleSubmitOrder(true);
  const handleSubmit = () => handleSubmitOrder(false);

  // Filter products for catalog view
  const filteredCatalogProducts = catalogProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrderProducts = orderProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination for catalog
  const totalPages = Math.ceil(filteredCatalogProducts.length / itemsPerPage);
  const paginatedCatalogProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCatalogProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCatalogProducts, currentPage, itemsPerPage]);

  // Reset to page 1 when search changes or view mode changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, viewMode]);

  return (
    <Sidebar>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <button onClick={() => router.push("/orders")} className="hover:text-gray-700 dark:hover:text-gray-300">Orders</button>
          <span>&gt;</span>
          <span className="hover:text-gray-700 dark:hover:text-gray-300">Edit Order</span>
          <span>&gt;</span>
          <span className="text-gray-900 dark:text-white">Order #{id}</span>
        </div>

        {/* Order header card (full width) */}
        <div className="w-full dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 3h18v4H3z" />
                  <path d="M21 7v11a2 2 0 0 1-2 2H5a2 2 0 01-2-2V7" />
                  <path d="M7 12h10" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order #{id}</h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">Order details and summary</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${orderStatus === "Delivered"
                  ? "bg-green-100 text-green-800"
                  : orderStatus === "Draft"
                    ? "bg-blue-100 text-blue-800"
                    : orderStatus === "Approved"
                      ? "bg-green-200 text-green-900"
                      : orderStatus === "In Progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : orderStatus === "Submitted"
                          ? "bg-yellow-200 text-yellow-900"
                          : orderStatus === "Canceled"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
              >
                {orderStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Left Column - Client Information (70%) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Billing and Shipping Information Cards - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Billing Information Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden h-fit">
              <div className="w-full flex items-center gap-2 justify-start p-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Billing Information</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Payment details for this order</p>
                </div>
              </div>

              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bill To Location <span className="text-red-500">*</span>
                    </label>
                    <select name="billTo"
                      value={formData.billTo}
                      onChange={handleBillToChange}
                      className="w-full h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option key="select-bill" value="">Select a location...</option>
                      <option key="same-as-shipping" value="same">Same as Shipping</option>
                      {shipLocations.map(location => (
                        <option key={location.Id} value={location.Id}>
                          {location.Name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Billing Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.billingAddress}
                      onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                      className="w-full h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Purchase Order # <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter PO number"
                      value={formData.purchaseOrder}
                      onChange={(e) => setFormData({ ...formData, purchaseOrder: e.target.value })}
                      className="w-full h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Terms</label>
                    <input
                      placeholder="Payment Terms"
                      type="text" name="paymentTerms"
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                      className="w-full h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Shipping Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden h-fit">
              <div className="w-full flex items-center gap-2 justify-start p-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Shipping Information</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Where should we deliver your order?</p>
                </div>
              </div>

              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ship To Location <span className="text-red-500">*</span>
                    </label>
                    <select name="shipTo"
                      value={formData.shipTo}
                      onChange={(e) => {
                        const selectedLoc = shipLocations.find(l => l.Id === e.target.value);
                        if (selectedLoc) {
                          handleLocationSelect(selectedLoc);
                        } else {
                          setFormData({ ...formData, shipTo: e.target.value });
                        }
                      }}
                      className="w-full h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option key="select-ship" value="">Select a location...</option>
                      {locationsLoading ? (
                        <option key="loading">Loading locations...</option>
                      ) : shipLocations.length === 0 ? (
                        <option key="no-locations">No locations found. Please add a ship-to location.</option>
                      ) : (
                        shipLocations.map(location => (
                          <option key={location.Id} value={location.Id}>
                            {location.Name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>


                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Shipping Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.shippingAddress}
                      onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                      className="w-full h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Requested Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.requestedDeliveryDate}
                      onChange={(e) => setFormData({ ...formData, requestedDeliveryDate: e.target.value })}
                      className="w-full h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Drop-Ship</label>
                    <div className="flex items-center h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                      <input
                        type="checkbox"
                        checked={formData.dropShip}
                        onChange={(e) => setFormData({ ...formData, dropShip: e.target.checked })}
                        className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary mr-3"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Direct to customer</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Ship to Contact */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="w-full flex items-center gap-2 justify-start p-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ship to Contact</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Who should we contact about this delivery?</p>
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Contact Selection Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Contact
                  </label>
                  <select
                    value={selectedContactId}
                    onChange={(e) => handleContactSelect(e.target.value)}
                    className="w-full h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    <option value="">Select a contact...</option>
                    {contactsLoading ? (
                      <option>Loading contacts...</option>
                    ) : shipContacts.length === 0 ? (
                      <option>No contacts found</option>
                    ) : (
                      shipContacts.map(contact => (
                        <option key={contact.Id} value={contact.Id}>
                          {contact.Name} - {contact.Email}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={formData.locationContact}
                    onChange={(e) => setFormData({ ...formData, locationContact: e.target.value })}
                    className="w-full h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="contact@example.com"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Options */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="w-full flex items-center gap-2 justify-start p-4">
              <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delivery Options</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Select any special delivery requirements</p>
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Delivery Notes</label>
                  <input
                    type="text"
                    placeholder="Special delivery instructions..."
                    value={formData.deliveryNotes}
                    onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                    className="w-full h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Lift Gate</label>
                  <div className="flex items-center h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <input
                      type="checkbox"
                      checked={formData.liftGateRequired}
                      onChange={(e) => setFormData({ ...formData, liftGateRequired: e.target.checked })}
                      className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary mr-3"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Equipment needed</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Inside Delivery</label>
                  <div className="flex items-center h-11 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <input
                      type="checkbox"
                      checked={formData.insideDelivery}
                      onChange={(e) => setFormData({ ...formData, insideDelivery: e.target.checked })}
                      className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary mr-3"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Bring inside facility</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Right Column - Order Total (30%) */}
        <div className="lg:col-span-3 flex flex-col">
          {/* Order Total Card (adaptive height, scrolls if content overflows) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700 h-full w-full flex flex-col" role="region" aria-label="Order total">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Order Total</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Review your order summary</p>
              </div>
            </div>
            {/* Price Breakdown */}
            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">Subtotal</span>
                <span className="text-gray-900 dark:text-white font-medium">${productsSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">Total Taxes</span>
                <span className="text-gray-900 dark:text-white font-semibold">${totalExciseTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-gray-300 dark:border-gray-600 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900 dark:text-white">Grand Total</span>
                  <span className="text-primary dark:text-primary">${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="space-y-2 text-sm border-t border-gray-300 dark:border-gray-600 pt-3">
                <div className="flex justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-700 dark:text-gray-300">Order Processing</span>
                    <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-900 dark:text-white">${orderProcessing.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Shipping</span>
                  <span className="text-gray-900 dark:text-white">${shipping.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Grand Total */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 pb-3 mb-3">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-gray-900 dark:text-white">Total</span>
                <span className="text-xl font-bold text-primary">${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Order Notes - grows to fill remaining space */}
            <div className="border-t border-gray-300 dark:border-gray-600 pt-3 flex-1 flex flex-col">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order Notes</label>
              <textarea
                placeholder="Add special instructions or notes..."
                value={formData.orderNotes}
                onChange={(e) => setFormData({ ...formData, orderNotes: e.target.value })}
                className="w-full flex-1 min-h-[60px] px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400 resize-none"
              />
            </div>

            {/* Download PDF Button */}
            <div className="border-t border-gray-300 dark:border-gray-600 pt-3 mt-3">
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white hover:border-primary dark:hover:bg-primary dark:hover:text-white dark:hover:border-primary transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingPDF ? (
                  <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
              </button>
            </div>

            {/* Upload Attachments */}
            <div className="border-t border-gray-300 dark:border-gray-600 pt-3 mt-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Attachments</label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-2 cursor-pointer hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all">
                <svg className="w-5 h-5 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center">PDF, JPEG, or PNG</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{uploadedFiles.length} file(s) attached</span>
                    {uploadedFiles.length > 1 && (
                      <button
                        onClick={handleDownloadAll}
                        className="text-xs text-primary hover:text-primary-dark hover:underline flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download All
                      </button>
                    )}
                  </div>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded px-2 py-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <svg className="w-3 h-3 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDownloadFile(file)}
                          className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary p-1"
                          title="Download"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"
                          title="Remove"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}


            </div>
          </div>
        </div>
      </div>
      {/* Products Search - Full Width */}
      <div className="mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by name, sku or price"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => setViewMode("files")}
                className={`px-4 py-2 rounded-lg transition-colors ${viewMode === "files"
                  ? "bg-primary text-white"
                  : "bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
              >
                Files
              </button>
              <button
                onClick={() => setViewMode("catalog")}
                className={`px-4 py-2 rounded-lg transition-colors ${viewMode === "catalog"
                  ? "bg-primary text-white"
                  : "bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
              >
                Add Products
              </button>
              <button
                onClick={() => setViewMode("myOrder")}
                className={`px-4 py-2 rounded-lg transition-colors ${viewMode === "myOrder"
                  ? "bg-primary text-white"
                  : "bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
              >
                My Order ({orderProducts.length})
              </button>
            </div>
          </div>

          {/* Files Tab */}
          {viewMode === "files" && (
            <FilesTab
              orderId={id}
              accountId={SF_ACCOUNT_ID}
              contactId={SF_CONTACT_ID}
            />
          )}

          {/* Products Catalog Table */}
          {viewMode === "catalog" && (
            <>
              <div className="flex justify-end mb-2">
                {selectedProductIds.size > 0 && (
                  <button
                    onClick={handleAddSelectedProducts}
                    className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
                  >
                    Add Selected ({selectedProductIds.size})
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-light dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-2 text-left w-10">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={paginatedCatalogProducts.length > 0 && paginatedCatalogProducts.every(p => selectedProductIds.has(p.id))}
                          className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                        />
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Image</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Product Name</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Manufacturer</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Family</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Unit Price</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Available Qty</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Qty to Order</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedCatalogProducts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          {searchQuery ? "No products found matching your search." : "All products have been added to your order."}
                        </td>
                      </tr>
                    ) : (
                      paginatedCatalogProducts.map((product) => (
                        <tr key={product.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedProductIds.has(product.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={selectedProductIds.has(product.id)}
                              onChange={() => handleSelectProduct(product.id)}
                              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <div
                              className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleImageClick(product)}
                            >
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]" title={product.name}>{product.name}</div>
                            <div className="text-xs font-mono text-gray-500 dark:text-gray-400">{product.sku}</div>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white truncate max-w-[150px]">{product.manufacturer}</td>
                          <td className="px-4 py-2">
                            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-primary/10 text-primary truncate max-w-[100px]">
                              {product.productFamily}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-white font-semibold">
                            {formatCurrency(product.unitPrice)}
                          </td>
                          <td className="px-4 py-2 text-sm text-center text-gray-900 dark:text-white">
                            <div>{formatNumber(product.availableQty)}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">MOQ: {product.moq || 1}</div>
                          </td>
                          <td className="px-4 py-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  const currentQty = catalogQuantities[product.id] || product.moq || 1;
                                  const moq = product.moq || 1;
                                  const newQty = Math.max(currentQty - moq, moq);
                                  handleCatalogQuantityChange(product.id, newQty, moq);
                                }}
                                className="w-8 h-8 flex items-center justify-center bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={product.moq || 1}
                                step={product.moq || 1}
                                value={catalogQuantities[product.id] || product.moq || 1}
                                onChange={(e) => handleCatalogQuantityChange(product.id, Number(e.target.value), product.moq || 1)}
                                className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent text-center"
                              />
                              <button
                                onClick={() => {
                                  const currentQty = catalogQuantities[product.id] || product.moq || 1;
                                  const moq = product.moq || 1;
                                  const newQty = currentQty + moq;
                                  handleCatalogQuantityChange(product.id, newQty, moq);
                                }}
                                className="w-8 h-8 flex items-center justify-center bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-center">
                            <button
                              onClick={() => handleAddProduct(product)}
                              className="p-1.5 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                              title="Add to Order"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-8.9-5h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4l-3.87 7H8.53L4.27 2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7l1.1-2z" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Image Popup Modal */}
              {popupProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={handleClosePopup}>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6 relative" onClick={e => e.stopPropagation()}>
                    <button
                      className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      onClick={handleClosePopup}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    <div className="flex flex-col items-center">
                      <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-6">
                        <svg className="w-32 h-32 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">{popupProduct.name}</h3>
                      <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-4">{popupProduct.sku}</p>

                      <div className="w-full grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                          <span className="text-xs text-gray-500 dark:text-gray-400 block">Manufacturer</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{popupProduct.manufacturer}</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                          <span className="text-xs text-gray-500 dark:text-gray-400 block">Family</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{popupProduct.productFamily}</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                          <span className="text-xs text-gray-500 dark:text-gray-400 block">Price</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(popupProduct.unitPrice)}</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                          <span className="text-xs text-gray-500 dark:text-gray-400 block">Available</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{formatNumber(popupProduct.availableQty)}</span>
                        </div>
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                        {popupProduct.description || "No description available."}
                      </p>

                      <button
                        onClick={() => {
                          handleAddProduct(popupProduct);
                          handleClosePopup();
                        }}
                        className="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        Add to Order
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Pagination for Catalog */}
          {viewMode === "catalog" && filteredCatalogProducts.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredCatalogProducts.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemName="products"
            />
          )}

          {/* My Order Table */}
          {viewMode === "myOrder" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-light dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Image</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Product Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Manufacturer</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Product Family</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Unit Price</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Order Qty</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Subtotal</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {loadingOrder ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        Loading order details...
                      </td>
                    </tr>
                  ) : filteredOrderProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        {searchQuery ? "No products found matching your search." : "Your order is empty. Click 'Add Products' to start adding items."}
                      </td>
                    </tr>
                  ) : (
                    filteredOrderProducts.map((product) => (
                      <tr key={product.lineItemKey || product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                          {/* Product name with hover tooltip showing full details */}
                          <span
                            className="underline cursor-help"
                            onMouseEnter={(e) => handleTooltipEnter(e, product)}
                            onMouseLeave={handleTooltipLeave}
                          >
                            {product.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{product.manufacturer}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary">
                            {product.productFamily}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">${product.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  const moq = product.moq || 1;
                                  const newQty = Math.max(product.orderQty - moq, moq);
                                  handleQuantityChange(product.lineItemKey!, newQty);
                                }}
                                className="w-8 h-8 flex items-center justify-center bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={product.orderQty}
                                onChange={(e) => handleQuantityChange(product.lineItemKey!, parseInt(e.target.value) || 0)}
                                className="w-20 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-center text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                                min={product.moq || 1}
                                step={product.moq || 1}
                              />
                              <button
                                onClick={() => {
                                  const moq = product.moq || 1;
                                  handleQuantityChange(product.lineItemKey!, product.orderQty + moq);
                                }}
                                className="w-8 h-8 flex items-center justify-center bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              >
                                +
                              </button>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">MOQ: {product.moq || 1}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">${product.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleRemoveProduct(product.lineItemKey!)}
                            title="Remove from order"
                            aria-label={`Remove ${product.name} from order`}
                            className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors inline-flex items-center justify-center"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m5 0V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* Hidden PDF Template - Positioned off-screen but visible to DOM */}
      <div className="absolute top-0 left-[-9999px] w-[1000px] bg-white p-10 text-gray-900" id="pdf-template">
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-primary" style={{ color: 'rgb(150, 194, 219)', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>WOVN</h1>
            <div className="text-sm text-gray-600">
              <p>123 Business Street</p>
              <p>Business City, ST 12345</p>
              <p>USA</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Purchase Order</h2>
            <div className="text-sm">
              <p><span className="font-semibold">PO No:</span> {formData.purchaseOrder || "N/A"}</p>
              <p><span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}</p>
              <p><span className="font-semibold">Status:</span> {orderStatus}</p>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Billing (Left) */}
          <div>
            <div className="bg-primary-light dark:bg-gray-900 text-black px-4 font-semibold uppercase text-sm mb-2 flex items-center justify-center" style={{ backgroundColor: 'rgb(229, 237, 241)', color: '#000000', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '35px' }}>
              Billing Information
            </div>
            <div className="px-4 text-sm text-gray-700">
              <p className="font-bold mb-1">{formData.billTo !== "same" ? shipLocations.find(l => l.Id === formData.billTo)?.Name : "Same as Shipping"}</p>
              <p className="whitespace-pre-wrap">{formData.billingAddress}</p>
              <div className="mt-4">
                <p><span className="font-semibold">Contact:</span> {formData.locationContact}</p>
                <p><span className="font-semibold">Email:</span> {formData.contactEmail}</p>
                <p><span className="font-semibold">Phone:</span> {formData.contactPhone}</p>
              </div>
            </div>
          </div>

          {/* Shipping (Right) */}
          <div>
            <div className="bg-primary-light dark:bg-gray-900 text-black px-4 font-semibold uppercase text-sm mb-2 flex items-center justify-center" style={{ backgroundColor: 'rgb(229, 237, 241)', color: '#000000', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '35px' }}>
              Shipping Information
            </div>
            <div className="px-4 text-sm text-gray-700">
              <p className="font-bold mb-1">{shipLocations.find(l => l.Id === formData.shipTo)?.Name}</p>
              <p className="whitespace-pre-wrap">{formData.shippingAddress}</p>
              <div className="mt-4">
                <p><span className="font-semibold">Contact:</span> {formData.locationContact}</p>
                <p><span className="font-semibold">Email:</span> {formData.contactEmail}</p>
                <p><span className="font-semibold">Phone:</span> {formData.contactPhone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Info Bar */}
        <div className="bg-primary-light dark:bg-gray-900 text-black px-4 py-2 grid grid-cols-4 gap-4 text-sm font-semibold uppercase mb-8 items-center text-center" style={{ backgroundColor: 'rgb(229, 237, 241)', color: '#000000', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact', alignItems: 'center', height: '35px', display: 'grid' }}>
          <div>Delivery Date</div>
          <div>Requested By</div>
          <div>Payment Terms</div>
          <div>Shipping Method</div>
        </div>
        <div className="px-4 grid grid-cols-4 gap-4 text-sm text-gray-700 mb-8 -mt-6">
          <div>{formData.requestedDeliveryDate || "N/A"}</div>
          <div>{formData.locationContact || "N/A"}</div>
          <div>{formData.paymentTerms || "N/A"}</div>
          <div>{formData.dropShip ? "Drop Ship" : "Standard"}</div>
        </div>

        {/* Notes */}
        {formData.orderNotes && (
          <div className="mb-8">
            <div className="bg-primary-light dark:bg-gray-900 text-black px-4 py-2 font-semibold uppercase text-sm mb-2 flex items-center justify-center" style={{ backgroundColor: 'rgb(229, 237, 241)', color: '#000000', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '35px' }}>
              Notes
            </div>
            <div className="px-4 text-sm text-gray-700 border border-gray-200 p-4 bg-gray-50">
              {formData.orderNotes}
            </div>
          </div>
        )}

        {/* Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="bg-primary-light dark:bg-gray-900 text-black text-sm uppercase font-semibold" style={{ backgroundColor: 'rgb(229, 237, 241)', color: '#000000', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact', verticalAlign: 'middle', height: '35px' }}>
              <th className="px-4 py-2 text-left">Item Name</th>
              <th className="px-4 py-2 text-left">SKU</th>
              <th className="px-4 py-2 text-center">Qty</th>
              <th className="px-4 py-2 text-right">Unit Price</th>
              <th className="px-4 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {orderProducts.map((product, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="px-4 py-3">{product.name}</td>
                <td className="px-4 py-3">{product.sku}</td>
                <td className="px-4 py-3 text-center">{product.orderQty}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(product.unitPrice)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(product.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-1/3">
            <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
              <span className="font-semibold">Subtotal</span>
              <span>{formatCurrency(productsSubtotal)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
              <span className="font-semibold">Tax (15%)</span>
              <span>{formatCurrency(totalExciseTax)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
              <span className="font-semibold">Shipping</span>
              <span>{formatCurrency(shipping)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold bg-primary-light dark:bg-gray-900 text-black px-2 mt-2 items-center" style={{ backgroundColor: 'rgb(229, 237, 241)', color: '#000000', printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact', display: 'flex', alignItems: 'center', height: '35px' }}>
              <span>Order Total</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 px-6 py-4 flex items-center justify-between shadow-lg" style={{ zIndex: 40 }}>
        <button
          onClick={() => router.push("/orders")}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <div className="flex items-center gap-3">
          {submitError && (
            <div className="text-sm text-red-600 dark:text-red-400 max-w-md">
              {submitError}
            </div>
          )}

          {/* Action Buttons Logic */}
          {!["Approved", "Delivered", "Canceled"].includes(orderStatus) && (
            <>
              {/* Save Draft - Only visible in Draft mode */}
              {orderStatus === "Draft" && (
                <button
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Save Draft"}
                </button>
              )}

              {/* Submit Order - Visible in Draft AND Submitted modes */}
              {(orderStatus === "Draft" || orderStatus === "Submitted") && (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit Order"}
                </button>
              )}

              {/* Recall - Visible only in Submitted mode */}
              {orderStatus === "Submitted" && (
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to recall this order and set it back to Draft?")) {
                      setOrderStatus("Draft");
                      handleSaveDraft();
                    }
                  }}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                >
                  Recall
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add padding to prevent content from being hidden behind fixed footer */}
      <div className="h-20"></div>
      {/* Fixed Tooltip */}
      {
        hoveredTooltip && (
          <div
            role="tooltip"
            className="fixed z-50 w-150 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-xs text-gray-900 dark:text-gray-100 pointer-events-none"
            style={{
              left: hoveredTooltip.x,
              top: hoveredTooltip.y - 8, // 8px gap
              transform: "translateY(-100%)"
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-22 h-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-semibold leading-tight">{hoveredTooltip.product.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{hoveredTooltip.product.sku ?? "—"}</div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  <div className="text-gray-500">Manufacturer</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{hoveredTooltip.product.manufacturer ?? "—"}</div>
                  <div className="text-gray-500">Family</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{hoveredTooltip.product.productFamily ?? "—"}</div>
                  <div className="text-gray-500">Unit Price</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(hoveredTooltip.product.unitPrice)}</div>
                  <div className="text-gray-500">Available</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{formatNumber(hoveredTooltip.product.availableQty)}</div>
                  <div className="text-gray-500">MOQ</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{formatNumber(hoveredTooltip.product.moq)}</div>
                </div>
                {hoveredTooltip.product.description && (
                  <div className="mt-2 text-xs text-gray-700 dark:text-gray-300">
                    {hoveredTooltip.product.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }
    </Sidebar >
  );
}

interface FileData {
  Id: string;
  Title: string;
  FileType: string;
  FileExtension: string;
  FileSize: number;
  CreatedDate: string;
  CreatedBy: string;
  VersionData?: string; // Base64 content
  contentDocumentId?: string; // Document ID for deletion
}

function FilesTab({ orderId, accountId, contactId }: { orderId: string, accountId: string, contactId: string }) {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/salesforce/orders?action=files&accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}&orderId=${encodeURIComponent(orderId)}`);
      if (!res.ok) throw new Error("Failed to fetch files");
      const data = await res.json();
      setFiles(data);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [orderId, accountId, contactId]);

  const handleDownload = (file: FileData) => {
    if (!file.VersionData) {
      alert("File content not available");
      return;
    }
    // Convert Base64 to Blob
    const byteCharacters = atob(file.VersionData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/octet-stream" });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.Title}.${file.FileExtension}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleDelete = async (file: FileData) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    // Use ContentDocumentId (capital C) from Salesforce API response
    const contentDocumentId = (file as any).ContentDocumentId || file.contentDocumentId;
    try {
      const res = await fetch(`/api/salesforce/orders?orderId=${encodeURIComponent(orderId)}&contentDocumentId=${encodeURIComponent(contentDocumentId)}&accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete file");

      // Remove from list
      setFiles(prev => prev.filter(f => f.Id !== file.Id));
      setSelectedFileIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.Id);
        return newSet;
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Failed to delete file");
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedFileIds(new Set(files.map(f => f.Id)));
    } else {
      setSelectedFileIds(new Set());
    }
  };

  const handleSelectFile = (fileId: string) => {
    const newSet = new Set(selectedFileIds);
    if (newSet.has(fileId)) {
      newSet.delete(fileId);
    } else {
      newSet.add(fileId);
    }
    setSelectedFileIds(newSet);
  };

  const handleBulkDownload = () => {
    files.filter(f => selectedFileIds.has(f.Id)).forEach(file => {
      handleDownload(file);
    });
  };

  const handleBulkDelete = async () => {
    if (selectedFileIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedFileIds.size} file(s)?`)) return;

    // Get contentDocumentIds for selected files - use ContentDocumentId (capital C) from Salesforce API
    const selectedFiles = files.filter(f => selectedFileIds.has(f.Id));
    const contentDocumentIds = selectedFiles.map(f => (f as any).ContentDocumentId || f.contentDocumentId).join(',');

    try {
      const res = await fetch(`/api/salesforce/orders?orderId=${encodeURIComponent(orderId)}&contentDocumentId=${encodeURIComponent(contentDocumentIds)}&accountId=${encodeURIComponent(accountId)}&contactId=${encodeURIComponent(contactId)}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete files");

      // Remove deleted files from list
      setFiles(prev => prev.filter(f => !selectedFileIds.has(f.Id)));
      setSelectedFileIds(new Set());
      alert("Files deleted successfully");
    } catch (error) {
      console.error("Error deleting files:", error);
      alert("Failed to delete files");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Files ({files.length})</h3>
        <div className="flex gap-2">
          {selectedFileIds.size > 0 && (
            <>
              <button
                onClick={handleBulkDownload}
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
              >
                Download Selected ({selectedFileIds.size})
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Selected ({selectedFileIds.size})
              </button>
            </>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left w-10">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={files.length > 0 && files.every(f => selectedFileIds.has(f.Id))}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Size</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">Loading files...</td>
              </tr>
            ) : files.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No files found.</td>
              </tr>
            ) : (
              files.map(file => (
                <tr key={file.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedFileIds.has(file.Id)}
                      onChange={() => handleSelectFile(file.Id)}
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{file.Title}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{(file.FileSize / 1024).toFixed(2)} KB</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{file.FileExtension}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{file.CreatedDate}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleDownload(file)}
                        className="text-primary hover:text-primary-dark p-1"
                        title="Download"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(file)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
