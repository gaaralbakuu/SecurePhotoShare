// This type is used to define the parameters each screen needs in the navigation stack.
// it is required for React Navigation to work with TypeScript.
// 'undefined' means that the screen does not require any parameters.

type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Photos: undefined;
  TakePhoto: undefined;
  Dashboard: undefined;
  Readings: undefined;
};

export default RootStackParamList;
