namespace gdpr_assistant;
using { cuid } from '@sap/cds/common';

@assert.unique: { queryText: [queryText] }
entity AICoreQueries : cuid {
  queryText: String(500) @mandatory;
  responseText: String(500);
}

