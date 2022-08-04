import axios from 'axios';
import Tickspot from '#src/index';
import responseFactory from '#test/v2/factories/responseFactory';
import credentials from '#test/v2/fixture/credentials';
import successfulResponseData from '#test/v2/fixture/entries/createEntryFixture';
import authenticationErrorTests from '#test/v2/shared/authentication';
import {
  badResponseCallbackTests,
  validResponseCallbackTests,
} from '#test/v2/shared/responseCallback';
import wrongParamsTests from '#test/v2/shared/wrongParams';

jest.mock('axios');
const tickspot = Tickspot.init({ apiVersion: 2, ...credentials });
const URL = `${tickspot.baseURL}/entries.json`;

describe('#create', () => {
  const entryData = {
    date: '2021-11-08',
    hours: 2,
    notes: 'Issue',
    taskId: 14356973,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when API call is successful', () => {
    const requestResponse = responseFactory({
      requestData: entryData,
      responseType: 'created',
      responseData: successfulResponseData,
      URL,
    });

    beforeEach(() => {
      axios.post.mockResolvedValueOnce(requestResponse);
    });

    it('should return the tick data entry', async () => {
      const response = await tickspot.entries.create(entryData);

      expect(response).toBe(requestResponse.data);
    });

    it('should create the tick entry', async () => {
      const response = await tickspot.entries.create(entryData);

      expect(response.data.date).toBe(entryData.date);
      expect(response.data.notes).toBe(entryData.notes);
    });
  });

  authenticationErrorTests({
    requestToExecute: async () => {
      await tickspot.entries.create(entryData);
    },
    URL,
    method: 'post',
  });

  badResponseCallbackTests({
    requestToExecute: async () => {
      await tickspot.entries.create(entryData, {});
    },
    method: 'post',
  });

  validResponseCallbackTests({
    requestToExecute: async () => {
      const dataCallback = jest
        .fn()
        .mockImplementation((data) => ({ newStructure: { ...data } }));
      const response = await tickspot.entries.create(entryData, dataCallback);
      return [response, dataCallback];
    },
    responseData: successfulResponseData,
    method: 'post',
    URL,
  });

  wrongParamsTests({
    requestToExecute: async (requestParams) => {
      await tickspot.entries.create(requestParams);
    },
    URL,
    method: 'post',
    requestData: entryData,
    paramsList: ['hours', 'taskId'],
  });
});
