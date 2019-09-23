const api = 'http://192.168.1.100:3001/';

export const ApiService = {
  get(endpoint) {
    return fetch(`${api}${endpoint}`,
      {
        headers: {
          Authorization: `JWT ${localStorage.getItem('token')}`
        }
      })
      .then((resp) => {
        if (resp.status === 401) {
          throw new Error('Not authorized.');
        }
        return resp.json();
      })
      .catch(error => ({ error }));
  },
  post(endpoint, data) {
    return fetch(`${api}${endpoint}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${localStorage.getItem('token')}`
        }
      })
      .then((resp) => {
        if (resp.status === 401) {
          throw new Error('Not authorized.');
        }
        return resp.json();
      })
      .catch(error => ({ error }));
  },
  delete(endpoint, id) {
    return fetch(`${api}${endpoint}/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `JWT ${localStorage.getItem('token')}`
        }
      })
      .then((resp) => {
        if (resp.status === 401) {
          throw new Error('Not authorized.');
        }
        return resp.json();
      })
      .catch(error => ({ error }));
  },
  put(endpoint, id, data) {
    return fetch(`${api}${endpoint}/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${localStorage.getItem('token')}`
        }
      })
      .then((resp) => {
        if (resp.status === 401) {
          throw new Error('Not authorized.');
        }
        return resp.json();
      })
      .catch(error => ({ error }));
  },
};
