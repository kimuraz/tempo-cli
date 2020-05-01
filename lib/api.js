const axios = require('axios');
const ora = require('ora');
const config = require('../config.json');

const loadingApi = msg =>
  ora({text: `[API LOADING] - ${msg}`, color: 'green'}).start();

const headers = {
  Authorization: `Bearer ${config.token}`,
  Accept: 'application/json',
};
const api = axios.create({
  baseURL: 'https://api.tempo.io/core/3/',
  headers,
});

const getWorklogs = async (params = null) => {
  const loading = loadingApi('getting worklogs');
  try {
    const res = await api.get('worklogs', {params});
    return res.data;
  } catch (err) {
    return {err};
  } finally {
    loading.stop();
  }
};

exports.getWorklogs = getWorklogs;
