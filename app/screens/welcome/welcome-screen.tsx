// TODO: When the initial "Is user logged in" check is happening we need the app, or screen, to be in a loading state

import React, { useContext } from 'react';
import { Button, View, Text, StyleSheet } from 'react-native';

import { AuthContext, AuthContextType } from 'app/auth/auth-context';

const WelcomeScreen = () => {
  const { login, setFakeSignedIn, authStates, authenticationError } =
    useContext(AuthContext) as AuthContextType;

  const handleLogin = () => {
    // use setFakeSignedIn to simulate a successful login
    if (typeof setFakeSignedIn === 'function') {
      login()
      // setFakeSignedIn(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {authStates.isAuthLoading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading...</Text>
          </View>
        ) : (
          <View>
            <Text style={styles.title}>Welcome to SecurePhotoShare</Text>
            <Button title="Log in" onPress={handleLogin} />
            {(authStates.isAuthError || authStates.isRefreshingError) && (
              <Text style={styles.errorLabel}>
                Authentication Error Occurred:
              </Text>
            )}
            {authStates.isAuthError && (
              <Text style={styles.errorText}>
                {authenticationError !== null
                  ? authenticationError
                  : 'Unknown Error'}
              </Text>
            )}
            {authStates.isRefreshingError && (
              <Text style={styles.errorText}>
                {authenticationError !== null
                  ? authenticationError
                  : 'Unknown Error'}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  inner: {
    margin: 8,
    padding: 8,
  },
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    color: '#fff',
  },
  errorLabel: {
    marginTop: 16,
    color: '#fff',
  },
  errorText: {
    fontSize: 12,
    color: '#fff',
  },
});

export default WelcomeScreen;
