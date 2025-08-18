import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Config from 'react-native-config';

// Screen Imports
import WelcomeScreen from 'app/screens/welcome/welcome-screen';
// import LoginScreen from "app/screens/login/login-screen";
import PhotoListScreen from 'app/screens/photos/photo-list-screen';
import Dashboard from 'app/screens/dashboard/dashboard-screen';
import ReadingsScreen from 'app/screens/readings/readings-screen';
import TakePhotoScreen from 'app/screens/photos/take-photo-screen';
// Other Imports
import { AuthContext, AuthContextType } from 'app/auth/auth-context';

import RootStackParamList from 'app/types/navigation/root-stack-param-list';
import MainHeader from 'app/components/header/main-header';
import CustomFooter from 'app/components/footer/custom-footer';
import SubHeader from 'app/components/header/sub-header';

const RootNavigation = () => {
  const { isSignedIn } = useContext(AuthContext) as AuthContextType;

  const RootStack = createNativeStackNavigator<RootStackParamList>();

  const appVariantName = Config.APP_ENV;

  return (
    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName={isSignedIn() ? 'Dashboard' : 'Welcome'}
      >
        {isSignedIn() ? (
          <RootStack.Group>
            <RootStack.Screen
              name="Dashboard"
              component={Dashboard}
              options={{
                header: () => (
                  <MainHeader title={`secure Health - ${appVariantName}`} />
                ),
              }}
            />
            <RootStack.Screen
              name="TakePhoto"
              component={TakePhotoScreen}
              options={{
                header: () => (
                  <SubHeader title={`Take Photo`} />
                ),
              }}
            />
            <RootStack.Screen
              name="Readings"
              component={ReadingsScreen}
              options={{ title: 'Readings' }}
            />
          </RootStack.Group>
        ) : (
          <>
            <RootStack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options={{
                header: () => (
                  <MainHeader title={`secure Health - ${appVariantName}`} />
                ),
              }}
            />
            {/* <RootStack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            /> */}
            <RootStack.Screen
              name="Photos"
              component={PhotoListScreen}
              options={{ title: 'Photos' }}
            />
          </>
        )}
      </RootStack.Navigator>
      <CustomFooter />
    </NavigationContainer>
  );
};

export default RootNavigation;
