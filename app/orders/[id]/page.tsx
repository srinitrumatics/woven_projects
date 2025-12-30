"use client";

import { use, useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layouts/Sidebar";
import Pagination from "@/components/ui/Pagination";
import { formatCurrency, formatNumber } from "@/lib/utils/formatting";
import { Product } from "@/app/orders/types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import OrderHeader from "./components/OrderHeader";
import BillingInfo from "./components/BillingInfo";
import ShippingInfo from "./components/ShippingInfo";
import ShipToContact from "./components/ShipToContact";
import DeliveryOptions from "./components/DeliveryOptions";
import OrderTotal from "./components/OrderTotal";
import FilesTab from "./components/FilesTab";
import ProductCatalog from "./components/ProductCatalog";
import MyOrderTable from "./components/MyOrderTable";
import PDFTemplate from "./components/PDFTemplate";
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
    priceBook: "",
    dropShip: false,
    liftGateRequired: false,
    insideDelivery: false,
    deliveryNotes: "",
    site: "",
    shippingMethod: "",
    incoterms: "",

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
        //console.log('locations', data);
        if (mounted) {
          // Handle the actual API response structure
          let locations: AuthorizedLocation[] = [];
          let paymentTerms = '';
          let priceBook = '';

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

            //console.log('Unique locations count:', uniqueLocations.length);
            //console.log('Location names:', uniqueLocations.map(loc => `${loc.Id}: ${loc.Name}`));

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
          // Set price book if available (using Payment_Terms__c as placeholder or new field if available)
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

        const res = await fetch(`/api/salesforce/orders?accountId=${encodeURIComponent(accountId)}&orderId=${encodeURIComponent(orderId)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}`);

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
          // if (order.CustomerOrderLines) {
          //   const mappedProducts: Product[] = order.CustomerOrderLines.map((item: OrderItem, index: number) => ({
          //     id: item.Product_Name__c || item.Id, // Use Product_Name__c as product ID if available
          //     name: item.ProductName || "Unknown Product",
          //     sku: item.Name || "", // Using Name as SKU/Line ID for now
          //     description: item.Product_Description__c || "",
          //     unitPrice: item.Unit_Price__c,
          //     listPrice: item.Unit_Price__c, // Assuming list price same as unit price for now
          //     brand: "", // Not in API response
          //     manufacturer: item.Manufacturer_Name__c || "",
          //     productFamily: item.ProductFamily || "", // Not in API response
          //     availableQty: 999,
          //     moq: item.MOQ__c || 1,
          //     orderQty: item.Order_Qty__c,
          //     subtotal: item.Total_Price__c,
          //     // Store the original order line ID for updates
          //     orderLineId: item.Id,
          //     // Add unique lineItemKey for proper tracking and deletion
          //     lineItemKey: `${item.Id}-${Date.now()}-${index}-${Math.random()}`
          //   }));
          //   console.log("Mapped products:", mappedProducts);
          //   setOrderProducts(mappedProducts);
          // }

          // Update Form Data with Order Details
          setFormData(prev => ({
            ...prev,
            purchaseOrder: order.Customer_PO__c || prev.purchaseOrder,
            requestedDeliveryDate: order.Request_Date__c || prev.requestedDeliveryDate,
            orderNotes: order.Customer_Order_Notes__c || prev.orderNotes,
            priceBook: order.Assigned_Price_Book_Name || prev.priceBook,
            dropShip: order.Drop_Ship__c || prev.dropShip,
            // Set Bill To and Ship To from order data
            billTo: order.Authorized_Bill_To_Location__c || prev.billTo,
            site: order.Site_Name || prev.site,
            shippingMethod: order.Shipping_Method__c || prev.shippingMethod,
            incoterms: order.Incoterms__c || prev.incoterms,
            // We set shipTo via handleLocationSelect when initialOrderShipToId triggers, 
            // but we can also set it here as a fallback or initial value
            shipTo: order.Authorized_Ship_To_Location__c || prev.shipTo,

            // formatted address from API response objects if available
            shippingAddress: order.Authorized_Ship_To_Location__Address ?
              `${order.Authorized_Ship_To_Location__Address.street}, ${order.Authorized_Ship_To_Location__Address.city}, ${order.Authorized_Ship_To_Location__Address.state} ${order.Authorized_Ship_To_Location__Address.postalCode}`
              : prev.shippingAddress,

            billingAddress: order.Authorized_Bill_To_Location_Address ?
              `${order.Authorized_Bill_To_Location_Address.street}, ${order.Authorized_Bill_To_Location_Address.city}, ${order.Authorized_Bill_To_Location_Address.state} ${order.Authorized_Bill_To_Location_Address.postalCode}`
              : prev.billingAddress,

            // Contact details
            locationContact: order.Ship_to_Contact_Name || prev.locationContact,
            contactPhone: order.Ship_to_Contact_Phone || prev.contactPhone,
            contactEmail: order.Ship_to_Contact_Email || prev.contactEmail,

            billingContact: order.Bill_to_Contact_Name || prev.billingContact,
            billingPhone: order.Ship_to_Contact_Phone || prev.billingPhone, // Fallback to ship contact phone if bill contact phone missing in API
            billingEmail: order.Ship_to_Contact_Email || prev.billingEmail, // Fallback to ship contact email
            billToAccountName: order.Bill_to_Account_Name || "",
            shipToAccountName: order.Ship_to_Account_Name || "",
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
  const shipping = productsSubtotal > 0 ? (orderData?.Total_Shipping_Charges__c ?? 0) : 0;
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
      <OrderHeader id={id} orderStatus={orderStatus} />

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Left Column - Client Information (70%) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BillingInfo
              formData={formData}
              setFormData={setFormData}
              shipLocations={shipLocations}
              handleBillToChange={handleBillToChange}
            />
            <ShippingInfo
              formData={formData}
              setFormData={setFormData}
              shipLocations={shipLocations}
              locationsLoading={locationsLoading}
              handleLocationSelect={handleLocationSelect}
            />
          </div>
          <ShipToContact
            shipContacts={shipContacts}
            contactsLoading={contactsLoading}
            selectedContactId={selectedContactId}
            handleContactSelect={handleContactSelect}
            formData={formData}
            setFormData={setFormData}
          />
          <DeliveryOptions formData={formData} setFormData={setFormData} />
        </div>

        {/* Right Column - Order Total (30%) */}
        <div className="lg:col-span-3 flex flex-col">
          <OrderTotal
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
          />
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
              searchQuery={searchQuery}
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
              searchQuery={searchQuery}
              setHoveredTooltip={setTooltipState}
              accountId={SF_ACCOUNT_ID}
              contactId={SF_CONTACT_ID}
              setOrderProducts={setOrderProducts}
            />
          )}
        </div>
      </div>

      {/* Hidden PDF Template */}
      <PDFTemplate
        id={id}
        orderStatus={orderStatus}
        formData={formData}
        shipLocations={shipLocations}
        orderProducts={orderProducts}
        productsSubtotal={productsSubtotal}
        totalExciseTax={totalExciseTax}
        shipping={shipping}
        grandTotal={grandTotal}
      />

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
            <div className="w-22 h-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-semibold leading-tight">{tooltipState.product.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{tooltipState.product.sku ?? "—"}</div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <div className="text-gray-500">Manufacturer</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{tooltipState.product.manufacturer ?? "—"}</div>
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

    </Sidebar>
  );
}
