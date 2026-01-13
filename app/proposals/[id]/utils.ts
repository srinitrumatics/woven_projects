// Utility functions for Proposals Detail Page



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
