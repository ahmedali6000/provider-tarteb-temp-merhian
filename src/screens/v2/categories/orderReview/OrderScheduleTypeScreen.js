import React from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useDispatch} from 'react-redux';

import AppHeader from '../../../../shared/AppHeader';
import AppText from '../../../../shared/AppText';
import {SET_ORDER_SCHEDULING_TYPE} from '../../../../redux/actions/ActionTypes';

import FlashIcon from '../../../../../assets/app/svgs/order_now.svg';
import CalendarIcon from '../../../../../assets/app/svgs/order_schedule.svg';

 
 
const {width: SCREEN_WIDTH} = Dimensions.get('window');

const HORIZONTAL_PADDING = 14;
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;
const ICON_SIZE = Math.min(62, Math.max(54, CARD_WIDTH * 0.42));

const OrderScheduleTypeScreen = ({navigation, route}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
   const selectedAddress = route?.params?.selectedAddress || null;
  const category = route?.params?.category || null;
 
  const chooseImmediate = () => {
    dispatch({
      type: SET_ORDER_SCHEDULING_TYPE,
      payload: 'immediate',
    });

    navigation.navigate('OrderDetailsScreen', {
      selectedAddress,
      category,
    });
  };

  const chooseScheduled = () => {
    dispatch({
      type: SET_ORDER_SCHEDULING_TYPE,
      payload: 'scheduled',
    });

    navigation.navigate('OrderScheduleScreen', {
      selectedAddress,
      category,
    });
  };

  const renderOptionCard = ({Icon, title, onPress}) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.optionCard}
        onPress={onPress}>
        <View style={styles.iconWrap}>
          <Icon width={ICON_SIZE} height={ICON_SIZE} />
        </View>

        <AppText weight="bold" style={styles.optionTitle}>
          {title}
        </AppText>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader
          title={t('order_schedule.title')}
          onBack={() => navigation.goBack()}
        />

        <AppText style={styles.subtitle}>
          {t('order_schedule.subtitle')}
        </AppText>

        <View style={styles.optionsRow}>
          {renderOptionCard({
            Icon: CalendarIcon,
            title: t('order_schedule.scheduled'),
            onPress: chooseScheduled,
          })}

          {renderOptionCard({
            Icon: FlashIcon,
            title: t('order_schedule.immediate'),
            onPress: chooseImmediate,
          })}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OrderScheduleTypeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 8,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#8F8F8F',
    textAlign: 'center',
    lineHeight: 21,
  },

  optionsRow: {
    marginTop: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

 optionCard: {
  width: CARD_WIDTH,
  aspectRatio: 1.28,
  minHeight: 102,
  maxHeight: 118,
  borderRadius: 14,
  backgroundColor: '#EDF7FD',
  borderWidth: 1,
  borderColor: '#D6EAF6',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 12,
},

  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionTitle: {
    marginTop: 7,
    fontSize: 14,
    color: '#111111',
    textAlign: 'center',
    lineHeight: 20,
  },
});