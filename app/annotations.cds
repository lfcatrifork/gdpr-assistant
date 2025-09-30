using { gdpr_assistantSrv } from '../srv/service.cds';

annotate gdpr_assistantSrv.AICoreQueries with @UI.HeaderInfo: { TypeName: 'AICoreQuery', TypeNamePlural: 'AICoreQueries', Title: { Value: queryText } };
annotate gdpr_assistantSrv.AICoreQueries with {
  ID @UI.Hidden @Common.Text: { $value: queryText, ![@UI.TextArrangement]: #TextOnly }
};
annotate gdpr_assistantSrv.AICoreQueries with @UI.Identification: [{ Value: queryText }];
annotate gdpr_assistantSrv.AICoreQueries with {
  queryText @title: 'Query Text';
  responseText @title: 'Response Text'
};

annotate gdpr_assistantSrv.AICoreQueries with @UI.LineItem: [
 { $Type: 'UI.DataField', Value: queryText },
 { $Type: 'UI.DataField', Value: responseText }
];

annotate gdpr_assistantSrv.AICoreQueries with @UI.FieldGroup #Main: {
  $Type: 'UI.FieldGroupType', Data: [
 { $Type: 'UI.DataField', Value: queryText },
 { $Type: 'UI.DataField', Value: responseText }
  ]
};

annotate gdpr_assistantSrv.AICoreQueries with @UI.Facets: [
  { $Type: 'UI.ReferenceFacet', ID: 'Main', Label: 'General Information', Target: '@UI.FieldGroup#Main' }
];

annotate gdpr_assistantSrv.AICoreQueries with @UI.SelectionFields: [
  queryText
];

