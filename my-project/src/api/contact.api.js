import api from '../api.js';

export const contactApi = {
  sendMessage: async (contactData) => {
    const response = await api.post('/contact/send', contactData);
    return response.data;
  },
};

export default contactApi;
