export default {
  get: async(route) => {
    let response;
    let error;
    try {
      response = await fetch(route);
    } catch (err) {
      error = err;
      console.log(err);
    }
    if (error) return error;
    response = await response.json();
    return response.body;
  },
  post: async(route, data) => {
    let response;
    let error;
    try {
      response = await fetch(route, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data })
      });
    } catch (err) {
      error = err;
      console.log(err);
    }
    if (error) return error;
    response = await response.json();
    return response.body;
  }
}
