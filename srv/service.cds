using { gdpr_assistant as my } from '../db/schema.cds';

@path: '/service/gdpr_assistant'
service gdpr_assistantSrv {
  @odata.draft.enabled
  entity AICoreQueries as projection on my.AICoreQueries;

  function askGpt(question: String) returns { response: String };

}