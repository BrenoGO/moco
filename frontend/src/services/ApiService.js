// const api = 'https://my-money-controller-be.herokuapp.com/';
const api = 'http://localhost:3001/';

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
        if (resp.error) {
          throw new Error(resp.error);
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
