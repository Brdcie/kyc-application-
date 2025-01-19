// backend/services/uboService.js

const extractUBOInformation = (entity) => {
  const uboInfo = {
    directOwners: [],
    beneficialOwners: [],
    ownershipChain: [],
    totalIdentifiedOwnership: 0
  };

  if (!entity.properties) return uboInfo;

  // Extraire les propriétaires directs
  if (entity.properties.ownershipStakes) {
    entity.properties.ownershipStakes.forEach(stake => {
      const owner = {
        id: stake.owner?.id,
        name: stake.owner?.caption || 'Unknown Owner',
        stake: parseFloat(stake.percentage) || 0,
        startDate: stake.start_date,
        endDate: stake.end_date,
        status: stake.status,
        directOwner: true
      };
      uboInfo.directOwners.push(owner);
      uboInfo.totalIdentifiedOwnership += owner.stake;
    });
  }

  // Extraire les bénéficiaires effectifs
  if (entity.properties.beneficialOwners) {
    entity.properties.beneficialOwners.forEach(bo => {
      const beneficialOwner = {
        id: bo.id,
        name: bo.caption || 'Unknown Beneficial Owner',
        stake: parseFloat(bo.stake) || 0,
        controlType: bo.control_type || 'Unknown',
        verificationDate: bo.verification_date,
        isPEP: bo.properties?.topics?.includes('role.pep') || false
      };
      uboInfo.beneficialOwners.push(beneficialOwner);
    });
  }

  // Construction de la chaîne de propriété
  buildOwnershipChain(entity, uboInfo.ownershipChain, new Set());

  return uboInfo;
};

const buildOwnershipChain = (entity, chain, visited, level = 0) => {
  if (!entity || visited.has(entity.id) || level > 5) return;
  
  visited.add(entity.id);
  
  const nodeInfo = {
    id: entity.id,
    name: entity.caption,
    level,
    children: [],
    ownershipDetails: []
  };

  if (entity.properties?.ownershipStakes) {
    entity.properties.ownershipStakes.forEach(stake => {
      if (stake.owner && !visited.has(stake.owner.id)) {
        nodeInfo.ownershipDetails.push({
          id: stake.owner.id,
          percentage: parseFloat(stake.percentage) || 0,
          type: stake.type || 'direct'
        });
        buildOwnershipChain(stake.owner, nodeInfo.children, visited, level + 1);
      }
    });
  }

  chain.push(nodeInfo);
};