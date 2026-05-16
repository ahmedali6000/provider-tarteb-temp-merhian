import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  I18nManager,
  Modal,
  Pressable,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useTranslation} from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';

import AppText from '../../../../shared/AppText';
import {
  getOrderDetails,
  getCancellationReasons,
  cancelOrder,
  submitProviderReview,
} from '../../../../services/orderService';

const COLORS = {
  main: '#3296D9',
  mainSoft: '#EAF6FE',

  blue: '#4A73E8',
  blueLight: '#EEF5FF',

  orange: '#F7931E',
  orangeLight: '#FFF1E2',

  green: '#22C55E',
  greenLight: '#EAFBF0',

  red: '#E53935',
  redLight: '#FEECEF',

  text: '#111111',
  muted: '#8A8A8A',
  border: '#E8E8E8',
  card: '#F8F8F8',
  white: '#FFFFFF',
};

const OrderFullDetailsScreen = ({navigation, route}) => {
  const {t} = useTranslation();
  const isRTL = I18nManager.isRTL;

  const orderId = route?.params?.order_id;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  const [cancelSheetVisible, setCancelSheetVisible] = useState(false);
  const [cancelReasons, setCancelReasons] = useState([]);
  const [loadingCancelReasons, setLoadingCancelReasons] = useState(false);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  const [selectedCancelReason, setSelectedCancelReason] = useState(null);
  const [otherCancelReason, setOtherCancelReason] = useState('');

  const [ratingVisible, setRatingVisible] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const currency = t('services.currency', {defaultValue: 'ج.م'});

  const headerRowDirection = isRTL ? 'row' : 'row-reverse';
  const rowDirection = isRTL ? 'row' : 'row-reverse';
  const providerRowDirection = isRTL ? 'row' : 'row-reverse';

  const tr = (key, fallback, options = {}) =>
    t(key, {defaultValue: fallback, ...options});

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (
      order?.status === 'complete' &&
      order?.provider &&
      order?.has_review !== true
    ) {
      setRatingVisible(true);
    }
  }, [order?.status, order?.provider, order?.has_review]);

  const fetchOrder = async () => {
    try {
      setLoading(true);

      const response = await getOrderDetails(orderId);
      setOrder(response?.data || null);
    } catch (error) {
      console.log(
        'ORDER FULL DETAILS ERROR:',
        error?.response?.data || error?.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCancelReasons = async () => {
    try {
      setLoadingCancelReasons(true);

      const response = await getCancellationReasons();
      setCancelReasons(response?.data || []);
    } catch (error) {
      console.log(
        'CANCEL REASONS ERROR:',
        error?.response?.data || error?.message,
      );

      setCancelReasons([]);
    } finally {
      setLoadingCancelReasons(false);
    }
  };

  const isPending = order?.status === 'pending';
  const isAccepted = order?.status === 'accepted';
  const isComplete = order?.status === 'complete';
  const isCanceled = order?.status === 'canceled';

  const canCancelOrder = isPending || isAccepted;

  const shouldShowProviderHero =
    !!order?.provider && (isAccepted || isComplete || isCanceled);

  const statusMeta = useMemo(() => {
    if (order?.status === 'accepted') {
      return {
        label: tr('order_view_details.status.in_progress', 'جاري'),
        color: COLORS.blue,
        bg: COLORS.blueLight,
      };
    }

    if (order?.status === 'complete') {
      return {
        label: tr('order_view_details.status.completed', 'مكتمل'),
        color: COLORS.green,
        bg: COLORS.greenLight,
      };
    }

    if (order?.status === 'canceled') {
      return {
        label: tr('order_view_details.status.canceled', 'ملغي'),
        color: COLORS.red,
        bg: COLORS.redLight,
      };
    }

    return {
      label: tr('order_view_details.status.pending', 'قيد الانتظار'),
      color: COLORS.orange,
      bg: COLORS.orangeLight,
    };
  }, [order?.status]);

  const displayDate = useMemo(() => {
    if (order?.date) {
      return order.date;
    }

    if (order?.created_at) {
      return String(order.created_at).split(' ')[0];
    }

    return '-';
  }, [order]);

  const displayTime = useMemo(() => {
    if (order?.hour_str) {
      return order.hour_str;
    }

    if (order?.hour) {
      return order.hour;
    }

    return tr('order_view_details.immediate', 'فوري');
  }, [order]);

  const invoiceLines = useMemo(() => {
    const services = order?.services || [];

    if (!services.length) {
      return [
        {
          label:
            order?.title ||
            tr('order_view_details.preview_order', 'طلب معاينة'),
          value: Number(order?.preview_price || order?.price || 0),
        },
      ];
    }

    return services.map(item => ({
      label:
        item?.service_name ||
        item?.name ||
        tr('order_view_details.service', 'خدمة'),
      value: Number(item?.total || item?.price || 0),
    }));
  }, [order]);

  const invoiceTotal = useMemo(() => {
    return invoiceLines.reduce((sum, item) => {
      return sum + Number(item.value || 0);
    }, 0);
  }, [invoiceLines]);

  const finalTotal = Number(order?.price || invoiceTotal || 0);

  const formatMoney = value => {
    const num = Number(value || 0);
    return Number.isInteger(num) ? String(num) : num.toFixed(2);
  };

  const ratingLabels = {
    1: tr('rate.verybad', 'غير راض'),
    2: tr('rate.notBad', 'أقل من المتوقع'),
    3: tr('rate.Normal', 'مقبولة'),
    4: tr('rate.Good', 'جيدة'),
    5: tr('rate.veryGood', 'ممتازة'),
  };

  const submitRating = async () => {
    if (!order?.id || !order?.provider?.id) {
      return;
    }

    try {
      setSubmittingReview(true);

      const response = await submitProviderReview({
        orderId: order.id,
        providerId: order.provider.id,
        rate: ratingValue,
        review: reviewText?.trim() || ratingLabels[ratingValue],
      });

      if (response?.status) {
        setRatingVisible(false);
        setReviewText('');

        await fetchOrder();
        return;
      }

      Alert.alert(
        tr('common.error', 'حدث خطأ'),
        response?.message || tr('rate.submit_failed', 'تعذر إرسال التقييم'),
      );
    } catch (error) {
      console.log(
        'SUBMIT REVIEW ERROR:',
        error?.response?.data || error?.message,
      );

      Alert.alert(
        tr('common.error', 'حدث خطأ'),
        error?.response?.data?.message ||
          tr('rate.submit_failed', 'تعذر إرسال التقييم'),
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const onCancelOrder = () => {
    setSelectedCancelReason(null);
    setOtherCancelReason('');
    setCancelSheetVisible(true);
    fetchCancelReasons();
  };

  const closeCancelSheet = () => {
    if (cancelSubmitting) {
      return;
    }

    setCancelSheetVisible(false);
  };

  const confirmCancelOrder = async () => {
    if (!selectedCancelReason) {
      return;
    }

    const selectedReasonObj = cancelReasons.find(
      item => Number(item.id) === Number(selectedCancelReason),
    );

    const isOther =
      selectedReasonObj?.requires_custom_reason === true ||
      selectedReasonObj?.requires_custom_reason === 1;

    if (isOther && !otherCancelReason.trim()) {
      return;
    }

    try {
      setCancelSubmitting(true);

      const response = await cancelOrder({
        orderId: order?.id,
        reasonId: selectedCancelReason,
        customReason: isOther ? otherCancelReason.trim() : null,
      });

      if (response?.status) {
        setCancelSheetVisible(false);

        await fetchOrder();

        Alert.alert(
          tr('order_view_details.cancel_success_title', 'تم الإلغاء'),
          response?.message ||
            tr(
              'order_view_details.cancel_success_message',
              'تم إلغاء الطلب بنجاح',
            ),
        );

        navigation.goBack();
      }
    } catch (error) {
      console.log(
        'CANCEL ORDER ERROR:',
        error?.response?.data || error?.message,
      );

      Alert.alert(
        tr('order_view_details.cancel_error_title', 'حدث خطأ'),
        error?.response?.data?.message ||
          tr(
            'order_view_details.cancel_error_message',
            'تعذر إلغاء الطلب، حاول مرة أخرى.',
          ),
      );
    } finally {
      setCancelSubmitting(false);
    }
  };

  const renderHeader = () => (
    <View style={[styles.headerRow, {flexDirection: headerRowDirection}]}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Ionicons
          name={isRTL ? 'arrow-forward' : 'arrow-back'}
          size={24}
          color={COLORS.text}
        />
      </TouchableOpacity>

      <AppText weight="bold" style={styles.headerTitle}>
        {tr('order_view_details.order_number', 'طلب #{{id}}', {
          id: order?.id,
        })}
      </AppText>

      {canCancelOrder ? (
        <TouchableOpacity activeOpacity={0.8} onPress={onCancelOrder}>
          <AppText weight="bold" style={styles.cancelText}>
            {tr('order_view_details.cancel_order', 'إلغاء الطلب')}
          </AppText>
        </TouchableOpacity>
      ) : (
        <View style={styles.headerPlaceholder} />
      )}
    </View>
  );

  const renderProviderImage = provider => {
    if (provider?.image) {
      return (
        <Image
          source={{uri: provider.image}}
          style={styles.providerHeroImage}
        />
      );
    }

    return (
      <View style={[styles.providerHeroImage, styles.providerHeroImageFallback]}>
        <Ionicons name="person-outline" size={28} color={COLORS.main} />
      </View>
    );
  };

  const renderProviderHero = () => {
    if (!shouldShowProviderHero) {
      return null;
    }

    const provider = order?.provider;
    const providerRate = Number(provider?.rate || 0);

    return (
      <LinearGradient
        colors={['#CDEBFF', '#BFE6FF', '#8FC9FF']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.providerHero}>
            <View style={styles.son}>
        <View
          style={[
            styles.providerHeroTop,
            {flexDirection: providerRowDirection},
          ]}>
          {renderProviderImage(provider)}

          <View style={styles.providerHeroInfo}>
            <AppText weight="bold" style={styles.providerHeroName}>
              {provider?.name || tr('order_view_details.provider', 'الفني')}
            </AppText>

            <AppText style={styles.providerHeroJob}>
              {provider?.job ||
                order?.category_name ||
                tr('order_view_details.technician', 'فني')}
            </AppText>

            <View style={styles.providerHeroStars}>
              {[1, 2, 3, 4, 5].map(item => (
                <Ionicons
                  key={item}
                  name={item <= providerRate ? 'star' : 'star-outline'}
                  size={14}
                  color={COLORS.orange}
                />
              ))}
            </View>

            <View
              style={[
                styles.providerHeroYears,
                {flexDirection: rowDirection},
              ]}>
              <Ionicons
                name="briefcase-outline"
                size={14}
                color={COLORS.main}
              />

              <AppText style={styles.providerHeroYearsText}>
                {tr('order_view_details.provider_years', '{{count}} سنوات', {
                  count: provider?.experience_years || 3,
                })}
              </AppText>
            </View>
          </View>
        </View>

        {isComplete ? (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.invoicePdfBtn}
            onPress={() => {
              console.log('download pdf', order?.id);
            }}>
            <Ionicons name="download-outline" size={18} color={COLORS.main} />

            <AppText weight="bold" style={styles.invoicePdfText}>
              {tr(
                'order_view_details.download_invoice_pdf',
                'تحميل الفاتورة PDF',
              )}
            </AppText>
          </TouchableOpacity>
        ) : null}

        </View>
      </LinearGradient>
    );
  };

  const renderOrderInfoCard = () => (
    <>
      <AppText weight="bold" style={styles.sectionTitle}>
        {tr('order_view_details.order_info', 'معلومات الطلب')}
      </AppText>

      <View style={[styles.orderInfoCard, {flexDirection: rowDirection}]}>
        <View style={[styles.orderInfoCol, {flexDirection: rowDirection}]}>
          <AppText style={styles.orderInfoLabel}>
            {tr('order_view_details.order_id', 'رقم الطلب')}
          </AppText>

          <View style={styles.idPill}>
            <AppText weight="bold" style={styles.idPillText}>
              #{order?.id}
            </AppText>
          </View>
        </View>

        <View style={styles.verticalDivider} />

        <View style={[styles.orderInfoCol, {flexDirection: rowDirection}]}>
          <AppText style={styles.orderInfoLabel}>
            {tr('order_view_details.order_status', 'حالة الطلب')}
          </AppText>

          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: statusMeta.bg,
              },
            ]}>
            <AppText
              weight="bold"
              style={[
                styles.statusPillText,
                {
                  color: statusMeta.color,
                },
              ]}>
              {statusMeta.label}
            </AppText>
          </View>
        </View>
      </View>
    </>
  );

  const renderScheduleCard = () => (
    <View style={[styles.scheduleCard, {flexDirection: rowDirection}]}>
      <ScheduleItem
        icon="calendar-outline"
        label={displayDate}
        color={COLORS.main}
      />

      <View style={styles.verticalDividerSmall} />

      <ScheduleItem
        icon="time-outline"
        label={displayTime}
        color={COLORS.main}
      />

      <View style={styles.verticalDividerSmall} />

      <ScheduleItem
        icon="cash-outline"
        label={`${formatMoney(order?.price)}${currency}`}
        color={COLORS.main}
      />
    </View>
  );

  const renderAddressCard = () => (
    <View style={[styles.addressCard, {flexDirection: rowDirection}]}>
      <Ionicons name="location-outline" size={22} color={COLORS.main} />

      <AppText weight="medium" style={styles.addressText} numberOfLines={1}>
        {order?.address?.text ||
          order?.address ||
          tr('order_view_details.no_address', 'غير محدد')}
      </AppText>
    </View>
  );

  const renderInvoice = () => (
    <>
      <AppText weight="bold" style={styles.sectionTitle}>
        {tr('order_view_details.invoice_details', 'تفاصيل الفاتورة')}
      </AppText>

      <View style={styles.invoiceCard}>
        {invoiceLines.map((item, index) => (
          <InvoiceRow
            key={`${item.label}_${index}`}
            label={item.label}
            value={formatMoney(item.value)}
            currency={currency}
            rowDirection={rowDirection}
            muted
          />
        ))}

        <View style={styles.invoiceDivider} />

        <InvoiceRow
          label={tr('order_view_details.total', 'الإجمالي')}
          value={formatMoney(finalTotal)}
          currency={currency}
          rowDirection={rowDirection}
          bold
        />
      </View>
    </>
  );

  const renderNotes = () => {
    if (!order?.notes) {
      return null;
    }

    return (
      <>
        <AppText weight="bold" style={styles.sectionTitle}>
          {tr('order_view_details.your_notes', 'ملاحظاتك')}
        </AppText>

        <View style={styles.notesBox}>
          <AppText weight="medium" style={styles.notesText}>
            {order.notes}
          </AppText>
        </View>
      </>
    );
  };

  const renderCancelReasonBox = () => {
    if (!isCanceled) {
      return null;
    }

    const reasonText =
      order?.cancellation_reason_text ||
      order?.cancel_reason ||
      order?.cancellation_reason_label ||
      null;

    if (!reasonText) {
      return null;
    }

    return (
      <>
        <AppText weight="bold" style={styles.sectionTitle}>
          {tr('order_view_details.cancel_reason_title', 'سبب الإلغاء')}
        </AppText>

        <View style={styles.cancelReasonBox}>
          <AppText weight="medium" style={styles.cancelReasonText}>
            {reasonText}
          </AppText>
        </View>
      </>
    );
  };

  const renderCancelReasons = () => {
    if (loadingCancelReasons) {
      return (
        <View style={styles.cancelReasonsLoader}>
          <ActivityIndicator size="small" color={COLORS.main} />

          <AppText style={styles.cancelReasonsLoaderText}>
            {tr(
              'order_view_details.cancel_sheet.loading_reasons',
              'جاري تحميل الأسباب...',
            )}
          </AppText>
        </View>
      );
    }

    if (!cancelReasons.length) {
      return (
        <View style={styles.cancelReasonsLoader}>
          <Ionicons
            name="alert-circle-outline"
            size={26}
            color={COLORS.muted}
          />

          <AppText style={styles.cancelReasonsLoaderText}>
            {tr(
              'order_view_details.cancel_sheet.no_reasons',
              'لا توجد أسباب متاحة حاليًا',
            )}
          </AppText>
        </View>
      );
    }

    return cancelReasons.map(reason => {
      const selected = Number(selectedCancelReason) === Number(reason.id);

      return (
        <TouchableOpacity
          key={String(reason.id)}
          activeOpacity={0.85}
          style={[
            styles.reasonItem,
            selected && styles.reasonItemSelected,
            {flexDirection: rowDirection},
          ]}
          onPress={() => {
            setSelectedCancelReason(reason.id);

            if (
              reason.requires_custom_reason !== true &&
              reason.requires_custom_reason !== 1
            ) {
              setOtherCancelReason('');
            }
          }}>
          <View
            style={[
              styles.radioOuter,
              selected && styles.radioOuterSelected,
            ]}>
            {selected ? <View style={styles.radioInner} /> : null}
          </View>

          <AppText
            weight={selected ? 'bold' : 'regular'}
            style={[
              styles.reasonText,
              selected && styles.reasonTextSelected,
            ]}>
            {reason.reason}
          </AppText>
        </TouchableOpacity>
      );
    });
  };

  const renderCancelSheet = () => {
    const selectedReasonObj = cancelReasons.find(
      item => Number(item.id) === Number(selectedCancelReason),
    );

    const isOther =
      selectedReasonObj?.requires_custom_reason === true ||
      selectedReasonObj?.requires_custom_reason === 1;

    const canCancel =
      !!selectedCancelReason &&
      (!isOther || otherCancelReason.trim().length > 0) &&
      !cancelSubmitting &&
      !loadingCancelReasons;

    return (
      <Modal
        visible={cancelSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={closeCancelSheet}>
        <Pressable style={styles.cancelOverlay} onPress={closeCancelSheet}>
          <Pressable style={styles.cancelSheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />

            <AppText weight="bold" style={styles.cancelSheetTitle}>
              {tr('order_view_details.cancel_sheet.title', 'إلغاء الطلب')}
            </AppText>

            <AppText style={styles.cancelSheetSubtitle}>
              {tr(
                'order_view_details.cancel_sheet.subtitle',
                'يؤسفنا إلغاءك للطلب، هل يمكنك أخبارنا بالسبب لنتمكن من تحسين تجربتك القادمة؟',
              )}
            </AppText>

            <View style={styles.reasonsWrap}>{renderCancelReasons()}</View>

            {isOther ? (
              <TextInput
                value={otherCancelReason}
                onChangeText={setOtherCancelReason}
                placeholder={tr(
                  'order_view_details.cancel_sheet.other_placeholder',
                  'أخبرنا ما سبب الإلغاء',
                )}
                placeholderTextColor="#9CA3AF"
                multiline
                editable={!cancelSubmitting}
                textAlign={isRTL ? 'right' : 'left'}
                textAlignVertical="top"
                style={styles.otherReasonInput}
              />
            ) : null}

            <AppText style={styles.cancelWarning}>
              {tr(
                'order_view_details.cancel_sheet.warning_before',
                'يرجى العلم أنه سيتم خصم',
              )}{' '}
              <AppText weight="bold" style={styles.cancelWarningAmount}>
                {tr('order_view_details.cancel_sheet.amount', '20 جنيهًا')}
              </AppText>{' '}
              {tr(
                'order_view_details.cancel_sheet.warning_after',
                'كرسوم إلغاء، وذلك لتعويض الفني عن وقت الحجز وتجهيز الطلب.',
              )}
            </AppText>

            <View style={[styles.cancelActions, {flexDirection: rowDirection}]}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.keepOrderBtn}
                disabled={cancelSubmitting}
                onPress={closeCancelSheet}>
                <AppText weight="bold" style={styles.keepOrderText}>
                  {tr(
                    'order_view_details.cancel_sheet.keep_order',
                    'إكمال الطلب',
                  )}
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={canCancel ? 0.9 : 1}
                disabled={!canCancel}
                style={[
                  styles.cancelOrderBtn,
                  !canCancel && styles.cancelOrderBtnDisabled,
                ]}
                onPress={confirmCancelOrder}>
                {cancelSubmitting ? (
                  <ActivityIndicator size="small" color={COLORS.main} />
                ) : (
                  <>
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={canCancel ? COLORS.main : '#BDBDBD'}
                    />

                    <AppText
                      weight="bold"
                      style={[
                        styles.cancelOrderText,
                        !canCancel && styles.cancelOrderTextDisabled,
                      ]}>
                      {tr(
                        'order_view_details.cancel_sheet.cancel_order',
                        'إلغاء الطلب',
                      )}
                    </AppText>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  const renderRatingStars = () => {
    return (
      <View style={styles.ratingStarsRow}>
        {[1, 2, 3, 4, 5].map(star => {
          const active = star <= ratingValue;

          return (
            <TouchableOpacity
              key={String(star)}
              activeOpacity={0.8}
              style={styles.ratingStarBtn}
              onPress={() => setRatingValue(star)}>
              <Ionicons
                name={active ? 'star' : 'star-outline'}
                size={28}
                color={COLORS.orange}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderRatingSheet = () => {
    return (
      <Modal
        visible={ratingVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {}}>
        <View style={styles.ratingOverlay}>
          <Pressable style={styles.ratingSheet} onPress={() => {}}>
            <View style={styles.ratingHandle} />

            <AppText weight="bold" style={styles.ratingTitle}>
              {tr('rate.title', 'ما تقييمك للخدمة؟')}
            </AppText>

            <AppText style={styles.ratingSubtitle}>
              {tr('rate.subtitle', 'رأيك يساعدنا على تحسين الخدمة.')}
            </AppText>

            {renderRatingStars()}

            <AppText weight="medium" style={styles.ratingLabel}>
              {ratingLabels[ratingValue]}
            </AppText>

            <AppText style={styles.reviewLabel}>
              {tr('rate.add_review_optional', 'أضف تعليقًا (اختياري)')}
            </AppText>

            <TextInput
              value={reviewText}
              onChangeText={setReviewText}
              placeholder={tr(
                'rate.placeholder',
                'اكتب ملاحظاتك عن الخدمة أو الفني...',
              )}
              placeholderTextColor="#9CA3AF"
              multiline
              textAlign={isRTL ? 'right' : 'left'}
              textAlignVertical="top"
              style={styles.reviewInput}
            />

            <TouchableOpacity
              activeOpacity={0.9}
              disabled={submittingReview}
              style={[
                styles.submitRatingBtn,
                submittingReview && styles.submitRatingBtnDisabled,
              ]}
              onPress={submitRating}>
              {submittingReview ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <AppText weight="bold" style={styles.submitRatingText}>
                  {tr('rate.btn', 'إرسال التقييم')}
                </AppText>
              )}
            </TouchableOpacity>
          </Pressable>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.main} />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loader}>
          <AppText style={styles.emptyText}>
            {tr(
              'order_view_details.order_not_found',
              'لم يتم العثور على الطلب',
            )}
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {renderHeader()}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}>
          {renderProviderHero()}
          {renderOrderInfoCard()}
          {renderScheduleCard()}
          {renderAddressCard()}
          {renderInvoice()}
          {renderNotes()}
          {renderCancelReasonBox()}
        </ScrollView>

        {renderCancelSheet()}
        {renderRatingSheet()}
      </View>
    </SafeAreaView>
  );
};

const ScheduleItem = ({icon, label, color}) => {
  return (
    <View style={styles.scheduleItem}>
      <Ionicons name={icon} size={25} color={color} />

      <AppText weight="medium" style={styles.scheduleText} numberOfLines={1}>
        {label || '-'}
      </AppText>
    </View>
  );
};

const InvoiceRow = ({
  label,
  value,
  currency,
  rowDirection,
  bold = false,
  muted = false,
}) => {
  return (
    <View style={[styles.invoiceRow, {flexDirection: rowDirection}]}>
      <AppText
        weight={bold ? 'bold' : 'regular'}
        style={[
          styles.invoiceLabel,
          muted && styles.invoiceLabelMuted,
          bold && styles.invoiceTotalLabel,
        ]}>
        {label}
      </AppText>

      <View style={[styles.invoicePriceWrap, {flexDirection: rowDirection}]}>
        <AppText
          weight={bold ? 'bold' : 'medium'}
          style={[styles.invoicePrice, bold && styles.invoiceTotalPrice]}>
          {value}
        </AppText>

        <AppText style={styles.currencyText}>{currency}</AppText>
      </View>
    </View>
  );
};

export default OrderFullDetailsScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.muted,
  },

  headerRow: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  cancelText: {
    color: COLORS.red,
    fontSize: 14,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 20,
  },
  headerPlaceholder: {
    width: 56,
  },
  backButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: {
    paddingBottom: 40,
  },

  // providerHero: {
  //   borderRadius: 18,
  //   minHeight: 132,
  //   padding: 12,
  //   marginBottom: 18,
  // },
    providerHero: {
    borderRadius: 18,
     
     marginBottom: 18,
    flex:1,
    
  },
  son:{
     marginVertical: 20,
    //  backgroundColor:'red'
  },
  providerHeroTop: {
    alignItems: 'center',
  },
  providerHeroImage: {
    width: 78,
    height: 78,
    borderRadius: 16,
    backgroundColor: '#E8E8E8',
    marginHorizontal: 8,
  },
  providerHeroImageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerHeroInfo: {
    flex: 1,
    marginStart:10,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  providerHeroName: {
    fontSize: 16,
    color: COLORS.text,
  },
  providerHeroJob: {
    fontSize: 13,
    color: '#555',
    marginTop: 3,
  },
  providerHeroStars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  providerHeroYears: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  providerHeroYearsText: {
    fontSize: 12,
    color: COLORS.text,
    marginHorizontal: 4,
  },
  invoicePdfBtn: {
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginHorizontal:10,
    paddingHorizontal:50,
    flexDirection: 'row-reverse',
    alignSelf:'center'
  },
  invoicePdfText: {
    fontSize: 13,
    color: COLORS.main,
    marginHorizontal: 5,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    marginBottom: 10,
    marginTop: 8,
  },

  orderInfoCard: {
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  orderInfoCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderInfoLabel: {
    fontSize: 14,
    color: COLORS.text,
    marginEnd: 4,
  },
  verticalDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#E3E3E3',
    marginVertical: 12,
  },
  idPill: {
    minWidth: 72,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  idPillText: {
    fontSize: 13,
    color: COLORS.text,
  },
  statusPill: {
    minWidth: 72,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  statusPillText: {
    fontSize: 14,
  },

  scheduleCard: {
    minHeight: 100,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  scheduleItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleText: {
    fontSize: 12,
    color: COLORS.text,
    marginTop: 6,
    textAlign: 'center',
  },
  verticalDividerSmall: {
    width: 1,
    height: 38,
    backgroundColor: '#E3E3E3',
  },

  addressCard: {
    minHeight: 55,
    borderRadius: 15,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    marginHorizontal: 8,
  },

  invoiceCard: {
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  invoiceRow: {
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  invoiceLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  invoiceLabelMuted: {
    color: COLORS.muted,
  },
  invoiceTotalLabel: {
    color: COLORS.text,
    fontSize: 16,
  },
  invoicePriceWrap: {
    minWidth: 76,
    alignItems: 'center',
  },
  invoicePrice: {
    fontSize: 14,
    color: COLORS.text,
  },
  invoiceTotalPrice: {
    fontSize: 16,
  },
  currencyText: {
    fontSize: 11,
    color: COLORS.muted,
    marginHorizontal: 3,
  },
  invoiceDivider: {
    height: 1,
    backgroundColor: '#E3E3E3',
    marginVertical: 7,
  },

  notesBox: {
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
  },

  cancelReasonBox: {
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  cancelReasonText: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
  },

  cancelOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'flex-end',
  },
  cancelSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
  },
  sheetHandle: {
    width: 46,
    height: 5,
    borderRadius: 10,
    backgroundColor: '#D7D7D7',
    alignSelf: 'center',
    marginBottom: 18,
  },
  cancelSheetTitle: {
    fontSize: 22,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  cancelSheetSubtitle: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  reasonsWrap: {
    marginBottom: 12,
  },
  cancelReasonsLoader: {
    minHeight: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelReasonsLoaderText: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
  },
  reasonItem: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  reasonItemSelected: {
    borderColor: COLORS.main,
    backgroundColor: COLORS.mainSoft,
    shadowColor: COLORS.main,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#BFC6CE',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  radioOuterSelected: {
    borderColor: COLORS.main,
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.main,
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'auto',
    marginStart: 4,
  },
  reasonTextSelected: {
    color: COLORS.text,
  },
  otherReasonInput: {
    minHeight: 92,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    fontSize: 14,
    color: COLORS.text,
    marginTop: -4,
    marginBottom: 20,
  },
  cancelWarning: {
    fontSize: 13,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 24,
  },
  cancelWarningAmount: {
    color: COLORS.red,
  },
  cancelActions: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  keepOrderBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  keepOrderText: {
    fontSize: 15,
    color: COLORS.white,
  },
  cancelOrderBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.main,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    flexDirection: 'row',
  },
  cancelOrderBtnDisabled: {
    borderColor: COLORS.border,
    backgroundColor: '#FAFAFA',
  },
  cancelOrderText: {
    fontSize: 15,
    color: COLORS.main,
    marginHorizontal: 6,
  },
  cancelOrderTextDisabled: {
    color: '#BDBDBD',
  },
  ratingOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.72)',
  justifyContent: 'flex-end',
},

ratingSheet: {
  backgroundColor: COLORS.white,
  borderTopLeftRadius: 28,
  borderTopRightRadius: 28,
  paddingHorizontal: 20,
  paddingTop: 10,
  paddingBottom: 28,
},

ratingHandle: {
  width: 44,
  height: 5,
  borderRadius: 20,
  backgroundColor: '#D9D9D9',
  alignSelf: 'center',
  marginBottom: 18,
},

ratingTitle: {
  fontSize: 20,
  color: COLORS.text,
  textAlign: 'center',
  marginBottom: 8,
},

ratingSubtitle: {
  fontSize: 13,
  color: COLORS.muted,
  textAlign: 'center',
  marginBottom: 20,
},

ratingStarsRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 10,
},

ratingStarBtn: {
  paddingHorizontal: 4,
},

ratingLabel: {
  fontSize: 13,
  color: COLORS.text,
  textAlign: 'center',
  marginBottom: 18,
},

reviewLabel: {
  fontSize: 12,
  color: COLORS.text,
  marginBottom: 8,
  textAlign: 'center',
},

reviewInput: {
  minHeight: 108,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: COLORS.border,
  backgroundColor: COLORS.white,
  paddingHorizontal: 12,
  paddingTop: 12,
  paddingBottom: 10,
  fontSize: 13,
  color: COLORS.text,
  marginBottom: 18,
},

submitRatingBtn: {
  height: 48,
  borderRadius: 11,
  backgroundColor: COLORS.main,
  alignItems: 'center',
  justifyContent: 'center',
},

submitRatingBtnDisabled: {
  opacity: 0.7,
},

submitRatingText: {
  fontSize: 14,
  color: COLORS.white,
},
});  