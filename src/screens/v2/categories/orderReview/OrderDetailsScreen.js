import React, {useEffect, useMemo, useState} from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Keyboard,
  I18nManager,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';

import AppHeader from '../../../../shared/AppHeader';
import AppText from '../../../../shared/AppText';
// import {FLUSH_ORDER_DATA} from '../../../../redux/actions/ActionTypes';
import AppActionPopup from '../../../../shared/AppActionPopup';
import {
  findOrderDiscount,
  checkOrderCoupon,
} from '../../../../services/orderCheckoutService';
import useAppFont from '../../../../hooks/useAppFont';

const MAIN_COLOR = '#3296D9';
const CARD_BG = '#F7F7F7';
const BORDER = '#E7E7E7';

const OrderDetailsScreen = ({navigation}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const isRTL = I18nManager.isRTL;

    const {fontFamily} = useAppFont();

  const order = useSelector(state => state.order);
  const user = useSelector(state => state.auth.user);
  const selectedAddress = useSelector(state => state.auth.my_selected_address);

 const services = order?.order_services || [];
const orderNotes = order?.order_notes || '';

const isPreviewOrder = order?.preview === true || order?.preview === 'P';
const previewCost = Number(order?.preview_cost || 0);

  const [loadingDiscount, setLoadingDiscount] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(false);

  const [discountData, setDiscountData] = useState(null);
  const [couponData, setCouponData] = useState(null);
  const [usedCoupon, setUsedCoupon] = useState(null);


 const [popupVisible, setPopupVisible] = useState(false);
const [popupData, setPopupData] = useState({
  title: '',
  message: '',
  buttonText: '',
  iconName: 'pricetag-outline',
  iconColor: '#3296D9',
});


  const [confirmSheetVisible, setConfirmSheetVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const currency = t('services.currency');

 const realTotalPrice = useMemo(() => {
  const minCharge = Number(user?.mincharge || 0);

  if (isPreviewOrder) {
    return previewCost;
  }

  const servicesTotal = services.reduce((sum, item) => {
    return sum + Number(item.price || 0) * Number(item.count || 1);
  }, 0);

  return servicesTotal < minCharge ? minCharge : servicesTotal;
}, [services, isPreviewOrder, previewCost, user?.mincharge]);

  const getDiscountAmount = data => {
    if (!data) {
      return 0;
    }

    const amount = Number(data?.discount || data?.value || 0);

    if (data?.type === 'per') {
      return Math.round(realTotalPrice * (amount / 100));
    }

    return amount;
  };

  const autoDiscountAmount = useMemo(() => {
    return getDiscountAmount(discountData);
  }, [discountData, realTotalPrice]);

  const couponDiscountAmount = useMemo(() => {
    return getDiscountAmount(couponData);
  }, [couponData, realTotalPrice]);

  const appliedDiscount = Math.max(autoDiscountAmount, couponDiscountAmount);
  const finalPrice = Math.max(0, realTotalPrice - appliedDiscount);

  const scheduleData = useMemo(() => {
    if (order?.type === 'sch' && order?.sch_data) {
      return {
        date: order.sch_data.date,
        time: order.sch_data.hourStr || order.sch_data.hour,
      };
    }

    const now = new Date();

    return {
      date: now.toLocaleDateString('en-GB'),
      time: t('order_details.immediate_time'),
    };
  }, [order?.type, order?.sch_data, t]);

  useEffect(() => {
    getAutoDiscount();
  }, [realTotalPrice]);

  const getAutoDiscount = async () => {
    if (!order?.order_category_id || !realTotalPrice) {
      return;
    }

    try {
      setLoadingDiscount(true);

      const response = await findOrderDiscount({
        category_id: order.order_category_id,
        price: realTotalPrice,
      });

     if (response?.status === 'yes') {
        setDiscountData(response?.data || null);

        setPopupData({
          title: t('order_details.discount_found_title'),
          message: response?.sent || t('order_details.discount_found_message'),
          buttonText: t('common.ok'),
          iconName: 'pricetag-outline',
          iconColor: '#3296D9',
        });

        setPopupVisible(true);
      } else {
        setDiscountData(null);
      }
    } catch (error) {
      console.log(
        'AUTO DISCOUNT ERROR:',
        error?.response?.data || error?.message,
      );

      setDiscountData(null);
    } finally {
      setLoadingDiscount(false);
    }
  };

  const applyCoupon = async () => {
    Keyboard.dismiss();

    const code = couponCode.trim();

    setCouponMessage('');
    setCouponSuccess(false);

    if (!code) {
      setCouponMessage(t('request.coupon.errors.empty'));
      return;
    }

    if (usedCoupon === code) {
      setCouponMessage(t('request.coupon.errors.repeated'));
      return;
    }

    try {
      const response = await checkOrderCoupon({
        code,
        category_id: order?.order_category_id,
        price: realTotalPrice,
      });

      if (response?.status === 'yes') {
        setCouponData(response?.data || null);
        setUsedCoupon(response?.data?.code || code);
        setCouponSuccess(true);
        setCouponMessage(response?.sent || t('order_details.coupon_applied'));
        return;
      }

      setCouponData(null);
      setCouponSuccess(false);
      setCouponMessage(response?.sent || t('order_details.invalid_coupon'));
    } catch (error) {
      console.log(
        'CHECK COUPON ERROR:',
        error?.response?.data || error?.message,
      );

      setCouponData(null);
      setCouponSuccess(false);
      setCouponMessage(t('order_details.coupon_error'));
    }
  };

  const extractOrderId = data => {
    if (!data) {
      return null;
    }

    if (typeof data === 'number' || typeof data === 'string') {
      return data;
    }

    if (data?.id) {
      return data.id;
    }

    if (data?.order_id) {
      return data.order_id;
    }

    return null;
  };

const buildPayload = () => {
  const mappedServices = isPreviewOrder
    ? []
    : services.map(item => {
        const price = Number(item?.price || 0);
        const quantity = Number(item?.count || 1);

        return {
          category_id: item?.details?.category_id || order?.order_category_id,
          service_id: String(item?.service_id),
          service_name: item?.service_name || item?.service_title || '',
          type: item?.details ? 'cleaning' : 'service',
          price,
          quantity,
          total: price * quantity,
          details: item?.details || null,
        };
      });

  return {
    address_id: selectedAddress?.id,

    latitude: selectedAddress?.latitude,
    longitude: selectedAddress?.longitude,
    area_id: selectedAddress?.area_id,
    gov_id: selectedAddress?.gov_id,

    discount_id: discountData?.id || null,
    coupon: usedCoupon || null,
    coupon_id: couponData?.id || null,

    price: finalPrice,
    withOutDisPrice: realTotalPrice,

    cadoo: order?.cadoo || 0,
    fatherHere: order?.fatherHere ? 1 : 0,

    type: order?.type || 'now',
    sch_data: order?.type === 'sch' ? order?.sch_data : null,

    preview: isPreviewOrder ? 'P' : null,
    preview_cost: isPreviewOrder ? previewCost : null,

    category_id: order?.order_category_id,
    main_category_id: order?.main_category_id,

    notes: orderNotes,

    services: mappedServices,
  };
};

 const submitOrder = () => {
  if (!selectedAddress?.id) {
    setAlertMessage(t('order_details.address_required'));
    setAlertVisible(true);
    return;
  }

 if (!isPreviewOrder && services.length === 0) {
  setAlertMessage('من فضلك اختر خدمة واحدة على الأقل');
  setAlertVisible(true);
  return;
}

if (isPreviewOrder && previewCost <= 0) {
  setAlertMessage('سعر المعاينة غير صحيح');
  setAlertVisible(true);
  return;
}

  const payload = buildPayload();
console.log('ORDER DETAILS PAYLOAD:', JSON.stringify(payload, null, 2));


  navigation.navigate('OrderSafetyInstructionsScreen', {
    nextScreen: 'CreateOrderProgressScreen',
    orderPayload: payload,
  });
};

  const getAddressText = () => {
    return (
      selectedAddress?.address ||
      selectedAddress?.street ||
      t('addresses.no_address')
    );
  };

  const getServiceTitle = item => {
    return item?.service_name || item?.service_title || '';
  };

  const getNormalServicePrice = item => {
    return Number(item?.price || 0) * Number(item?.count || 1);
  };

  const getCleaningInvoiceLines = item => {
    const details = item?.details || {};
    const lines = [];

    const servicePrice = Number(item?.price || details?.total_price || 0);

    if (details?.type === 'full_home') {
      lines.push({
        label: t('order_details.home_cost'),
        value: servicePrice,
      });
    } else if (details?.type === 'kitchen_only') {
      lines.push({
        label: t('order_details.kitchen_cost'),
        value: servicePrice,
      });
    } else if (details?.type === 'kitchen_bathroom') {
      lines.push({
        label: t('order_details.kitchen_bathroom_cost'),
        value: servicePrice,
      });
    }

    const furnitureTotal = (details?.furniture_items || []).reduce(
      (sum, row) => sum + Number(row?.total || 0),
      0,
    );

    if (furnitureTotal > 0) {
      lines.push({
        label: t('order_details.furniture_cleaning'),
        value: furnitureTotal,
      });
    }

    const appliancesTotal = Object.entries(details?.appliances || {}).reduce(
      (sum, [, qty]) => sum + Number(qty || 0) * 100,
      0,
    );

    if (appliancesTotal > 0) {
      lines.push({
        label: t('order_details.appliances_cleaning'),
        value: appliancesTotal,
      });
    }

    if (!lines.length) {
      lines.push({
        label: getServiceTitle(item),
        value: getNormalServicePrice(item),
      });
    }

    return lines;
  };

const invoiceLines = useMemo(() => {
  if (isPreviewOrder) {
    return [
      {
        label: t('preview_order.preview_order', {
          defaultValue: 'طلب معاينة',
        }),
        value: previewCost,
      },
    ];
  }

  return services.flatMap(item => {
    if (item?.details) {
      return getCleaningInvoiceLines(item);
    }

    return [
      {
        label: getServiceTitle(item),
        value: getNormalServicePrice(item),
      },
    ];
  });
}, [services, isPreviewOrder, previewCost, t]);

  const renderInfoItem = ({icon, value}) => {
    return (
      <View style={styles.infoItem}>
        <Ionicons name={icon} size={25} color={MAIN_COLOR} />

        <AppText weight="medium" style={styles.infoText}>
          {value}
        </AppText>
      </View>
    );
  };

  const renderTopInfo = () => {
    return (
      <View style={styles.topInfoCard}>
        {renderInfoItem({
          icon: 'cash-outline',
          value: `${finalPrice}${currency}`,
        })}

        <View style={styles.infoDivider} />

        {renderInfoItem({
          icon: 'time-outline',
          value: scheduleData.time,
        })}

        <View style={styles.infoDivider} />

        {renderInfoItem({
          icon: 'calendar-outline',
          value: scheduleData.date,
        })}
      </View>
    );
  };

  const renderAddress = () => {
    return (
      <View style={styles.addressCard}>
        <Ionicons name="location-outline" size={25} color={MAIN_COLOR} />

        <AppText numberOfLines={1} style={styles.addressText}>
          {getAddressText()}
        </AppText>
      </View>
    );
  };

  const renderCoupon = () => {
    return (
      <View style={styles.couponSection}>
        <AppText weight="medium" style={styles.couponTitle}>
          {t('order_details.has_coupon')}
        </AppText>

        <View style={styles.couponRow}>
          

          <TextInput
            value={couponCode}
            onChangeText={text => {
              setCouponCode(text);
              setCouponMessage('');
              setCouponSuccess(false);
            }}
            placeholder={t('order_details.coupon_placeholder')}
            placeholderTextColor="#777"
            style={[
              styles.couponInput,
               {fontFamily},
              {textAlign: isRTL ? 'right' : 'left'},
            ]}
          />
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.applyCouponButton}
            onPress={applyCoupon}>
            <AppText weight="bold" style={styles.applyCouponText}>
              {t('order_details.apply')}
            </AppText>
          </TouchableOpacity>
        </View>

        {couponMessage ? (
          <AppText
            style={[
              styles.couponMessage,
              couponSuccess ? styles.successText : styles.errorText,
            ]}>
            {couponMessage}
          </AppText>
        ) : null}
      </View>
    );
  };

  const renderInvoiceRow = ({label, value, isDiscount = false, isTotal = false}) => {
    return (
      <View style={[styles.invoiceRow, isTotal && styles.totalRow]}>
     

        <AppText
          weight={isTotal ? 'bold' : 'regular'}
          style={[styles.invoiceLabel, isTotal && styles.totalLabel]}>
          {label}
        </AppText>

           <View style={styles.priceWrap}>
          <AppText
            weight={isTotal ? 'bold' : 'medium'}
            style={[
              styles.invoicePrice,
              isDiscount && styles.discountPrice,
              isTotal && styles.totalPrice,
            ]}>
            {isDiscount ? `-${value}` : value}
          </AppText>

          <AppText style={styles.currencyText}>{currency}</AppText>
        </View>
      </View>
    );
  };

  const renderInvoice = () => {
    return (
      <View style={styles.invoiceSection}>
        <AppText weight="medium" style={styles.invoiceTitle}>
          {t('order_details.invoice_details')}
        </AppText>

        <View style={styles.invoiceCard}>
          {invoiceLines.map((item, index) => (
            <View key={`${item.label}_${index}`}>
              {renderInvoiceRow({
                label: item.label,
                value: item.value,
              })}
            </View>
          ))}

          {renderInvoiceRow({
            label: t('order_details.discount'),
            value: appliedDiscount,
            isDiscount: true,
          })}

          <View style={styles.invoiceDivider} />

          {renderInvoiceRow({
            label: t('order_details.total'),
            value: finalPrice,
            isTotal: true,
          })}
        </View>
      </View>
    );
  };

  const renderNotes = () => {
    if (!orderNotes) {
      return null;
    }

    return (
      <View style={styles.notesSection}>
        <AppText weight="medium" style={styles.notesTitle}>
          {t('order_details.your_notes')}
        </AppText>

        <View style={styles.notesBox}>
          <AppText style={styles.notesText}>{orderNotes}</AppText>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    return (
      <View style={styles.footer}>
        <View style={styles.policyRow}>
          <Ionicons
          style={{fontWeight:'bold'}}
            name="checkmark-done-outline"
            size={18}
            color={MAIN_COLOR}
          />

          <AppText weight='bold' style={styles.policyText}>
            {t('order_details.price_note')}
          </AppText>
        </View>

        <TouchableOpacity
  activeOpacity={0.9}
  style={styles.confirmButton}
  onPress={submitOrder}>
  <AppText weight="bold" style={styles.confirmText}>
    {t('order_details.confirm_order')}
  </AppText>
</TouchableOpacity>
      </View>
    );
  };
 
  // const renderConfirmSheet = () => {
  //   return (
  //     <Modal
  //       transparent
  //       visible={confirmSheetVisible}
  //       animationType="slide"
  //       onRequestClose={() => setConfirmSheetVisible(false)}>
  //       <Pressable
  //         style={styles.sheetOverlay}
  //         onPress={() => setConfirmSheetVisible(false)}>
  //         <Pressable style={styles.bottomSheet} onPress={() => {}}>
  //           <View style={styles.sheetHandle} />

  //           <Ionicons
  //             name="shield-checkmark-outline"
  //             size={42}
  //             color={MAIN_COLOR}
  //             style={styles.sheetIcon}
  //           />

  //           <AppText weight="bold" style={styles.sheetTitle}>
  //             {t('order_details.before_confirm_title')}
  //           </AppText>

  //           <AppText style={styles.sheetDesc}>
  //             {t('order_details.before_confirm_desc')}
  //           </AppText>

  //           <View style={styles.sheetActions}>
  //             <TouchableOpacity
  //               activeOpacity={0.85}
  //               style={styles.cancelButton}
  //               onPress={() => setConfirmSheetVisible(false)}>
  //               <AppText weight="bold" style={styles.cancelButtonText}>
  //                 {t('common.cancel')}
  //               </AppText>
  //             </TouchableOpacity>

  //             <TouchableOpacity
  //               activeOpacity={0.85}
  //               style={styles.sheetConfirmButton}
  //               onPress={submitOrder}>
  //               {submitting ? (
  //                 <ActivityIndicator size="small" color="#FFFFFF" />
  //               ) : (
  //                 <AppText weight="bold" style={styles.sheetConfirmText}>
  //                   {t('order_details.confirm_order')}
  //                 </AppText>
  //               )}
  //             </TouchableOpacity>
  //           </View>
  //         </Pressable>
  //       </Pressable>
  //     </Modal>
  //   );
  // };

  const renderAlert = () => {
    return (
      <Modal
        transparent
        visible={alertVisible}
        animationType="fade"
        onRequestClose={() => setAlertVisible(false)}>
        <Pressable
          style={styles.alertOverlay}
          onPress={() => setAlertVisible(false)}>
          <Pressable style={styles.alertBox} onPress={() => {}}>
            <View style={styles.alertIconBox}>
              <Ionicons name="warning-outline" size={34} color="#FFFFFF" />
            </View>

            <AppText weight="bold" style={styles.alertTitle}>
              {t('order_details.alert')}
            </AppText>

            <AppText style={styles.alertMessage}>
              {alertMessage}
            </AppText>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.alertButton}
              onPress={() => setAlertVisible(false)}>
              <AppText weight="bold" style={styles.alertButtonText}>
                {t('common.ok')}
              </AppText>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader
          title={t('order_details.title')}
          onBack={() => navigation.goBack()}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}>
          {renderTopInfo()}
          {renderAddress()}
          {renderCoupon()}
          {renderInvoice()}
          {renderNotes()}
        </ScrollView>

        {loadingDiscount ? (
          <View style={styles.discountLoader}>
            <ActivityIndicator size="small" color={MAIN_COLOR} />
          </View>
        ) : null}

        {renderFooter()}
        {/* {renderConfirmSheet()} */}
        {renderAlert()}
      </View>

      <AppActionPopup
        visible={popupVisible}
        title={popupData.title}
        message={popupData.message}
        buttonText={popupData.buttonText}
        iconName={popupData.iconName}
        iconColor={popupData.iconColor}
        onClose={() => setPopupVisible(false)}
      />
          </SafeAreaView>
        );
      };

