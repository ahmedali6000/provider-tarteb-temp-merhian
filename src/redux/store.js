import { configureStore } from '@reduxjs/toolkit';
import appReducer from './reducers';
import reactotron from '../../ReactotronConfig';

const store = configureStore({
  reducer: appReducer,
  devTools: true,
  enhancers: (getDefaultEnhancers) =>
    __DEV__
      ? getDefaultEnhancers().concat(reactotron.createEnhancer())
      : getDefaultEnhancers(),
});

export default store;