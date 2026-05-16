import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

import AppText from './AppText';

const MAIN_COLOR = '#3296D9';

const AppActionPopup = ({
  visible,
  title,
  message,
  buttonText,
  onClose,
  onPress,
  iconName = 'notifications-outline',
  iconColor = '#EF4444',
  closeOnOverlayPress = true,
}) => {
  const handleButtonPress = () => {
    if (typeof onPress === 'function') {
      onPress();
      return;
    }

    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}>
      <Pressable
        style={styles.overlay}
        onPress={closeOnOverlayPress ? handleClose : undefined}>
        <Pressable style={styles.popupCard} onPress={() => {}}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.closeButton}
            onPress={handleClose}>
            <Ionicons name="close" size={19} color="#111111" />
          </TouchableOpacity>

          <View style={styles.iconBox}>
            <Ionicons name={iconName} size={32} color={iconColor} />
          </View>

          <AppText weight="bold" style={styles.title}>
            {title}
          </AppText>

          <AppText style={styles.message}>
            {message}
          </AppText>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.actionButton}
            onPress={handleButtonPress}>
            <AppText weight="bold" style={styles.actionButtonText}>
              {buttonText}
            </AppText>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default AppActionPopup;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  popupCard: {
    width: '100%',
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 18,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: '#F4F8FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    color: '#111111',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    color: '#8A8A8A',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 18,
  },
  actionButton: {
    width: '100%',
    height: 48,
    borderRadius: 11,
    backgroundColor: MAIN_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
});