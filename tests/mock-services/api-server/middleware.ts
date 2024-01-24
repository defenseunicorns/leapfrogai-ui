const axios = require('axios');

module.exports = function (req, res, next) {
    if (req.method === 'POST') {
        // Construct the URL for the GET request
        const getUrl = `http://localhost:8080${req.url}`;

        console.log(`Making GET request to: ${getUrl}`);

        axios.get(getUrl)
            .then(response => {
                console.log('GET request successful');
                res.json(response.data);
            })
            .catch(error => {
                console.error('Error in GET request:', error);
                if (error.response) {
                    // The server responded with a status code outside the 2xx range
                    console.error('Response data:', error.response.data);
                    console.error('Response status:', error.response.status);
                    res.status(error.response.status).json(error.response.data);
                } else if (error.request) {
                    // The request was made but no response was received
                    console.error('No response received:', error.request);
                    res.status(500).json({ error: 'No response from server' });
                } else {
                    // Something else caused the error
                    console.error('Error', error.message);
                    res.status(500).json({ error: error.message });
                }
            });
    } else {
        next();
    }
};
