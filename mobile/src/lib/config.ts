// Environment configuration for mobile app
const ENV = {
    // Change this to your backend URL
    API_URL: __DEV__
        ? 'http://10.200.3.89:5000/api' // Your computer's local IP
        : 'https://your-production-api.com/api',

    WS_URL: __DEV__
        ? 'http://10.200.3.89:5000'
        : 'https://your-production-api.com',
};

export default ENV;
