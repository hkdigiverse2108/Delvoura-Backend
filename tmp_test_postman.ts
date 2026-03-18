import axios from 'axios';
import 'dotenv/config';

async function test() {
    const apiKey = process.env.POSTMAN_API_KEY;
    try {
        const response = await axios.get('https://api.getpostman.com/collections', {
            headers: { 'X-Api-Key': apiKey }
        });
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
    }
}
test();
