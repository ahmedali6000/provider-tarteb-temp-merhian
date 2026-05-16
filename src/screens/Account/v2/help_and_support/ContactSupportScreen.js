import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Snackbar} from 'react-native-paper';
import Ionicons from '@react-native-vector-icons/ionicons';

import AppHeader from '../../../../shared/AppHeader';
import AppText from '../../../../shared/AppText';
import AppButton from '../../../../component/AppButton';
import useAppFont from '../../../../hooks/useAppFont';
import api from '../../../../services/api';

const ContactSupportScreen = ({navigation}) => {
  const {t} = useTranslation();
  const {fontFamily} = useAppFont();

  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');

  const updateMsg = value => {
    setMsg(value);
    if (errorText) {
      setErrorText('');
    }
  };

  const showSnackbar = (text, type = 'success') => {
    setSnackbarText(text);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  const sendNow = async () => {
    if (!msg || !msg.trim()) {
      setErrorText(t('contact_support.validation.message_required'));
      return;
    }

    try {
      setLoading(true);
      setErrorText('');

      await api.post('/send-support', {
        msg: msg.trim(),
      });

      setMsg('');
      setDone(true);

      showSnackbar(
        t('contact_support.toast.success_message'),
        'success',
      );
    } catch (error) {
      console.log(
        'SEND SUPPORT ERROR:',
        error?.response?.data || error?.message,
      );

      showSnackbar(
        t('contact_support.toast.error_message'),
        'error',
      );
    } finally {
      setLoading(false);
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'SupportMessagesScreen',
          },
        ],
      });
          }
  };

  useEffect(() => {
    return () => {
      setMsg('');
    };
  }, [done]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <AppHeader
            titleKey="contact_support.title"
            onBack={() => navigation.goBack()}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}>
            <AppText style={styles.description}>
              {t('contact_support.description')}
            </AppText>

            <View style={styles.textAreaWrap}>
              <TextInput
                value={msg}
                onChangeText={updateMsg}
                placeholder={t('contact_support.placeholder')}
                placeholderTextColor="#A4A4A4"
                multiline
                textAlignVertical="top"
                style={[styles.textArea, {fontFamily, textAlign: 'auto'}]}
              />
            </View>

            {errorText ? (
              <AppText style={styles.errorText}>{errorText}</AppText>
            ) : null}
          </ScrollView>

          <View style={styles.bottomButtonWrap}>
            <AppButton
              title={loading ? '' : t('contact_support.send')}
              onPress={sendNow}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="paper-plane-outline" size={17} color="#fff" />
              )}
            </AppButton>
          </View>

         <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={Snackbar.DURATION_INDEFINITE} // 👈 مهم
          style={[
            styles.snackbar,
            snackbarType === 'success'
              ? styles.snackbarSuccess
              : styles.snackbarError,
          ]}
          action={{
            label: t('common.ok'), // 👈 "حسنًا"
            onPress: () => {
              setSnackbarVisible(false);
            },
          }}>
          {snackbarText}
        </Snackbar>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ContactSupportScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  scrollContent: {
    paddingTop: 18,
    paddingBottom: 120,
  },
  description: {
    fontSize: 13,
    color: '#8A8A8A',
    lineHeight: 22,
    textAlign: 'auto',
    marginBottom: 12,
  },
  textAreaWrap: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#DEDEDE',
    borderRadius: 14,
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 110,
    fontSize: 14,
    color: '#1F1F1F',
  },
  errorText: {
    fontSize: 12,
    color: '#FF5C5C',
    marginTop: 8,
    textAlign: 'auto',
  },
  bottomButtonWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    backgroundColor: 'transparent',
  },
  snackbar: {
    marginBottom: 80,
    borderRadius: 12,
  },
  snackbarSuccess: {
    backgroundColor: '#22C55E',
  },
  snackbarError: {
    backgroundColor: '#EF4444',
  },
});