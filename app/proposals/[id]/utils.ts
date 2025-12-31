// Utility functions for Proposals Detail Page

export const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
};

export const formatAddress = (addressConfig: any): string => {
    if (!addressConfig) return '';
    if (typeof addressConfig === 'string') return addressConfig;

    const parts = [
        addressConfig.street,
        addressConfig.city,
        addressConfig.stateCode || addressConfig.state,
        addressConfig.postalCode,
        addressConfig.countryCode || addressConfig.country
    ].filter(Boolean);

    return parts.join(', ');
};
