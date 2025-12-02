"use client";

import { use, useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layouts/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { formatCurrency, formatNumber } from "@/lib/utils/formatting";
import { Product } from "@/app/orders/types";
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
  const [viewMode, setViewMode] = useState<"myOrder" | "catalog">("myOrder"); // Default to My Order table
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

  const [formData, setFormData] = useState({
    // Primary Details
    shipTo: "",
    shippingAddress: "",
    billTo: "",
    billingAddress: "",
    purchaseOrder: "",
    requestedDeliveryDate: "",

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

  const SF_ACCOUNT_ID = process.env.NEXT_PUBLIC_SALESFORCE_ACCOUNT_ID ?? "001WL00000bapRiYAI"; // override with real value
  const LOGGED_IN_CONTACT_ID = "abc" //TODO: Get this from session / auth context

  useEffect(() => {
    let mounted = true;
    async function loadLocations() {
      try {
        setLocationsLoading(true);
        // pass accountId, role and contactId as needed
        const res = await fetch(`/api/salesforce/orders?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(LOGGED_IN_CONTACT_ID)}&action=locations`);
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
        const res = await fetch(`/api/salesforce/orders?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(LOGGED_IN_CONTACT_ID)}&action=contacts`);
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
            moq: 1, // Not in response, default to 1
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
            const mappedProducts: Product[] = order.CustomerOrderLines.map((item: OrderItem) => ({
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
              orderLineId: item.Id
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

  const handleAddProduct = (product: Product) => {
    // Always add as a new line item, even if the same product exists
    // Generate a unique key by combining product id with timestamp
    const uniqueLineItem = {
      ...product,
      orderQty: 1,
      subtotal: product.unitPrice,
      // Add a unique identifier for this line item
      lineItemKey: `${product.id}-${Date.now()}-${Math.random()}`
    };
    setOrderProducts([...orderProducts, uniqueLineItem]);
  };

  const handleRemoveProduct = (lineItemKey: string) => {
    setOrderProducts(orderProducts.filter(p => p.lineItemKey !== lineItemKey));
  };

  const handleQuantityChange = (lineItemKey: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    setOrderProducts(orderProducts.map(p =>
      p.lineItemKey === lineItemKey ? { ...p, orderQty: newQuantity, subtotal: newQuantity * p.unitPrice } : p
    ));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Order submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
          Customer_Order_Line_Notes__c: "",
          Product_Name__c: product.id,
          Customer_Order__c: id,
          Order_Qty__c: product.orderQty,
          MOQ__c: product.moq,
          Unit_Price__c: product.unitPrice,
          Inventory_Account__c: SF_ACCOUNT_ID,
          IsTaxable__c: true
        })),
        accountId: SF_ACCOUNT_ID,
        contactId: LOGGED_IN_CONTACT_ID, // Use actual Contact ID
        isDraft: isDraft
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
                  <path d="M21 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7" />
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
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white hover:border-primary dark:hover:bg-primary dark:hover:text-white dark:hover:border-primary transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
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
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded px-2 py-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <svg className="w-3 h-3 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 flex-shrink-0 ml-2"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
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

          {/* Products Catalog Table */}
          {viewMode === "catalog" && (
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
                  {paginatedCatalogProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        {searchQuery ? "No products found matching your search." : "All products have been added to your order."}
                      </td>
                    </tr>
                  ) : (
                    paginatedCatalogProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                          <div className="text-xs font-mono text-gray-500 dark:text-gray-400">{product.sku}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{product.manufacturer}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary">
                            {product.productFamily}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-semibold">
                          {formatCurrency(product.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">
                          <div>{formatNumber(product.availableQty)}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">(MOQ {formatNumber(product.moq)})</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-500 dark:text-gray-400">
                          -
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleAddProduct(product)}
                            className="p-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
                            title="Add to Order"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
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
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(product.lineItemKey!, product.orderQty - 1)}
                              className="w-8 h-8 flex items-center justify-center bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={product.orderQty}
                              onChange={(e) => handleQuantityChange(product.lineItemKey!, parseInt(e.target.value) || 0)}
                              className="w-20 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-center text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                              min="0"
                            />
                            <button
                              onClick={() => handleQuantityChange(product.lineItemKey!, product.orderQty + 1)}
                              className="w-8 h-8 flex items-center justify-center bg-primary-light dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              +
                            </button>
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
