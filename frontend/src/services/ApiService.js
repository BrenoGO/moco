const apiUrl = process.env.REACT_APP_API_URL;
const api = apiUrl;

export const ApiService = {
  get(endpoint) {
    return fetch(`${api}${endpoint}`,
      {
        headers: {
          Authorization: `JWT ${localStorage.getItem('token')}`,
        },
      })
      .then((resp) => {
        if (resp.status === 401) {
          console.log('not authorized!');
          throw resp;
        }
        if (resp.error) {
          throw resp;
        }
        return resp.json();
      });
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
      .then(async (resp) => {
        const json = await resp.json();
        if (resp.status === 500) {
          console.log('500 Error!!');
          console.log(resp);
          console.log(json);
          throw new Error('Unknown Server Error');
        }
        if (resp.status === 401) {
          console.log('not authorized!');
          throw resp;
        }
        return json;
      });
  },
  delete(endpoint, id) {
    return fetch(`${api}${endpoint}/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `JWT ${localStorage.getItem('token')}`,
        },
      })
      .then((resp) => {
        if (resp.status === 401) {
          console.log('not authorized!');
          throw resp;
        }
        return resp.json();
      });
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
      .then((resp) => {
        if (resp.status === 401) {
          console.log('not authorized!');
          throw resp;
        }
        if (resp.error) {
          throw resp;
        }
        return resp.json();
      });
  },
};
