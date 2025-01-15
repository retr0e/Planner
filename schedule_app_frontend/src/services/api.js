// eslint-disable-next-line prettier/prettier
import axios from 'axios';

const apiClient = axios.create({
  // eslint-disable-next-line prettier/prettier
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

export default apiClient;
