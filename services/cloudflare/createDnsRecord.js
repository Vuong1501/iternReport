import axios from 'axios';
import CONFIG from '../../config';

export default async ({ name, type, content, ttl, priority, proxied }) => {
  let output;

  name = name || CONFIG['WEBSHOP_HOST'];
  type = type || CONFIG['WEBSHOP_TYPE_RECORD'];
  ttl = ttl || Number(CONFIG['WEBSHOP_TTL']);
  priority = priority || Number(CONFIG['WEBSHOP_PRIORITY']);
  proxied = proxied || Boolean(CONFIG['WEBSHOP_PROXIED']);
  content = content || CONFIG['WEBSHOP_IP'];
  const host = CONFIG['CLOUDFLARE_HOST'];
  const version = CONFIG['CLOUDFLARE_VERSION'];
  const zoneIdentifier = CONFIG['CLOUDFLARE_ZONE'];
  const url = `${host}/client/${version}/zones/${zoneIdentifier}/dns_records`;

  let Authorization = `Bearer ${CONFIG['CLOUDFLARE_AUTHORIZATION']}`;

  let datapost = {
    type,
    name,
    content,
    ttl,
    priority,
    proxied
  };

  console.log('datapost', datapost);
  console.log('Authorization', Authorization);
  await axios({
    method: 'post',
    url: url,
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Email': CONFIG['CLOUDFLARE_X_AUTH_EMAIL'],
      'X-Auth-Key': CONFIG['CLOUDFLARE_X_AUTH_KEY'],
      Authorization: Authorization
    },
    data: datapost
  })
    .then(function(response) {
      output = response.data;
    })
    .catch(function(error) {
      // console.log('error: ', JSON.stringify(error.response));
      console.log('error', error);
      //output = error.response;
    });

  return output;
};
