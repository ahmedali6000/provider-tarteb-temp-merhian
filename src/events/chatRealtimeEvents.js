import {DeviceEventEmitter} from 'react-native';

export const CHAT_MESSAGE_RECEIVED_EVENT = 'CHAT_MESSAGE_RECEIVED_EVENT';

export const emitChatMessageReceived = message => {
  DeviceEventEmitter.emit(CHAT_MESSAGE_RECEIVED_EVENT, message);
};

export const listenChatMessageReceived = callback => {
  const subscription = DeviceEventEmitter.addListener(
    CHAT_MESSAGE_RECEIVED_EVENT,
    callback,
  );

  return () => subscription.remove();
};