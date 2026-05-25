import Constants from 'expo-constants';

interface ApiConfig {
    url: string;
    key: string;
};

const config = Constants.expoConfig?.extra?.api as ApiConfig;
const apiUrl = config?.url;
const apiKey = config?.key;

const fullUrl = apiUrl + '/' + apiKey;
const baseUrl = apiUrl;

// export const getBaseUrl = () => baseUrl;
export const getApiUrl = () => fullUrl;