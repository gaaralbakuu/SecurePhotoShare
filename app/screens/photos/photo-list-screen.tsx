import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import RootStackParamList from 'app/types/navigation/root-stack-param-list';
import { CameraRoll } from "@react-native-camera-roll/camera-roll";

type Props = NativeStackScreenProps<RootStackParamList, 'Photos'>;

const PhotoListScreen: React.FC<Props> = ({ navigation }) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [neverAskAgain, setNeverAskAgain] = useState(false);

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        // request permission using helper
        const { requestPhotoPermission } = await import('app/utils/permissions');
        const { granted, neverAskAgain: naa } = await requestPhotoPermission();
        if (!granted) {
          setError('Permission denied');
          setNeverAskAgain(naa);
          return;
        }

        const res = await CameraRoll.getPhotos({ first: 50, assetType: 'Photos' });
        const uris = res.edges.map((e: any) => e.node.image.uri);
        setPhotos(uris);
      } catch (err: any) {
        setError(err.message ?? String(err));
      }
    };

    loadPhotos();
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
        {neverAskAgain ? (
          <TouchableOpacity onPress={() => {
            const { openAppSettings } = require('app/utils/permissions');
            openAppSettings();
          }} style={styles.settingsButton}>
            <Text style={styles.settingsText}>Open Settings</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        numColumns={3}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.thumbWrap} onPress={() => {}}>
            <Image source={{ uri: item }} style={styles.thumb} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  thumbWrap: { flex: 1 / 3, aspectRatio: 1, padding: 2 },
  thumb: { width: '100%', height: '100%', resizeMode: 'cover' },
  error: { color: '#fff', padding: 16 },
  settingsButton: { marginTop: 12, padding: 8, backgroundColor: '#222', alignSelf: 'flex-start', borderRadius: 4 },
  settingsText: { color: '#5da7c7' },
});

export default PhotoListScreen;