export default OrderDetailsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 132,
  },

  topInfoCard: {
    minHeight: 58,
    borderRadius: 12,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical:15
  },
  infoText: {
    marginTop: 5,
    fontSize: 14,
    color: '#222222',
    textAlign: 'center',
  },
  infoDivider: {
    width: 1,
    height: 27,
    backgroundColor: '#E1E1E1',
  },

  addressCard: {
    marginTop: 12,
    minHeight: 38,
    borderRadius: 10,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'flex-start'
  },
  addressText: {
    // flex: 1,
    marginStart: 7,
    fontSize: 11.5,
    color: '#111111',
    textAlign: 'auto',
  },

  couponSection: {
    marginTop: 14,
    paddingHorizontal:5
  },
  couponTitle: {
    fontSize: 14,
    color: '#111111',
    textAlign: 'auto',
    marginBottom: 7,
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  applyCouponButton: {
    
    borderRadius: 11,
    borderWidth: 1,
    borderColor: MAIN_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: 8,
    padding:13,
    backgroundColor: '#FFFFFF',
  },
  applyCouponText: {
    fontSize: 14,
    color: MAIN_COLOR,
  },
  couponInput: {
    flex: 1,
    height: 52,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111111',
  },
  couponMessage: {
    marginTop: 6,
    fontSize: 11,
    textAlign: 'center',
  },
  successText: {
    color: 'green',
  },
  errorText: {
    color: '#EF4444',
  },

  invoiceSection: {
    marginTop: 18,
    paddingHorizontal:5
  },
  invoiceTitle: {
    marginStart:8,
    fontSize: 14,
    color: '#111111',
    textAlign: 'auto',
    marginBottom: 9,
  },
  invoiceCard: {
    borderRadius: 12,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  invoiceRow: {
    minHeight: 31,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalRow: {
    minHeight: 33,
  },
  invoiceLabel: {
    flex: 1,
    fontSize: 14,
    color: '#8A8A8A',
    textAlign: 'auto',
  },
  totalLabel: {
    color: '#111111',
    fontSize: 15,
  },
  priceWrap: {
    minWidth: 72,
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor:'red',
    justifyContent:'flex-end'
    
  },
  invoicePrice: {
    fontSize: 14,
    color: '#111111',
  },
  discountPrice: {
    color: '#111111',
  },
  totalPrice: {
    fontSize: 15,
    color: '#111111',
  },
  currencyText: {
    fontSize: 10.5,
    color: '#555555',
    marginStart: 3,
  },
  invoiceDivider: {
    height: 1,
    backgroundColor: '#E1E1E1',
    marginVertical: 7,
  },

  notesSection: {
    marginTop: 18,
  },
  notesTitle: {
    fontSize: 14,
    color: '#111111',
    textAlign: 'auto',
    marginBottom: 8,
  },
  notesBox: {
    minHeight: 55,
    borderRadius: 10,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  notesText: {
    fontSize: 14,
    color: '#111111',
    textAlign: 'auto',
    lineHeight: 20,
  },

  discountLoader: {
    position: 'absolute',
    top: 78,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 12,
    elevation: 3,
  },

  footer: {
    position: 'absolute',
    end: 14,
    start: 14,
    bottom: 12,
    backgroundColor: '#FFFFFF',
    paddingTop: 9,
  },
  policyRow: {
    minHeight: 31,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom:3,
    marginStart:5
  },
  policyText: {
    fontSize: 14,
    color: '#111111',
    marginStart: 5,
    textAlign: 'auto',
     
  },
  confirmButton: {
    height: 49,
    borderRadius: 12,
    backgroundColor: MAIN_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontSize: 14,
    color: '#FFFFFF',
  },

  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopStartRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 24,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 10,
    backgroundColor: '#D1D1D1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetIcon: {
    alignSelf: 'center',
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 19,
    color: '#111111',
    textAlign: 'center',
    marginBottom: 8,
  },
  sheetDesc: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 18,
  },
  sheetActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MAIN_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 10,
  },
  cancelButtonText: {
    fontSize: 13,
    color: MAIN_COLOR,
  },
  sheetConfirmButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: MAIN_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetConfirmText: {
    fontSize: 13,
    color: '#FFFFFF',
  },

  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  alertBox: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingBottom: 20,
    alignItems: 'center',
  },
  alertIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: MAIN_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -32,
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 18,
    color: MAIN_COLOR,
    textAlign: 'center',
  },
  alertMessage: {
    marginTop: 10,
    fontSize: 13,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 22,
  },
  alertButton: {
    marginTop: 18,
    height: 44,
    minWidth: 120,
    borderRadius: 12,
    backgroundColor: MAIN_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
});