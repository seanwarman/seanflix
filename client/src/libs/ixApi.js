import axios from 'axios';

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}

export default {
  get: async url => {
    let response;
    try {
      response = await axios({
        headers,
        method: 'get',
        url: '/ix' + url,
      });
    } catch (error) {
      console.log('There was an error in the get api method: ', error);
      return error;
    }
    return response.data.body;
  },
  create: async (url, data) => {
    let response;
    try {
      response = await axios({
        headers,
        method: 'post',
        url: '/ix' + url,
        data: {data}
      });
    } catch (error) {
      console.log('There was an error in the create api method: ', error);
      return error;
    }
    return response.data.body;
  },
  update: async (url, data) => {
    let response;
    try {
      response = await axios({
        headers,
        method: 'put',
        url: '/ix' + url,
        data: {data}
      });
    } catch (error) {
      console.log('There was an error in the update api method: ', error);
      return error;
    }
    return response.data.body;
  },
  del: async url => {
    let response;
    try {
      response = await axios({
        headers,
        method: 'delete',
        url: '/ix' + url,
      });
    } catch (error) {
      console.log('There was an error in the get api method: ', error);
      return error;
    }
    return response.data.body;
  },
}

// export default {
//   get: async(route) => {
//     console.log('route: ', route);
//     // let response;
//     // let error;
//     // try {
//     //   response = await fetch(route);
//     // } catch (err) {
//     //   error = err;
//     //   console.log(err);
//     // }
//     // if (error) return error;
//     // response = await response.json();
//     // return response.body;
//   },
//   post: async(route, data) => {
//     let response;
//     let error;
//     try {
//       response = await fetch(route, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ data })
//       });
//     } catch (err) {
//       error = err;
//       console.log(err);
//     }
//     if (error) return error;
//     response = await response.json();
//     return response.body;
//   }
// }


