import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Toast from 'react-native-toast-message';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';

import { AuthProvider, useAuth } from './src/state/auth';
import { ChamaProvider } from './src/state/chama';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ChamasScreen from './src/screens/ChamasScreen';
import CreateChamaScreen from './src/screens/CreateChamaScreen';
import ChamaHomeScreen from './src/screens/ChamaHomeScreen';
import ContributionsScreen from './src/screens/ContributionsScreen';
import LoansScreen from './src/screens/LoansScreen';
import ChatScreen from './src/screens/ChatScreen';
import ActivityScreen from './src/screens/ActivityScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import TabBar from './src/components/TabBar';
import ChamaAdminScreen from './src/screens/ChamaAdminScreen';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function AuthedTabs() {
  return (
    <Tabs.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
      })}
    >
      <Tabs.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home' }} />
      <Tabs.Screen name="ChamasTab" component={ChamasScreen} options={{ title: 'Chamas' }} />
      <Tabs.Screen name="AddTab" component={CreateChamaScreen} options={{ title: 'Add' }} />
      <Tabs.Screen name="ActivityTab" component={ActivityScreen} options={{ title: 'Activity' }} />
      <Tabs.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tabs.Navigator>
  );
}

function RootNavigator() {
  const { token } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {!token ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="HomeTabs" component={AuthedTabs} />
          <Stack.Screen name="ChamaHome" component={ChamaHomeScreen} />
          <Stack.Screen name="Contributions" component={ContributionsScreen} />
          <Stack.Screen name="Loans" component={LoansScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="ChamaAdmin" component={ChamaAdminScreen} />
          <Stack.Screen name="Settings" component={ActivityScreen} />
          <Stack.Screen name="ChangePassword" component={ActivityScreen} />
          <Stack.Screen name="Help" component={ActivityScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const theme = {
    ...MD3LightTheme,
    roundness: 12,
    colors: {
      ...MD3LightTheme.colors,
      primary: '#2563eb',
      secondary: '#7c3aed',
    },
  };

  return (
    <AuthProvider>
      <ChamaProvider>
        <PaperProvider theme={theme} settings={{ icon: () => null }}>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
          <Toast />
        </PaperProvider>
      </ChamaProvider>
    </AuthProvider>
  );
}
