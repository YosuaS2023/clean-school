// frontend/utils/imageUrlHelper.ts
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

export const getBaseUrl = () => baseUrl;

export const getProfilePictureUrl = (
  userPhotoUrl: string | null | undefined, 
  username: string | undefined
): string => {
  
  // 1. Jika dihapus total (Hanya Icon/Default Umum)
  if (userPhotoUrl === 'deleted') {
    console.log("null / profil icon")
    return `${baseUrl}/uploads/profile/defaults/profil_default.jpg`;
  }

  // 2. Jika ada foto custom
  if (userPhotoUrl && userPhotoUrl.trim() !== "") {
    return `${baseUrl}/uploads/profile/${userPhotoUrl}`;
  } 

  // 3. Jika NULL (Gunakan Foto Resmi Sekolah berdasarkan Username)
  if (username) {
    console.log("null / profil default server")
    return `${baseUrl}/uploads/profile/defaults/${username}.jpg`;
  }

  return `${baseUrl}/uploads/profile/defaults/profil_default.jpg`;
};