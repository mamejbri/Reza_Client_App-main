const USE_USB_REVERSE = true; // set to false for Wi-Fi later

export const API = {
  BASE_URL: __DEV__
    ? (USE_USB_REVERSE
        ? 'http://localhost:8080/api/reza'        // via adb reverse
        : 'http://192.168.1.6:8080/api/reza')  // replace with your PC IP for Wi-Fi
    : 'https://pro.booktareza.com/api/reza',
};