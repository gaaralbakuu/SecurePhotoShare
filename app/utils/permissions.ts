import { PermissionsAndroid, Platform, Linking } from 'react-native';

export async function requestPhotoPermission(): Promise<{
  granted: boolean;
  neverAskAgain: boolean;
}> {
  if (Platform.OS !== 'android') return { granted: true, neverAskAgain: false };

  const sdk = Platform.Version as number;

  const READ_MEDIA_IMAGES =
    (PermissionsAndroid as any).PERMISSIONS?.READ_MEDIA_IMAGES ||
    'android.permission.READ_MEDIA_IMAGES';
  const READ_EXTERNAL = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

  const permissionToRequest = sdk >= 33 ? READ_MEDIA_IMAGES : READ_EXTERNAL;

  try {
    const result = await PermissionsAndroid.request(permissionToRequest, {
      title: 'Allow access to photos',
      message: 'This app needs permission to read photos on your device',
      buttonPositive: 'OK',
      buttonNegative: 'Cancel',
    });

    if (result === PermissionsAndroid.RESULTS.GRANTED) return { granted: true, neverAskAgain: false };
    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) return { granted: false, neverAskAgain: true };
    return { granted: false, neverAskAgain: false };
  } catch (err) {
    return { granted: false, neverAskAgain: false };
  }
}

export function openAppSettings() {
  Linking.openSettings();
}
