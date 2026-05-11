require('dotenv').config();

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { default: axios } = require("axios");

const { API_ENDPOINTS } = require("./ant-api-endpoints");

const app = express();
app.use(cors({
    origin: [
        'http://localhost:4200',
        'https://alice-blue-trader-frontend.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(express.json());

// const API_SECRET = environment.SECRET_KEY;
// const AUTH_BASE_URL = environment.AUTH_BASE_URL;
// const TRADE_BASE_URL = environment.TRADE_BASE_URL;
// const CHART_BASE_URL = environment.CHART_BASE_URL;
// const CONTACT_MASTER_BASE_URL = environment.CONTACT_MASTER_BASE_URL;
// const OPTION_CHAIN_BASE_URL = environment.OPTION_CHAIN_BASE_URL;

const API_SECRET = process.env.SECRET_KEY;
const AUTH_BASE_URL = process.env.AUTH_BASE_URL;
const TRADE_BASE_URL = process.env.TRADE_BASE_URL;
const CHART_BASE_URL = process.env.CHART_BASE_URL;
const CONTACT_MASTER_BASE_URL = process.env.CONTACT_MASTER_BASE_URL;
const OPTION_CHAIN_BASE_URL = process.env.OPTION_CHAIN_BASE_URL;
const PORT = process.env.PORT || 3000;

// API to create initial user session and handle the response
app.post("/api/auth/create-session", async (req, res) => {
    const { userId, authCode } = req.body;
    try {
        const checksum = crypto
            .createHash("sha256")
            .update(userId + authCode + API_SECRET)
            .digest("hex");

        const response = await axios.post(
            `${AUTH_BASE_URL}${API_ENDPOINTS.GET_USER_DETAILS}`,
            {
                checkSum: checksum,
            },
        );
        res.json(response.data);
    } catch (err) {
        console.error("AXIOS ERROR:", err.message);
        res.status(500).json({
            message: err.message,
            data: err.response?.data,
        });
    }
});

// Common Method to call api based on API Method, Endpoint and session info
// It also accecpts params and data for requests
const callAliceApi = async (
    method,
    endpoint,
    session,
    { data = null, params = null } = {},
    isChart = false,
    isContactMaster = false,
    isOptionChain = false,
) => {
    let baseUrl = TRADE_BASE_URL;

    if (isChart) {
        baseUrl = CHART_BASE_URL;
    } else if (isContactMaster) {
        baseUrl = CONTACT_MASTER_BASE_URL;
    } else if (isOptionChain) {
        baseUrl = OPTION_CHAIN_BASE_URL;
    }

    console.log("payload", {
        method,
        url: `${baseUrl}${endpoint}`,
        headers: {
            Authorization: `Bearer ${session}`,
            "Content-Type": "application/json",
        },
        data,
        timeout: 10000,
    });

    try {
        return await axios({
            method,
            url: `${baseUrl}${endpoint}`,
            headers: {
                Authorization: `Bearer ${session}`,
                "Content-Type": "application/json",
            },
            ...(method === "GET" && typeof params === "object" ? { params } : {}),
            ...(method !== "GET" && data ? { data } : {}),
            timeout: 10000,
        });
    } catch (err) {
        console.error("API FAIL:", endpoint, err.response?.data || err.message);
        throw err;
    }
};

// Common API to return data from aliceblue API
app.post("/api/shell", async (req, res) => {
    const {
        method,
        endpoint,
        session,
        data = null,
        params = null,
        isChart = false,
        isContactMaster = false,
        isOptionChain = false,
    } = req.body;

    try {
        const response = await callAliceApi(
            method,
            endpoint,
            session,
            { data, params },
            isChart,
            isContactMaster,
            isOptionChain,
        );

        //console.log('response', response.data)

        res.json({
            success: response.data.status,
            result: response.data.result,
            message: response.data.message,
        });
    } catch (err) {
        res.status(500).json(err.response?.data || err.message);
    }
});

app.listen(PORT, () => {
    console.log(` Backend running on http://localhost:${PORT}`);
});
