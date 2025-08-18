import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import RootStackParamList from 'app/types/navigation/root-stack-param-list';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CustomFooter = ({ onAction }: { onAction?: () => void }) => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.footer}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Dashboard')}
        style={styles.button}
      >
        <Ionicons name="home-outline" size={36} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('TakePhoto')}
        style={styles.button}
      >
        <Ionicons name="camera-outline" size={40} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('Photos')}
        style={styles.button}
      >
        <Ionicons name="image-outline" size={36} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#000',
    backgroundColor: '#1e1e1e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  text: { color: '#333' },
  button: { padding: 8 },
  buttonText: { color: '#007aff' },
});

export default CustomFooter;
