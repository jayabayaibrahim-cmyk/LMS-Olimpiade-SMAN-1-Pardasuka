export interface DeviceInfo {
  token: string;
  name: string;
  userAgent: string;
  platform: string;
  screenResolution: string;
}

const DEVICE_STORAGE_KEY = 'sman1_pardasuka_device_token';

export function getOrCreateDeviceToken(): DeviceInfo {
  let token = localStorage.getItem(DEVICE_STORAGE_KEY);
  if (!token) {
    const randomHex = Math.random().toString(36).substring(2, 9);
    token = `DEV-${randomHex.toUpperCase()}`;
    localStorage.setItem(DEVICE_STORAGE_KEY, token);
  }

  const userAgent = navigator.userAgent;
  let browserName = 'Browser';
  if (userAgent.indexOf('Firefox') > -1) browserName = 'Firefox';
  else if (userAgent.indexOf('SamsungBrowser') > -1) browserName = 'Samsung Internet';
  else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) browserName = 'Opera';
  else if (userAgent.indexOf('Trident') > -1) browserName = 'Internet Explorer';
  else if (userAgent.indexOf('Edge') > -1 || userAgent.indexOf('Edg') > -1) browserName = 'Microsoft Edge';
  else if (userAgent.indexOf('Chrome') > -1) browserName = 'Google Chrome';
  else if (userAgent.indexOf('Safari') > -1) browserName = 'Safari';

  let osName = 'Unknown OS';
  if (navigator.userAgent.indexOf('Win') !== -1) osName = 'Windows';
  else if (navigator.userAgent.indexOf('Mac') !== -1) osName = 'macOS';
  else if (navigator.userAgent.indexOf('Linux') !== -1) osName = 'Linux';
  else if (navigator.userAgent.indexOf('Android') !== -1) osName = 'Android';
  else if (navigator.userAgent.indexOf('iPhone') !== -1 || navigator.userAgent.indexOf('iPad') !== -1) osName = 'iOS';

  const screenRes = `${window.screen.width}x${window.screen.height}`;
  const deviceName = `${browserName} on ${osName} (${screenRes})`;

  return {
    token,
    name: deviceName,
    userAgent,
    platform: navigator.platform,
    screenResolution: screenRes,
  };
}

export function forceGenerateNewDeviceToken(): DeviceInfo {
  const randomHex = Math.random().toString(36).substring(2, 9);
  const token = `DEV-ALT-${randomHex.toUpperCase()}`;
  localStorage.setItem(DEVICE_STORAGE_KEY, token);
  return getOrCreateDeviceToken();
}
