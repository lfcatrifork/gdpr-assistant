using { gdpr_assistant as my } from '../db/schema.cds';

@path: '/service/gdpr_assistant'
@requires: 'authenticated-user'
service gdpr_assistantSrv {
  @odata.draft.enabled
  entity AICoreQueries as projection on my.AICoreQueries;
}