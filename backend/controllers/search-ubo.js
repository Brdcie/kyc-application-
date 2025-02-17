const axios = require('axios');

async function searchUBOEntities() {
  try {
    const response = await axios.get('https://api.opensanctions.org/search/default', {
      params: {
        q: "*",
        schema: "Ownership",  // Recherche spécifiquement les entités de type Ownership
        limit: 10
      },
      headers: {
        'Authorization': `ApiKey ${process.env.OPENSANCTIONS_API_KEY}`
      }
    });

    console.log('=== Ownership Entities ===');
    if (response.data && response.data.results) {
      response.data.results.forEach(entity => {
        console.log('\nOwnership Entity:', entity.id);
        const props = entity.properties || {};
        
        // Afficher les détails de propriété
        if (props.owner && props.asset) {
          console.log('Owner:', props.owner[0]);
          console.log('Asset:', props.asset[0]);
          console.log('Start Date:', props.startDate ? props.startDate[0] : 'Not specified');
          console.log('Percentage:', props.percentage ? props.percentage[0] : 'Not specified');
        }
        console.log('------------------------');
      });
    }

  } catch (error) {
    console.error('Error details:', error.response?.data || error.message);
  }
}

searchUBOEntities();