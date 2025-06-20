import { API } from '../../../types/types';
import jest from 'jest';
import yargsParser from 'yargs-parser';

export default (api: API) => {
  api.registerCommand({
    name: 'jest',
    description: 'run jest test',
    fn: async (args: yargsParser.Arguments, config: any) => {
      await jest.run();
    },
  });
};
