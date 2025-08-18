import React, { useContext } from 'react';
import { Button, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import RootStackParamList from 'app/types/navigation/root-stack-param-list';
import { AuthContext, AuthContextType } from 'app/auth/auth-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Dashboard = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Dashboard'>>();
  const { logout, authStates, authInformation } = useContext(
    AuthContext,
  ) as AuthContextType;

  const handleLogOut = () => {
    logout();
  };

  const handleNavigateToReadingsScreen = () => {
    navigation.navigate('Readings');
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
        <Text style={{ color: '#fff', fontSize: 30, fontWeight: 'bold' }}>
          Good Morning
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: '#2f2f2f',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          flexDirection: 'column',
          gap: 16,
          padding: 16,
          justifyContent: 'space-around'
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('TakePhoto')}
          style={{
            flex: 1,
            backgroundColor: '#000',
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 36,
            maxHeight: 100
          }}
        >
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={{ color: '#fff', textAlign: 'center', fontSize: 24, fontWeight: '300' }}>Take Photo</Text>
          </View>
          <Ionicons name="camera-outline" size={40} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: '#000',
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 36,
            maxHeight: 100
          }}
        >
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={{ color: '#fff', textAlign: 'center', fontSize: 24, fontWeight: '300' }}>Upload Photo</Text>
          </View>
          <Ionicons name="image-outline" size={40} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: '#000',
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 36,
            maxHeight: 100
          }}
        >
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={{ color: '#fff', textAlign: 'center', fontSize: 24, fontWeight: '300' }}>Review Uploads</Text>
          </View>
          <Ionicons name="cloud-upload-outline" size={40} color="#fff" />
        </TouchableOpacity>

        {/* <View style={{ margin: 8, padding: 8, backgroundColor: '#000' }}>
        {authStates.isLoggingOut || authInformation === null ? (
          <View
            style={{
              height: 100,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff' }}>
              {authStates.isLoggingOut ? 'Logging out...' : 'Loading...'}
            </Text>
          </View>
        ) : (
          <View>
            <Text style={{ marginBottom: 16, color: '#fff' }}>
              This is your dashboard you can perform the following actions:
            </Text>
            <Button
              title="Go to Readings"
              onPress={handleNavigateToReadingsScreen}
            />
            <View style={{ marginTop: 16 }} />
            <Button title="Log out" onPress={handleLogOut} />
          </View>
        )}
      </View> */}
      </View>
    </View>
  );
};

export default Dashboard;
