const apiUrl = process.env.REACT_APP_API_URL;
const api = apiUrl;

async function responseHandler(resp) {
  const json = await resp.json();
  if (resp.status === 500) {
    console.log(resp);
    console.log(json);
    console.log('500 Error!!');
    throw new Error('Unknown Server Error');
  }
  if (resp.status === 401) {
    console.log('not authorized!');
    throw json;
  }
  if (!SUCCESS_STATUSES.includes(resp.status)) {
    console.log('not accepted status!!');
    throw json;
  }
  return json;
}

const SUCCESS_STATUSES = [200, 201, 203, 204];
export const ApiService = {
  get(endpoint) {
    return fetch(`${api}${endpoint}`,
      {
        headers: {
          Authorization: `JWT ${localStorage.getItem('token')}`,
        },
      })
      .then(responseHandler);
  },
  post(endpoint, data) {
    return fetch(`${api}${endpoint}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${localStorage.getItem('token')}`,
        },
      })
      .then(responseHandler);
  },
  delete(endpoint, id) {
    return fetch(`${api}${endpoint}/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `JWT ${localStorage.getItem('token')}`,
        },
      })
      .then(responseHandler);
  },
  put(endpoint, id, data) {
    return fetch(`${api}${endpoint}/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${localStorage.getItem('token')}`,
        },
      })
      .then(responseHandler);
  },
};
