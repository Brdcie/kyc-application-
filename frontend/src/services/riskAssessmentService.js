// services/riskAssessmentService.js
export const riskAssessmentService = {
    checkListMembership: (countryName) => {
      if (!countryName) return {
        gafiBlack: false,
        gafiGrey: false,
        sanctions: false
      };
  
      // Liste noire du GAFI
      const gafiBlackList = ['Iran', 'North Korea','Myanmar'];
      
      // Liste grise du GAFI
      const gafiGreyList = [
        'Algeria', 'Angola', 'Bulgaria','Burkina Faso', 'Cameroun',
        'Ivory Coast','Croatia', 'Haiti', 'Kenya', 'Liban',
        'Mali', 'Monaco', 'Mozambique', 'Namibie','Nigeria',
        'Philippines', 'République Démocratique du Congo', 'South Sudan', 'Syria',
        'Tanzania', 'Venezuela', 'Vietnam', 'Yemen'
      ];
  
      // Liste des sanctions
      const sanctionsList = [
        'Iran', 'North Korea', 'Syria', 'Venezuela',
        'Yemen', 'Zimbabwe','Russia'
      ];
  
      return {
        gafiBlack: gafiBlackList.includes(countryName),
        gafiGrey: gafiGreyList.includes(countryName),
        sanctions: sanctionsList.includes(countryName)
      };
    }
  };