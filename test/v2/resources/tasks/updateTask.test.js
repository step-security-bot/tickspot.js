import axios from 'axios';
import Tickspot from '#src/index';
import credentials from '#test/v2/fixture/credentials';
import successfulResponseData from '#test/v2/fixture/tasks/updateTaskFixture';
import responseFactory from '#test/v2/factories/responseFactory';
import authenticationErrorTests from '#test/v2/shared/authentication';
import {
  badResponseCallbackTests,
  validResponseCallbackTests,
} from '#test/v2/shared/responseCallback';
import wrongParamsTests from '#test/v2/shared/wrongParams';

jest.mock('axios');
const tickspot = Tickspot.init({ apiVersion: 2, ...credentials });
const URL = `${tickspot.baseURL}/tasks/123456.json`;

describe('#update', () => {
  const params = {
    taskId: 123456,
    budget: 10,
  };

  beforeEach(() => {
    axios.put.mockClear();
  });

  describe('when API call is successful', () => {
    const requestResponse = responseFactory({
      requestData: {},
      responseType: 'successful',
      responseData: successfulResponseData,
      URL,
    });

    beforeEach(() => {
      axios.put.mockResolvedValueOnce(requestResponse);
    });

    it('should return the task updated data', async () => {
      const response = await tickspot.tasks.update(params);

      expect(axios.put).toHaveBeenCalledTimes(1);
      expect(axios.put).toHaveBeenCalledWith(
        URL,
        { budget: 10 },
        { headers: tickspot.tasks.DEFAULT_HEADERS },
      );
      expect(response).toEqual(requestResponse.data);
    });
  });

  describe('when invalid parameters are sent to the update method', () => {
    it('should throw an error specifying that the budget parameter is invalid', async () => {
      await expect(tickspot.tasks.update({ taskId: 123456 }))
        .rejects.toThrow('budget field cannot be undefined');

      expect(axios.put).not.toHaveBeenCalled();
    });
  });

  authenticationErrorTests({
    requestToExecute: async () => {
      await tickspot.tasks.update(params);
    },
    URL,
    method: 'put',
  });

  badResponseCallbackTests({
    requestToExecute: async () => {
      await tickspot.tasks.update(params, {});
    },
    method: 'put',
  });

  validResponseCallbackTests({
    method: 'put',
    requestToExecute: async () => {
      const dataCallback = jest
        .fn()
        .mockImplementation((data) => ({ newStructure: { ...data } }));
      const response = await tickspot.tasks.update(params, dataCallback);
      return [response, dataCallback];
    },
    responseData: successfulResponseData,
    URL,
  });

  wrongParamsTests({
    requestToExecute: async (requestParams) => {
      await tickspot.tasks.update(requestParams);
    },
    URL,
    requestData: params,
    paramsList: ['taskId'],
    method: 'put',
  });
});
