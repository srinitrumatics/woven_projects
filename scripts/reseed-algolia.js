// Script to reseed Algolia index with proper facet configuration
// Run this after updating the index settings

const fetch = require('node-fetch');

async function reseedAlgolia() {
    console.log('🔄 Reseeding Algolia index with facet configuration...');

    try {
        const response = await fetch('http://localhost:3000/api/algolia', {
            method: 'POST',
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Success!', data);
            console.log(`   - ${data.count} products indexed`);
            console.log(`   - Task ID: ${data.taskID}`);
            console.log('\n📋 Index configured with:');
            console.log('   - Category faceting (searchable)');
            console.log('   - Genre faceting (searchable)');
            console.log('   - Price range filtering');
            console.log('\n🎉 Filters should now work properly!');
        } else {
            console.error('❌ Error:', data.error);
            console.error('   Details:', data.details);
        }
    } catch (error) {
        console.error('❌ Failed to reseed:', error.message);
        console.log('\n💡 Make sure your Next.js dev server is running:');
        console.log('   npm run dev');
    }
}

reseedAlgolia();
