export const userMessages = {
  errors: {
    defaultError: "No se pudo procesar la solicitud. Por favor, inténtalo de nuevo más tarde.",
    missingEnv: "Faltan configuraciones primordiales. Por favor, contacta al administrador.",
    spreadsheetRequired: "El ID de la hoja de cálculo es requerido.",
    pagesRequired: "Las páginas de inicio y fin son requeridas.",
    invalidPageRange: "Rango de páginas inválido. Máximo 10 páginas y la página final debe ser >= página inicial.",
  },
  success: {
    propertiesAdded: (count: number, pageRange: string, title: string, totalRows: number) => 
      `✅ Propiedades agregadas exitosamente!\n📊 Propiedades añadidas: ${count} (páginas ${pageRange})\n📋 Feed: ${title}\n📝 Filas totales en el sheet: ${totalRows}`,
  },
};

export const devMessages = {
  logs: {
    fetchingProperties: (startPage: number, endPage: number) => `Fetching EasyBroker properties (pages ${startPage}-${endPage})...`,
    propertiesFound: (count: number) => `Found ${count} properties`,
    fetchingDetails: "Fetching details for each property...",
    formattingData: "Formatting data for Meta Catalog Feed...",
    appendingData: "Appending data to existing list...",
    pageProcessed: (page: number, count: number) => `Page ${page} processed: ${count} properties`,
    noMorePages: (page: number) => `No more pages after page ${page}`,
  },
  errors: {
    fetchingPage: (page: number) => `Error fetching page ${page}:`,
    fetchingProperty: (publicId: string) => `Error fetching property ${publicId}:`,
    loadingHeaders: "Could not load headers, setting new ones:",
  },
};


export const errorMessages = userMessages.errors;
