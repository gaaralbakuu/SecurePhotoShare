import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import RootStackParamList from 'app/types/navigation/root-stack-param-list';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
};

const SubHeader: React.FC<Props> = ({
  title,
  subtitle,
  showBack = false,
  rightAction,
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <Ionicons
          name="arrow-back"
          size={24}
          color="#fff"
          onPress={() => navigation.goBack()}
        />
      </View>
      <View style={{ flexGrow: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            textAlign: 'center',
            color: '#fff',
            fontSize: 18,
            fontWeight: '400',
            fontFamily:
              Platform.OS === 'android'
                ? 'EduNSWACTCursive-Medium'
                : 'Edu NSW ACT Cursive',
          }}
        >
          {title}
        </Text>
      </View>
      <View style={{ flex: 1 }}></View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#191919',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    height: 60
  },
  left: { width: 60 },
  leftHidden: { width: 0, padding: 0 },
  center: { flex: 1, alignItems: 'center' },
  centerLeft: { alignItems: 'flex-start' },
  right: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  title: {
    color: '#00aad9',
    fontSize: 18,
    fontWeight: '400',
    fontFamily:
      Platform.OS === 'android'
        ? 'EduNSWACTCursive-Medium'
        : 'Edu NSW ACT Cursive',
  },
  subtitle: { color: '#9bdcf0', fontSize: 12, marginTop: 2 },
  avatarButton: { padding: 4 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00aad9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  backButton: { padding: 8 },
  backText: { color: '#00aad9' },
});

export default SubHeader;
