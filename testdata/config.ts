import { StaticMetadataConfigInput } from '../src/interfaces/Metadata';

export const metadataConfig: StaticMetadataConfigInput = {
  version: 1,
  lifecycleStage: 'production',
  owner: 'MyCompany',
  hostPlatform: 'aws',
  domain: 'CustomerAcquisition',
  system: 'ShowroomActivities',
  service: 'UserSignUp',
  team: 'MyDemoTeam',
  tags: [''],
  dataSensitivity: 'public'
};
