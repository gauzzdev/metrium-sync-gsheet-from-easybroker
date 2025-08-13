export const userMessages = {
  errors: {
    defaultError: "No se pudo procesar la solicitud. Por favor, inténtalo de nuevo más tarde.",
    missingEnv: "Faltan configuraciones primordiales. Por favor, contacta al administrador.",
    spreadsheetRequired: "El ID de la hoja de cálculo es requerido.",
    invalidStatus: (validStatuses: string[]) => `Estatus inválido. Los estatus válidos son: ${validStatuses.join(', ')}.`,
    invalidPropertyType: (validTypes: string[]) => `Tipo de propiedad inválido. Los tipos válidos son: ${validTypes.join(', ')}.`,
    queryTimeout: (pages: number) => `La consulta arrojó ${pages} páginas y la acción tardará demasiado, superando el límite de 15 minutos de ejecución que tiene la herramienta. Intenta usar filtros más específicos para reducir la cantidad de propiedades.`,
  },
  success: {
    propertiesAdded: (count: number, statuses: string[], propertyTypes: string[], title: string, totalRows: number) => {
      const statusText = `estatus: ${statuses.join(', ')}`;
      const typeText = propertyTypes.length > 0 ? ` | tipos: ${propertyTypes.join(', ')}` : ' | todos los tipos';
      return `✅ Todas las propiedades agregadas exitosamente!\n📊 Propiedades añadidas: ${count} (${statusText}${typeText})\n📋 Feed: ${title}\n📝 Filas totales en el sheet: ${totalRows}`;
    },
  },
};

export const devMessages = {
  logs: {
    fetchingProperties: (statuses: string[], propertyTypes: string[]) => {
      const statusText = `statuses: ${statuses.join(', ')}`;
      const typeText = propertyTypes.length > 0 ? ` | types: ${propertyTypes.join(', ')}` : ' | all types';
      return `Fetching all EasyBroker properties with ${statusText}${typeText}...`;
    },
    propertiesFound: (count: number) => `Found ${count} properties`,
    fetchingDetails: "Fetching details for each property...",
    formattingData: "Formatting data for Meta Catalog Feed...",
    appendingData: "Appending data to existing list...",
    pageProcessed: (page: number, count: number) => `Page ${page} processed: ${count} properties`,
    allPagesProcessed: (totalPages: number, totalProperties: number) => `All ${totalPages} pages processed. Total properties fetched: ${totalProperties}`,
  },
  errors: {
    fetchingPage: (page: number) => `Error fetching page ${page}:`,
    fetchingProperty: (publicId: string) => `Error fetching property ${publicId}:`,
    loadingHeaders: "Could not load headers, setting new ones:",
    queryTimeout: (pages: number) => userMessages.errors.queryTimeout(pages),
  },
};


export const errorMessages = userMessages.errors;
