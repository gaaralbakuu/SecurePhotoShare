import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import RootStackParamList from 'app/types/navigation/root-stack-param-list';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TakePhoto'
>;

const TakePhotoScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const cameraRef = useRef<Camera | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const devices = useCameraDevices();
  // `useCameraDevices` can sometimes have different shapes depending on versions/types.
  // Be defensive: if it has a `back` property use it, otherwise fall back to first entry.
  const device =
    (devices as any)?.back ??
    (Array.isArray(devices) ? (devices as any)[0] : undefined);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraReady, setCameraReady] = useState<boolean>(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const pendingActionRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission((status as unknown) === 'granted');
    })();
  }, []);

  // Intercept navigation attempts (back button, navigate away)
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      // Only block navigation if a photo has been taken (unsaved changes)
      if (!photoUri) return; // allow leaving when no photo
      // If we already showing confirm leave, allow the action
      if (showConfirmLeave) return;

      // Prevent default behavior of leaving the screen
      e.preventDefault();
      // Store the action so we can dispatch it after confirmation
      pendingActionRef.current = e.data.action;
      setShowConfirmLeave(true);
    });

    return unsubscribe;
  }, [navigation, showConfirmLeave, photoUri]);

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      // takePhoto from vision-camera returns an object with a `path` property
      const photo = await cameraRef.current.takePhoto({ flash: 'off' } as any);
      if (photo && photo.path) {
        // prefix with file:// for Android if necessary
        const uri = photo.path.startsWith('file://')
          ? photo.path
          : `file://${photo.path}`;
        setPhotoUri(uri);
      }
    } catch (err) {
      console.warn('Failed to take picture', err);
    }
  };

  const handleRetake = () => setPhotoUri(null);
  const handleDone = () => {
    if (photoUri) {
      // show confirm dialog when there's a photo
      setShowConfirmLeave(true);
      pendingActionRef.current = null; // no pending navigation action
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {photoUri ? (
        <View
          style={{
            flex: 1,
            backgroundColor: '#2f2f2f',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            flexDirection: 'column',
            gap: 16,
            padding: 16,
            justifyContent: 'space-around',
            marginTop: 16,
          }}
        >
          <View style={{ flex: 1 }}>
            <Image source={{ uri: photoUri }} style={styles.previewImage} />
          </View>
          <View style={styles.previewActions}>
            <TouchableOpacity onPress={handleRetake}>
              <Text style={styles.actionText}>
                <Ionicons name="add-circle-outline" size={40} color="#fff" />
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleRetake}>
              <Text style={styles.actionText}>
                <Ionicons name="camera-reverse" size={40} color="#fff" />
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDone}>
              <Text style={styles.actionText}>
                <Ionicons name="arrow-forward-outline" size={40} color="#fff" />
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: '#2f2f2f',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            flexDirection: 'column',
            gap: 16,
            padding: 16,
            justifyContent: 'space-around',
            marginTop: 16,
          }}
        >
          <View style={styles.centered}>
            {hasPermission === null || device == null ? (
              <ActivityIndicator color="#fff" />
            ) : hasPermission === false ? (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#fff', marginBottom: 12 }}>
                  Camera permission denied. Please allow camera access.
                </Text>
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={async () => {
                    const status = await Camera.requestCameraPermission();
                    setHasPermission((status as unknown) === 'granted');
                  }}
                >
                  <Text style={styles.actionText}>Request again</Text>
                </TouchableOpacity>
                <View style={{ height: 12 }} />
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() => {
                    Linking.openSettings();
                  }}
                >
                  <Text style={styles.actionText}>Open Settings</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.cameraContainer}>
                  <Camera
                    ref={(ref: Camera | null) => {
                      cameraRef.current = ref;
                    }}
                    style={styles.cameraFill}
                    device={device}
                    isActive={true}
                    photo={true}
                    onInitialized={() => setCameraReady(true)}
                  />
                  {!cameraReady && (
                    <View style={styles.cameraOverlay} pointerEvents="none">
                      <ActivityIndicator size="large" color="#fff" />
                    </View>
                  )}
                </View>
                <View style={styles.controlsRow}>
                  <TouchableOpacity
                    style={styles.captureButton}
                    onPress={takePicture}
                  >
                    <View style={styles.innerCircle} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      )}
      {showConfirmLeave && (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Are you sure?</Text>
            <Text style={styles.confirmMessage}>Do you want to leave this page?</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  // Cancel
                  setShowConfirmLeave(false);
                  pendingActionRef.current = null;
                }}
              >
                <Text style={styles.actionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  // Confirm: perform the pending navigation action
                  setShowConfirmLeave(false);
                  if (pendingActionRef.current) {
                    navigation.dispatch(pendingActionRef.current);
                    pendingActionRef.current = null;
                  } else {
                    navigation.goBack();
                  }
                }}
              >
                <Text style={styles.actionText}>Leave</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  preview: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  bottomBar: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
  },
  previewContainer: { flex: 1 },
  previewImage: { flex: 1, width: '100%', height: '100%', resizeMode: 'cover' },
  actionButton: {
    position: 'absolute',
    bottom: 36,
    left: 20,
    right: 20,
    height: 48,
    backgroundColor: '#000',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { color: '#fff', fontSize: 18 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hint: { color: '#fff', fontSize: 18, marginBottom: 12 },
  openButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  openText: { color: '#000', fontSize: 16 },
  cameraEmbedded: {},
  cameraContainer: {
    width: '100%',
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  cameraFill: { flex: 1, width: '100%', height: '100%' },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  controlsRow: { marginTop: 16, alignItems: 'center' },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  smallButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    opacity: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  confirmBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  confirmTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: '#000' },
  confirmMessage: { fontSize: 14, color: '#333', marginBottom: 16, textAlign: 'center' },
  confirmActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  confirmButton: { flex: 1, marginHorizontal: 8, paddingVertical: 12, alignItems: 'center', borderRadius: 8, backgroundColor: '#000' },
});

export default TakePhotoScreen;
