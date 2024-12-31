import axios from 'axios';
import CONFIG from '../../config';

export default async ({ domain }) => {
  let output;

  const url = CONFIG['WEBSHOP_HOST_HAPROXY_RELOAD'];
  const token = CONFIG['WEBSHOP_TOKEN_HAPROXY_RELOAD'];

  await axios({
    method: 'post',
    url: url,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
    data: {
      domain
    }
  }).then(function(response) {
    output = response.data;
  });

  return output;
};
