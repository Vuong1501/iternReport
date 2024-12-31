import axios from 'axios';
import CONFIG from '../../config';

export default async () => {
  let output;
  const host = CONFIG['CLOUDFLARE_HOST'];
  const version = CONFIG['CLOUDFLARE_VERSION'];
  const zoneIdentifier = CONFIG['CLOUDFLARE_ZONE'];
  const url = `${host}/client/${version}/zones/${zoneIdentifier}/dns_records`;

  await axios({
    method: 'get',
    url: url,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG['CLOUDFLARE_AUTHORIZATION']}`
    }
  })
    .then(function(response) {
      output = response.data;
    })
    .catch(function(error) {
      console.log('error: ', JSON.stringify(error.response));

      output = error.response;
    });

  return output;
};
