const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { default: axios } = require('axios');

const { API_ENDPOINTS } = require('./ant-api-endpoints');
const { environment } = require('./environment');

const app = express();
app.use(cors());
app.use(express.json());

const API_SECRET = environment.SECRET_KEY;
const AUTH_BASE_URL = environment.AUTH_BASE_URL;
const TRADE_BASE_URL = environment.TRADE_BASE_URL;


// API to create initial user session and handle the response
app.post('/api/auth/create-session', async (req, res) => {
    const { userId, authCode } = req.body;
    try {
        const checksum = crypto
            .createHash('sha256')
            .update(userId + authCode + API_SECRET)
            .digest('hex');

        const response = await axios.post(
            `${AUTH_BASE_URL}${API_ENDPOINTS.GET_USER_DETAILS}`,
            {
                checkSum: checksum
            }
        );
        res.json(response.data);

    } catch (err) {
        console.error('AXIOS ERROR:', err.message);
        res.status(500).json({
            message: err.message,
            data: err.response?.data
        });
    }
});

// Common Method to call api based on API Method, Endpoint and session info
// It also accecpts params and data for requests
const callAliceApi = async (method, endpoint, session, { data = null, params = null } = {}) => {
    try {
        return await axios({
            method,
            url: `${TRADE_BASE_URL}${endpoint}`,
            headers: {
                Authorization: `Bearer ${session}`,
                'Content-Type': 'application/json'
            },
            ...(method === 'GET' && typeof params === 'object' ? { params } : {}),
            ...(method !== 'GET' && data ? { data } : {}),
            timeout: 10000
        });
    } catch (err) {
        console.error('API FAIL:', endpoint, err.response?.data || err.message);
        throw err;
    }
};

// Common API to return data from aliceblue API
app.post('/api/shell', async (req, res) => {
    const { method, endpoint, session, data = null, params = null } = req.body;

    try {
        const response = await callAliceApi(
            method,
            endpoint,
            session,
            { data, params }
        );

        res.json({
            success: response.data.status,
            result: response.data.result,
            message: response.data.message
        });
    } catch (err) {
        res.status(500).json(err.response?.data || err.message);
    }
});

app.listen(3000, () => {
    console.log(' Backend running on http://localhost:3000');
});