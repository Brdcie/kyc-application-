const axios = require('axios');

const testId = "NK-28ZcFDmHBF9L3WkDBBwH6H";

async function getEntityWithOwnership(entityId) {
  try {
    const response = await axios.get(`https://api.opensanctions.org/entities/${entityId}`, {
      headers: {
        'Authorization': `ApiKey ${process.env.OPENSANCTIONS_API_KEY}`
      }
    });

    const uboInfo = {
      totalIdentifiedOwnership: 0,
      directOwners: [],
      subsidiaries: [],  // Ajout des filiales
      beneficialOwners: []
    };

    const props = response.data.properties || {};

    // Propriétaires directs
    if (props.ownershipAsset) {
      props.ownershipAsset.forEach(ownership => {
        if (ownership.properties?.owner) {
          const owner = ownership.properties.owner[0];
          uboInfo.directOwners.push({
            id: owner.id,
            name: owner.caption,
            stake: 100,
            startDate: ownership.properties?.startDate?.[0] || null,
            status: ownership.properties?.status?.[0] || 'active'
          });
        }
      });
    }

    // Filiales
    if (props.ownershipOwner) {
      props.ownershipOwner.forEach(ownership => {
        if (ownership.properties?.asset) {
          const asset = ownership.properties.asset[0];
          uboInfo.subsidiaries.push({
            id: asset.id,
            name: asset.caption,
            percentage: ownership.properties.percentage ? parseFloat(ownership.properties.percentage[0]) : null,
            startDate: ownership.properties.startDate?.[0] || null,
            status: asset.properties?.status?.[0] || 'active',
            jurisdiction: asset.properties?.jurisdiction?.[0]
          });
        }
      });
    }

    // Calcul du total
    uboInfo.totalIdentifiedOwnership = uboInfo.directOwners.reduce(
      (sum, owner) => sum + (owner.stake || 0), 0
    );

    console.log('\nEnhanced UBO Information:');
    console.log(JSON.stringify(uboInfo, null, 2));

    return uboInfo;

  } catch (error) {
    console.error('Error details:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
    return null;
  }
}

getEntityWithOwnership(testId);