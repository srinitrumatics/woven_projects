// Script to reseed Algolia index with proper facet configuration
// Run this after updating the index settings

const fetch = require('node-fetch');

async function reseedAlgolia() {
    try {
        const response = await fetch('http://localhost:3000/api/algolia', {
            method: 'POST',
        });

        const data = await response.json();

        if (response.ok) {} else {
            console.error('❌ Error:', data.error);
            console.error('   Details:', data.details);
        }
    } catch (error) {
        console.error('❌ Failed to reseed:', error.message);
    }
}

reseedAlgolia();
