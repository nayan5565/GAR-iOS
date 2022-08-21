import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppAuthView from './src/views/AppAuthView';
import OneDriveApi from './src/views/OneDriveApi';
import MyDrawer from './src/components/MyDrawer';
import { applyMiddleware, createStore } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import rootReducer from './src/redux/reducer/rootReducer';
import LoginView from './src/views/LoginView';
import SplashView from './src/views/SplashView';
import Camera from './src/components/Camera';
import Gallery from './src/components/Gallery';
import Camera2 from './src/components/Camera2';

const store = createStore(rootReducer, applyMiddleware(thunk));
const Stack = createNativeStackNavigator();
const App = () => {


  return (

    <Provider store={store}>
      <NavigationContainer >
        <Stack.Navigator initialRouteName="Splash">
          <Stack.Screen name="Splash" component={SplashView} options={{ headerShown: false }} />
          <Stack.Screen name="Landing" component={LoginView} options={{ headerShown: false }} />
          <Stack.Screen name="One Drive" component={AppAuthView} />
          <Stack.Screen name="Api" component={OneDriveApi} />
          <Stack.Screen name="Camera" component={Camera} />
          <Stack.Screen name="Camera2" component={Camera2} options={{ title: 'Camera' }} />
          <Stack.Screen name="Gallery" component={Gallery} />
          <Stack.Screen name="Home" component={MyDrawer} options={{ headerShown: false }} />
        </Stack.Navigator>

      </NavigationContainer>
    </Provider>


  );

}

export default App;