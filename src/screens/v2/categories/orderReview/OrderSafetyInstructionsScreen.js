import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  I18nManager,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useTranslation} from 'react-i18next';

import AppHeader from '../../../../shared/AppHeader';
import AppText from '../../../../shared/AppText';
import {getOrderInstructions} from '../../../../services/orderInstructionService';

import OrderSafeHero from '../../../../../assets/app/svgs/order_safe_hero.svg';

const MAIN_COLOR = '#3296D9';
const LIGHT_BLUE = '#EAF6FE';
const ORANGE = '#F7931E';
const TEXT_DARK = '#111111';
const TEXT_GRAY = '#7D7D7D';

const OrderSafetyInstructionsScreen = ({navigation, route}) => {
  const {t} = useTranslation();
  const isRTL = I18nManager.isRTL;

  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchInstructions();
  }, []);

  const fetchInstructions = async () => {
    try {
      setLoading(true);
      const response = await getOrderInstructions();
      setData(response?.data || null);
    } catch (error) {
      console.log(
        'ORDER INSTRUCTIONS ERROR:',
        error?.response?.data || error?.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

const handleConfirm = () => {
  if (!checked) {
    return;
  }

  if (route?.params?.nextScreen) {
    navigation.replace(route.params.nextScreen, {
      orderPayload: route?.params?.orderPayload,
    });
    return;
  }

  if (typeof route?.params?.onConfirm === 'function') {
    route.params.onConfirm();
    return;
  }

  navigation.goBack();
};

  const renderInstructionParts = parts => {
    return (
      <AppText style={styles.instructionText}>
        {(parts || []).map((part, index) => (
          <AppText
            key={String(index)}
            weight={part?.highlight ? 'bold' : 'regular'}
            style={[
              styles.instructionText,
              part?.highlight && styles.highlightText,
            ]}>
            {part?.text}
          </AppText>
        ))}
      </AppText>
    );
  };

  const renderInstructionItem = item => {
    return (
      <View
        key={String(item.id)}
        style={[
          styles.instructionRow,
          {flexDirection: isRTL ? 'row' : 'row-reverse'},
        ]}>
        <Ionicons
          name="checkmark-done-outline"
          size={22}
          color={MAIN_COLOR}
          style={styles.instructionIcon}
        />

        <View style={styles.instructionTextWrap}>
          {renderInstructionParts(item.parts)}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <AppHeader
            title={t('order_instructions.title')}
            onBack={() => navigation.goBack()}
          />

          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={MAIN_COLOR} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader
          title={data?.title || t('order_instructions.title')}
          onBack={() => navigation.goBack()}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.heroCard}>
            <OrderSafeHero width="72%" height="72%" />
          </View>

          <View style={styles.instructionsContainer}>
            {(data?.instructions || []).map(renderInstructionItem)}
          </View>

          {!!data?.note && (
            <AppText style={styles.noteText}>
              {data.note}
            </AppText>
          )}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setChecked(prev => !prev)}
            style={[
              styles.checkboxRow,
              {flexDirection: isRTL ? 'row' : 'row-reverse'},
            ]}>
            <View style={[styles.checkbox, checked && styles.checkboxActive]}>
              {checked ? (
                <Ionicons name="checkmark" size={15} color="#FFFFFF" />
              ) : null}
            </View>

            <AppText weight="bold" style={styles.checkboxText}>
              {data?.checkbox_text || t('order_instructions.checkbox_text')}
            </AppText>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.footer}>
          <View
            style={[
              styles.footerButtonsRow,
              {flexDirection: isRTL ? 'row' : 'row-reverse'},
            ]}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.cancelButton}
              onPress={handleCancel}>
              <AppText   style={styles.cancelButtonText}>
                {data?.cancel_button || t('order_instructions.cancel')}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              disabled={!checked}
              style={[
                styles.confirmButton,
                !checked && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirm}>
              <AppText   style={styles.confirmButtonText}>
                {data?.confirm_button || t('order_instructions.confirm')}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OrderSafetyInstructionsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollContent: {
    paddingTop: 16,
    paddingBottom: 140,
  },

  heroCard: {
    height: 174,
    borderRadius: 12,
    backgroundColor: LIGHT_BLUE,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },

  instructionsContainer: {
    marginBottom: 14,
  },

  instructionRow: {
    alignItems: 'flex-start',
    marginBottom: 18,
  },

  instructionIcon: {
    marginTop: 1,
  },

  instructionTextWrap: {
    flex: 1,
    marginHorizontal: 8,
  },

  instructionText: {
    fontSize: 16,
    color: TEXT_DARK,
    lineHeight: 23,
    textAlign: 'auto',
  },

  highlightText: {
    color: ORANGE,
  },

  noteText: {
    fontSize: 13.5,
    color: TEXT_GRAY,
    textAlign: 'center',
    lineHeight: 25,
    marginTop: 6,
    marginBottom: 20,
    paddingHorizontal: 6,
  },

  checkboxRow: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginBottom: 8,
    paddingHorizontal:10
  },

  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: MAIN_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  checkboxActive: {
    backgroundColor: MAIN_COLOR,
  },

  checkboxText: {
    fontSize: 16,
    color: TEXT_DARK,
    marginHorizontal: 10,
    textAlign: 'center',
  },

  footer: {
    position: 'absolute',
    end: 16,
    start: 16,
    bottom: 12,
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F1F1',
  },

  footerButtonsRow: {
    alignItems: 'center',
  },

  confirmButton: {
    flex: 1,
    height: 58,
    borderRadius: 16,
    backgroundColor: MAIN_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: 8,
  },

  confirmButtonDisabled: {
    backgroundColor: '#CDE7F7',
  },

  confirmButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },

  cancelButton: {
    flex: 1,
    height: 58,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: MAIN_COLOR,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 8,
  },

  cancelButtonText: {
    fontSize: 16,
    color: MAIN_COLOR,
  },
});