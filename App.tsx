import React from "react";
import { StatusBar, StyleSheet } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

import AuthProvider from "./app/auth/auth-context";
import RootNavigation from "./app/navigation/root-stack";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000", // default app background
  },
});

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          {/* backgroundColor is deprecated, and android only */}
          {/* recommended action is to use a third party library for more complex control */}
          <StatusBar barStyle="light-content" backgroundColor="#000" />
          <RootNavigation />
        </SafeAreaView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

export default App;
