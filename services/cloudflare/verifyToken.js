import axios from 'axios';
import CONFIG from '../../config'

export default async ()=> {
    const version = CONFIG.FB_GRAPH_VERSION;
    const host = CONFIG['CLOUDFLARE_HOST'];
    const version = CONFIG['CLOUDFLARE_VERSION'];
    const url = `${host}/client/${version}/user/tokens/verify`;

    await axios({
        method: 'get',
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CLOUDFLARE_AUTHORIZATION}`
        }
    })
        .then(function (response) {
            output = response.data
        })
        .catch(function (error) {
            console.log('error: ', error.response.data.error);

            output = error.response.data.error
        });

    return output;
};
