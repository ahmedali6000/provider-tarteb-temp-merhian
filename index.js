import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';

if (__DEV__) {
  require('./ReactotronConfig');
}
import App from './App';
import { name as appName } from './app.json';
import { Provider } from 'react-redux';
import React from 'react';
import store from './src/redux/store';

import i18next from './languages/i18n';

const ConnectedApp = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

AppRegistry.registerComponent(appName, () => ConnectedApp);