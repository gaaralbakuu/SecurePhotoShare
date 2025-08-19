import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Alert,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import RootStackParamList from 'app/types/navigation/root-stack-param-list';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoDetail'>;

const { width, height } = Dimensions.get('window');

const PhotoDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const incoming = route.params?.photos ?? [];
  const [photos, setPhotos] = useState<string[]>(incoming);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const pendingActionRef = useRef<any>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // ensure photos reflect route params if updated
    setPhotos(route.params?.photos ?? []);
  }, [route.params]);

  // Intercept navigation attempts and show confirm dialog when there are unsaved changes
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      // consider there are unsaved changes if there are photos or form values
      const hasUnsaved =
        photos.length > 0 || title.length > 0 || description.length > 0;
      if (!hasUnsaved) return; // allow leaving
      if (showConfirmLeave) return; // already showing

      e.preventDefault();
      pendingActionRef.current = e.data.action;
      setShowConfirmLeave(true);
    });

    return unsubscribe;
  }, [navigation, photos, title, description, showConfirmLeave]);

  const uploadPhotos = async () => {
    if (photos.length === 0) {
      Alert.alert('No photos', 'There are no photos to upload.');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Mock upload: iterate photos and pretend to upload with timeout.
      for (let i = 0; i < photos.length; i++) {
        // Replace the below with real upload logic (fetch/axios multipart/form-data)
        await new Promise<void>(resolve => setTimeout(() => resolve(), 600));
        setProgress(Math.round(((i + 1) / photos.length) * 100));
      }

      // On success, navigate back to Photos list or Dashboard as desired
      Alert.alert('Upload complete', `${photos.length} photos uploaded.`);
      navigation.navigate('Photos');
    } catch (err) {
      Alert.alert('Upload failed', String(err));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const renderItem = ({ item }: { item: string }) => (
    <View style={styles.thumbWrap}>
      <Image source={{ uri: item }} style={styles.thumb} />
    </View>
  );

  // Open preview modal at a given index
  const openPreview = (index = 0) => {
    setCurrentIndex(index);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
  };

  const showNext = () => {
    setCurrentIndex(i => (i + 1) % Math.max(1, photos.length));
  };

  const showPrev = () => {
    setCurrentIndex(i => (i - 1 + photos.length) % Math.max(1, photos.length));
  };

  const deleteCurrent = () => {
    // remove the current photo from the list
    const updated = photos.filter((_, idx) => idx !== currentIndex);
    setPhotos(updated);
    if (updated.length === 0) {
      setShowPreview(false);
      setCurrentIndex(0);
      return;
    }
    // clamp currentIndex
    setCurrentIndex(ci => Math.min(ci, updated.length - 1));
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }); // e.g. "Apr 1, 2025"
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }); // e.g. "9:41 AM"

  return (
    <View style={styles.container}>
      {showConfirmLeave && (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <View
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                width: '100%',
                borderRadius: 30,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 16,
                paddingVertical: 8,
              }}
            >
              <Text style={styles.confirmMessage}>
                Are you sure you want to leave?
              </Text>
            </View>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowConfirmLeave(false);
                  pendingActionRef.current = null;
                }}
              >
                <Text style={styles.actionCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  setShowConfirmLeave(false);
                  if (pendingActionRef.current) {
                    navigation.dispatch(pendingActionRef.current);
                    pendingActionRef.current = null;
                  } else {
                    navigation.goBack();
                  }
                }}
              >
                <Text style={styles.actionText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Preview overlay (replaces Modal) */}
      {showPreview && (
        <View style={styles.overlay} pointerEvents="box-none">
          {/* tap outside to close */}
          <TouchableWithoutFeedback onPress={closePreview}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>

          <View
            style={[
              styles.modalContent,
              {
                marginTop: 12,
              },
            ]}
          >
            <View
              style={[
                styles.previewArea,
                {
                  flexDirection: 'column',
                },
              ]}
            >
              <View
                style={{
                  justifyContent: 'flex-end',
                  width: '100%',
                  flexDirection: 'row',
                  padding: 10,
                }}
              >
                <TouchableOpacity onPress={closePreview}>
                  <Ionicons
                    name="close-circle-outline"
                    size={28}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>

              <View
                style={{
                  paddingHorizontal: 12,
                  flex: 1,
                }}
              >
                <View
                  style={{
                    width: '100%',
                    position: 'relative',
                    backgroundColor: '#000',
                  }}
                >
                  {photos.length > 0 ? (
                    <Image
                      source={{ uri: photos[currentIndex] }}
                      style={styles.previewImage}
                    />
                  ) : (
                    <View style={styles.emptyPreview}>
                      <Text style={{ color: '#fff' }}>No photos</Text>
                    </View>
                  )}
                  {/* Delete */}
                  <TouchableOpacity
                    onPress={deleteCurrent}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      padding: 10,
                    }}
                  >
                    <Ionicons name="trash-outline" size={28} color="#fff" />
                  </TouchableOpacity>

                  {/* Prev / Next */}
                  {photos.length > 1 && (
                    <>
                      <TouchableOpacity
                        style={styles.prevBtn}
                        onPress={showPrev}
                      >
                        <Ionicons
                          name="chevron-back-circle-outline"
                          size={36}
                          color="#fff"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.nextBtn}
                        onPress={showNext}
                      >
                        <Ionicons
                          name="chevron-forward-circle-outline"
                          size={36}
                          color="#fff"
                        />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>

              {/* Thumbnails strip */}
              <View style={styles.thumbStrip}>
                <FlatList
                  data={photos}
                  keyExtractor={(it, idx) => String(idx)}
                  horizontal
                  renderItem={({ item, index }) => (
                    <TouchableOpacity onPress={() => setCurrentIndex(index)}>
                      <Image
                        source={{ uri: item }}
                        style={[
                          styles.smallThumb,
                          index === currentIndex
                            ? styles.smallThumbActive
                            : null,
                        ]}
                      />
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        </View>
      )}
      <ScrollView>
        <View
          style={{
            flex: 1,
            backgroundColor: '#2f2f2f',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            flexDirection: 'column',
            gap: 16,
            padding: 16,
            marginTop: 16,
            justifyContent: 'space-around',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8,
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                backgroundColor: '#999999',
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
                marginRight: 12,
              }}
            >
              <Text style={{ color: '#000', fontSize: 14 }}>{dateStr}</Text>
            </View>
            <View
              style={{
                backgroundColor: '#999999',
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#000', fontSize: 14 }}>{timeStr}</Text>
            </View>
          </View>

          <View style={styles.formRow}>
            <View>
              <Text style={styles.label}>Case Reference (Internal)</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Enter case reference (Internal)"
                placeholderTextColor="#666"
                style={styles.input}
              />
            </View>

            <View
              style={{
                borderRadius: 30,
                overflow: 'hidden',
                flexDirection: 'column',
                backgroundColor: '#d9d9d9',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  gap: 10,
                  alignItems: 'center',
                  borderBottomWidth: 1,
                  borderBottomColor: '#ccc',
                  backgroundColor: '#ededed',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                }}
              >
                <Ionicons name="arrow-back-outline" size={16} color="#000" />
                <Text style={{ color: '#000', fontSize: 14 }}>
                  Search Location...
                </Text>
              </View>
              <View style={{ height: 100 }}></View>
            </View>
          </View>

          <View style={styles.formRow}>
            <View>
              <Text style={styles.label}>Additional Notes</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Notes"
                placeholderTextColor="#666"
                style={[styles.input, { height: 80 }]}
                multiline
              />
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              justifyContent: 'flex-end',
            }}
          >
            <TouchableOpacity onPress={() => openPreview(0)}>
              <View
                style={{
                  borderColor: '#b2b2b2',
                  borderWidth: 2,
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: '#e3e3e3',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <Ionicons name="cloud-upload-outline" size={24} color="#000" />
                <Text style={{ color: '#000' }}>Preview/Edit Upload</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 20,
              justifyContent: 'center',
            }}
          >
            <TouchableOpacity>
              <View
                style={{
                  borderColor: '#b2b2b2',
                  borderWidth: 2,
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: '#e3e3e3',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <Ionicons name="close-outline" size={24} color="#000" />
                <Text style={{ color: '#000' }}>Cancel</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={uploadPhotos} disabled={uploading}>
              <View
                style={{
                  borderColor: '#b2b2b2',
                  borderWidth: 2,
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: '#e3e3e3',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <Ionicons name="checkmark-outline" size={24} color="#000" />
                <Text style={{ color: '#000' }}>Submit</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { color: '#fff', fontSize: 20, marginBottom: 12 },
  subHeader: { color: '#fff', fontSize: 16, marginVertical: 8 },
  formRow: { marginBottom: 12, flexDirection: 'column', gap: 16 },
  label: { color: '#fff', marginBottom: 6 },
  input: {
    backgroundColor: '#d9d9d9',
    color: '#000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  thumbWrap: {
    width: 100,
    height: 100,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumb: { width: '100%', height: '100%', resizeMode: 'cover' },
  uploadButton: {
    backgroundColor: '#007aff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  uploadText: { color: '#fff', fontSize: 16 },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {},
  previewArea: {
    flex: 1,
    width: width,
    height: height,
    flexDirection: 'column',
    backgroundColor: '#2f2f2f',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  previewImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  emptyPreview: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prevBtn: {
    position: 'absolute',
    left: 8,
    top: '50%',
    marginTop: -18,
    zIndex: 10,
  },
  nextBtn: {
    position: 'absolute',
    right: 8,
    top: '50%',
    marginTop: -18,
    zIndex: 10,
  },
  deleteBtn: { position: 'absolute', right: 12, bottom: 72, zIndex: 10 },
  thumbStrip: {
    padding: 12,
  },
  smallThumb: {
    width: 56,
    height: 56,
    marginRight: 8,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  smallThumbActive: { borderColor: '#fff' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 10000,
  },
  confirmBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 30,
    padding: 20,
    alignItems: 'center',
    flexDirection: 'column',
    gap: 16,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  confirmMessage: {
    fontSize: 18,
    color: '#000',
    textAlign: 'left',
  },
  confirmActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 30,
    color: '#000',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: '#004bc2',
  },
  actionCancelText: { color: '#000', fontSize: 18 },
  actionText: { color: '#fff', fontSize: 18 },
});

export default PhotoDetailScreen;
