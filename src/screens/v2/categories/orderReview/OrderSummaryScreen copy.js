 import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  I18nManager,
  RefreshControl,
  Modal,
  Pressable,
  Linking,
  Animated,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {useTranslation} from 'react-i18next';

import AppText from '../../../../shared/AppText';
import {
  getOrderDetails,
  getNearbyProviders,
} from '../../../../services/orderService';
import { useSelector } from 'react-redux';

const COLORS = {
  main: '#3296D9',
  mainDark: '#2388C8',
  orange: '#F7931E',
  orangeLight: '#FFF1E2',
  blueLight: '#EAF3FF',
  border: '#E7E7E7',
  card: '#F7F7F7',
  text: '#222222',
  muted: '#8B8B8B',
  white: '#FFFFFF',
};

const OrderSummaryScreen = ({navigation, route}) => {
  const {t} = useTranslation();
  const isRTL = I18nManager.isRTL;
  const orderId = route?.params?.order_id;

  const user = useSelector(state => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [order, setOrder] = useState(null);
  const [providers, setProviders] = useState([]);

  const [searchMessageIndex, setSearchMessageIndex] = useState(0);
  const [dotsCount, setDotsCount] = useState(1);

  const [docsSheet, setDocsSheet] = useState(false);
  const [priceSheet, setPriceSheet] = useState(false);

  const [providerSheetVisible, setProviderSheetVisible] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  const [docsFlipped, setDocsFlipped] = useState(false);
  const docsFlipAnim = useRef(new Animated.Value(0)).current;

  const currency = t('services.currency', {defaultValue: 'ج.م'});

  const rowDirection = isRTL ? 'row' : 'row';

  const tr = (key, fallback, options = {}) =>
    t(key, {defaultValue: fallback, ...options});

  const searchingMessages = useMemo(
    () => [
      tr(
        'order_summary.searching_messages.finding',
        'جاري البحث عن الفنيين المتاحين في منطقتك حاليا',
      ),
      tr(
        'order_summary.searching_messages.providers_list',
        'سوف تظهر لك قائمة بالفنيين للاختيار من بينهم',
      ),
      tr(
        'order_summary.searching_messages.compare',
        'يمكنك مقارنة الخبرات والتقييمات قبل تأكيد اختيارك',
      ),
    ],
    [t],
  );

  const shouldAnimateSearchingText =
    order?.status === 'pending' && (!providers || providers.length === 0);

  useEffect(() => {
    loadPage();
  }, [orderId]);

  useEffect(() => {
    if (!shouldAnimateSearchingText) {
      setSearchMessageIndex(0);
      return;
    }

    const messageTimer = setInterval(() => {
      setSearchMessageIndex(prev => (prev + 1) % searchingMessages.length);
    }, 2600);

    return () => clearInterval(messageTimer);
  }, [shouldAnimateSearchingText, searchingMessages.length]);

  useEffect(() => {
    if (!shouldAnimateSearchingText) {
      setDotsCount(1);
      return;
    }

    const dotsTimer = setInterval(() => {
      setDotsCount(prev => {
        if (prev >= 3) {
          return 1;
        }

        return prev + 1;
      });
    }, 450);

    return () => clearInterval(dotsTimer);
  }, [shouldAnimateSearchingText]);

  useEffect(() => {
    if (!docsSheet) {
      setDocsFlipped(false);
      docsFlipAnim.setValue(0);
    }
  }, [docsSheet, docsFlipAnim]);

  const renderSearchingText = () => {
    const message = searchingMessages?.[searchMessageIndex] || '';
    const dots = '.'.repeat(dotsCount || 1);

    return `${message} ${dots}`;
  };

  const loadPage = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);

      const detailsRes = await getOrderDetails(orderId);
      const orderData = detailsRes?.data || null;
      setOrder(orderData);

      if (orderData?.status === 'pending') {
        await loadNearbyProviders(orderData.id);
      } else {
        setProviders([]);
      }
    } catch (error) {
      console.log(
        'ORDER SUMMARY ERROR:',
        error?.response?.data || error?.message,
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadNearbyProviders = async id => {
    try {
      setLoadingProviders(true);
      const providersRes = await getNearbyProviders(id);
      setProviders(providersRes?.data || []);
    } catch (error) {
      console.log(
        'NEARBY PROVIDERS ERROR:',
        error?.response?.data || error?.message,
      );
      setProviders([]);
    } finally {
      setLoadingProviders(false);
    }
  };

  const onRefresh = () => loadPage(true);

  const statusLabel = useMemo(() => {
    if (order?.status === 'accepted') {
      return tr('order_summary.status.in_progress', 'جاري');
    }

    if (order?.status === 'complete') {
      return tr('order_summary.status.completed', 'مكتمل');
    }

    if (order?.status === 'canceled') {
      return tr('order_summary.status.canceled', 'ملغي');
    }

    return tr('order_summary.status.pending', 'قيد الانتظار');
  }, [order?.status, t]);

  const providerYearsText = years =>
    tr('order_summary.provider_years', '{{count}} سنوات', {
      count: years || 3,
    });

  const renderAvatar = (image, style) => {
    if (image) {
      return <Image source={{uri: image}} style={style} />;
    }

    return (
      <View style={[style, styles.avatarFallback]}>
        <Ionicons name="person-outline" size={24} color={COLORS.main} />
      </View>
    );
  };

  const callProvider = () => {
    const phone = order?.provider?.phone;

    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const openProviderSheet = provider => {
    setSelectedProvider(provider);
    setProviderSheetVisible(true);
  };

  const closeProviderSheet = () => {
    setProviderSheetVisible(false);
    setSelectedProvider(null);
  };

  const onConfirmProviderRequest = () => {
    // TODO: اربط هنا API طلب الفني
    // مثال:
    // await requestProvider({order_id: order?.id, provider_id: selectedProvider?.id});

    closeProviderSheet();
  };

  const onMessageSelectedProvider = () => {
   navigation.navigate('OrderChatScreen', {
  order_id: order?.id,
  provider_id: selectedProvider?.id,
  provider: selectedProvider,
});
  };

  const flipProviderDocsCard = () => {
    const docs = order?.provider?.docs || {};
    const hasFront = !!docs.front_id_doc;
    const hasBack = !!docs.rear_id_doc;

    if (!hasFront || !hasBack) {
      return;
    }

    const nextValue = docsFlipped ? 0 : 180;

    Animated.spring(docsFlipAnim, {
      toValue: nextValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();

    setDocsFlipped(prev => !prev);
  };

  const renderHeader = () => (
    <View style={[styles.headerRow, {flexDirection: rowDirection}]}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.headerBack}
        onPress={() => navigation.goBack()}>
        <Ionicons
          name={isRTL ? 'arrow-forward' : 'arrow-back'}
          size={24}
          color={COLORS.text}
        />
      </TouchableOpacity>

      <AppText weight="bold" style={styles.headerTitle}>
        {tr('order_summary.order_number', 'طلب #{{id}}', {
          id: order?.id,
        })}
      </AppText>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('OrderFullDetailsScreen', {
            order_id: order?.id,
          })
        }>
        <AppText weight="bold" style={styles.headerLink}>
          {tr('order_summary.details_link', 'تفاصيل الطلب')}
        </AppText>
      </TouchableOpacity>
    </View>
  );

  const renderPendingHero = () => (
    <LinearGradient
      colors={['#CDEBFF', '#BFE6FF', '#7EB6FF']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.pendingHero}>
      <AppText weight="bold" style={styles.pendingHeroText}>
        {renderSearchingText()}
      </AppText>
    </LinearGradient>
  );

  const renderAcceptedHero = () => {
    const provider = order?.provider;

    return (
      <LinearGradient
        colors={['#CDEBFF', '#BFE6FF', '#8FC9FF']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.acceptedHero}>
        <View style={[styles.acceptedTopRow, {flexDirection: rowDirection}]}>
          {renderAvatar(provider?.image, styles.acceptedAvatar)}

          <View style={styles.acceptedInfo}>
            <AppText weight="bold" style={styles.acceptedName}>
              {provider?.name || tr('order_summary.provider', 'الفني')}
            </AppText>

            <AppText style={styles.acceptedJob}>
              {provider?.job ||
                order?.category_name ||
                tr('order_summary.technician', 'فني')}
            </AppText>

            <View style={[styles.starsRow, {flexDirection: rowDirection}]}>
              {[1, 2, 3, 4, 5].map(i => (
                <Ionicons
                  key={i}
                  name="star"
                  size={15}
                  color={COLORS.orange}
                />
              ))}
            </View>

            <View style={[styles.experienceRow, {flexDirection: rowDirection}]}>
              <Ionicons
                name="briefcase-outline"
                size={14}
                color={COLORS.main}
              />

              <AppText style={styles.experienceText}>
                {providerYearsText(provider?.experience_years)}
              </AppText>
            </View>
          </View>
        </View>

        <View style={[styles.acceptedActionsRow, {flexDirection: rowDirection}]}>
     <TouchableOpacity
  activeOpacity={0.85}
  style={styles.filledHeroBtn}
  onPress={() => {
    navigation.navigate('OrderChatScreen', {
      order_id: order?.id,
      provider_id: order?.provider_id || provider?.id || selectedProvider?.id,
      provider: provider || selectedProvider || {
        id: order?.provider_id,
        name: order?.provider_name,
        image: order?.provider_image,
        job: order?.provider_category_name || order?.category_name,
      },
    });
  }}>
  <AppText weight="bold" style={styles.filledHeroText}>
    {tr('order_summary.message_provider', 'مراسلة الفني')}
  </AppText>
</TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.outlineHeroBtn}
            onPress={() => setDocsSheet(true)}>
            <AppText weight="bold" style={styles.outlineHeroText}>
              {tr('order_summary.show_provider_card', 'عرض بطاقة الفني')}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.callCircle}
            onPress={callProvider}>
            <Ionicons name="call-outline" size={22} color="#222" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  };

  const renderRefresh = () => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.refreshRow, {flexDirection: rowDirection}]}
      onPress={onRefresh}>
      <Ionicons name="refresh-outline" size={20} color={COLORS.main} />

      <AppText weight="bold" style={styles.refreshText}>
        {tr('order_summary.refresh_order', 'تحديث الطلب')}
      </AppText>
    </TouchableOpacity>
  );

  const renderInfoCard = () => (
    <>
      <AppText weight="bold" style={styles.sectionTitle}>
        {tr('order_summary.order_info', 'معلومات الطلب')}
      </AppText>

      <View style={[styles.infoCard, {flexDirection: rowDirection}]}>
        <View style={styles.infoCol}>
          <AppText style={styles.infoLabel}>
            {tr('order_summary.order_id', 'رقم الطلب')}
          </AppText>

          <View style={styles.pillNeutral}>
            <AppText weight="bold" style={styles.pillNeutralText}>
              #{order?.id}
            </AppText>
          </View>
        </View>

        <View style={styles.verticalDivider} />

        <View style={styles.infoCol}>
          <AppText style={styles.infoLabel}>
            {tr('order_summary.order_status', 'حالة الطلب')}
          </AppText>

          <View
            style={[
              styles.statusPill,
              order?.status === 'accepted' && styles.statusPillBlue,
            ]}>
            <AppText
              weight="bold"
              style={[
                styles.statusPillText,
                order?.status === 'accepted' && styles.statusPillBlueText,
              ]}>
              {statusLabel}
            </AppText>
          </View>
        </View>
      </View>
    </>
  );

  const renderPendingProvider = provider => (
    <View key={String(provider.id)} style={styles.providerCard}>
      <View style={[styles.providerTopRow, {flexDirection: rowDirection}]}>
        {renderAvatar(provider?.image, styles.providerAvatar)}

        <View style={styles.providerTextBlock}>
          <AppText weight="bold" style={styles.providerName} numberOfLines={1}>
            {provider?.name || tr('order_summary.technician', 'فني')}
          </AppText>

          <AppText style={styles.providerJob} numberOfLines={1}>
            {provider?.job ||
              order?.category_name ||
              tr('order_summary.technician', 'فني')}
          </AppText>

          <View style={[styles.providerYearsRow, {flexDirection: rowDirection}]}>
            <Ionicons
              name="briefcase-outline"
              size={14}
              color={COLORS.main}
            />

            <AppText style={styles.providerYearsText}>
              {providerYearsText(provider?.experience_years)}
            </AppText>
          </View>
        </View>

        <View style={{flexDirection: 'column', justifyContent: 'flex-end'}}>
          <View style={styles.rateBox}>
            <View style={styles.rateInnerRow}>
              <AppText weight="bold" style={styles.rateNumber}>
                {provider?.rate || 0}
              </AppText>

              <Ionicons name="star" size={15} color={COLORS.orange} />
            </View>
          </View>

          <View
            style={[
              styles.providerBottomRow,
              {
                alignItems: isRTL ? 'flex-start' : 'flex-start',
              },
            ]}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.requestTechBtn}
              onPress={() => openProviderSheet(provider)}>
              <AppText weight="bold" style={styles.requestTechBtnText}>
                {tr('order_summary.request_provider', 'طلب الفني')}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderPendingProviders = () => (
    <>
      <AppText weight="bold" style={styles.sectionTitle}>
        {tr('order_summary.available_providers', 'الفنيين المتاحين')}
      </AppText>

      {loadingProviders ? (
        <View style={styles.loadingProvidersBox}>
          <ActivityIndicator size="small" color={COLORS.main} />

          <AppText style={styles.loadingProvidersText}>
            {renderSearchingText()}
          </AppText>
        </View>
      ) : providers?.length ? (
        providers.map(renderPendingProvider)
      ) : (
        <View style={styles.emptyProvidersBox}>
          <Ionicons name="people-outline" size={28} color="#A5A5A5" />

          <AppText style={styles.emptyProvidersText}>
            {tr(
              'order_summary.no_available_providers',
              'لا يوجد فنيين متاحين حاليًا',
            )}
          </AppText>
        </View>
      )}
    </>
  );

  const renderAcceptedPriceSection = () => (
    <View style={styles.priceSection}>
      <AppText weight="bold" style={styles.sectionTitle}>
        {tr('order_summary.service_price', 'سعر الخدمة')}
      </AppText>

      <AppText style={styles.priceNote}>
        {tr(
          'order_summary.price_note',
          'قد يختلف السعر النهائي للخدمة إذا اكتشف الفني أعمالاً إضافية أو إذا كان العمل أقل من المتوقع.',
        )}
      </AppText>

      <View style={[styles.acceptedPriceRow, {flexDirection: rowDirection}]}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.priceHelpRow, {flexDirection: rowDirection}]}
          onPress={() => setPriceSheet(true)}>
          <Ionicons name="bulb-outline" size={17} color={COLORS.main} />

          <AppText weight="bold" style={styles.priceHelpText}>
            {tr('order_summary.how_price_adjusted', 'كيف يتم تعديل السعر؟')}
          </AppText>
        </TouchableOpacity>

        <View style={[styles.finalPriceWrap, {flexDirection: rowDirection}]}>
          <AppText weight="bold" style={styles.finalPrice}>
            {order?.price}
          </AppText>

          <AppText style={styles.finalCurrency}>{currency}</AppText>
        </View>

{
  (user?.paymentAva !== 0) && 
    <TouchableOpacity
          activeOpacity={0.85}
          style={styles.adjustPriceBtn}
          onPress={() =>
            navigation.navigate('OrderQrCodeScreen', {
              order_id: order?.id,
            })
          }>
          <AppText weight="bold" style={styles.adjustPriceText}>
            {tr('order_summary.adjust_price', 'تعديل السعر')}
          </AppText>
        </TouchableOpacity>
}
      
      </View>
    </View>
  );

  const renderProviderRequestSheet = () => {
    if (!selectedProvider) {
      return null;
    }

    const roundedRate = Math.max(
      1,
      Math.min(5, Math.round(Number(selectedProvider?.rate || 5))),
    );

    return (
      <Modal
        visible={providerSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={closeProviderSheet}>
        <Pressable style={styles.sheetOverlay} onPress={closeProviderSheet}>
          <Pressable
            style={styles.requestProviderSheetContent}
            onPress={() => {}}>
            <View style={styles.sheetHandle} />

            <View style={styles.requestProviderCard}>
              {renderAvatar(selectedProvider?.image, styles.requestProviderAvatar)}

              <AppText weight="bold" style={styles.requestProviderName}>
                {selectedProvider?.name || tr('order_summary.technician', 'فني')}
              </AppText>

              <AppText style={styles.requestProviderJob}>
                {selectedProvider?.job ||
                  order?.category_name ||
                  tr('order_summary.technician', 'فني')}
              </AppText>

              <View style={styles.requestProviderStarsRow}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Ionicons
                    key={i}
                    name={i <= roundedRate ? 'star' : 'star-outline'}
                    size={16}
                    color={COLORS.orange}
                    style={{marginHorizontal: 2}}
                  />
                ))}
              </View>

              <View
                style={[
                  styles.requestProviderYearsRow,
                  {flexDirection: rowDirection},
                ]}>
                <Ionicons
                  name="briefcase-outline"
                  size={14}
                  color={COLORS.main}
                />

                <AppText style={styles.requestProviderYearsText}>
                  {providerYearsText(selectedProvider?.experience_years)}
                </AppText>
              </View>

              <View style={styles.requestProviderActionsRow}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={styles.requestProviderPrimaryBtn}
                  onPress={onConfirmProviderRequest}>
                  <AppText
                    weight="bold"
                    style={styles.requestProviderPrimaryText}>
                    {tr('order_summary.request_provider', 'طلب الفني')}
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.88}
                  style={styles.requestProviderOutlineBtn}
                  onPress={onMessageSelectedProvider}>
                  <AppText
                    weight="bold"
                    style={styles.requestProviderOutlineText}>
                    {tr('order_summary.message_provider', 'مراسلة الفني')}
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  const renderDocsSheet = () => {
    const docs = order?.provider?.docs || {};

    const frontImage = docs.front_id_doc;
    const backImage = docs.rear_id_doc;

    const hasFront = !!frontImage;
    const hasBack = !!backImage;
    const hasAnyDoc = hasFront || hasBack;
    const canFlip = hasFront && hasBack;

    const frontRotate = docsFlipAnim.interpolate({
      inputRange: [0, 180],
      outputRange: ['0deg', '180deg'],
    });

    const backRotate = docsFlipAnim.interpolate({
      inputRange: [0, 180],
      outputRange: ['180deg', '360deg'],
    });

    return (
      <Modal
        visible={docsSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setDocsSheet(false)}>
        <Pressable
          style={styles.sheetOverlay}
          onPress={() => setDocsSheet(false)}>
          <Pressable style={styles.sheetContent} onPress={() => {}}>
            <View style={styles.sheetHandle} />

            <AppText weight="bold" style={styles.sheetTitle}>
              {tr('order_summary.provider_card', 'بطاقة الفني')}
            </AppText>

            {!hasAnyDoc ? (
              <View style={styles.noDocsBox}>
                <Ionicons name="card-outline" size={34} color="#999" />

                <AppText style={styles.noDocsText}>
                  {tr(
                    'order_summary.no_provider_card',
                    'لا توجد بطاقة متاحة لهذا الفني',
                  )}
                </AppText>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  activeOpacity={canFlip ? 0.9 : 1}
                  onPress={flipProviderDocsCard}
                  style={styles.flipDocPress}>
                  <View style={styles.flipDocCard}>
                    <Animated.View
                      style={[
                        styles.flipDocFace,
                        {
                          transform: [
                            {perspective: 1000},
                            {rotateY: frontRotate},
                          ],
                        },
                      ]}>
                      <Image
                        source={{uri: frontImage || backImage}}
                        style={styles.flipDocImage}
                      />

                      <View style={styles.docFaceBadge}>
                        <AppText weight="bold" style={styles.docFaceBadgeText}>
                          {tr('order_summary.front_card', 'وجه البطاقة')}
                        </AppText>
                      </View>
                    </Animated.View>

                    <Animated.View
                      style={[
                        styles.flipDocFace,
                        styles.flipDocBackFace,
                        {
                          transform: [
                            {perspective: 1000},
                            {rotateY: backRotate},
                          ],
                        },
                      ]}>
                      <Image
                        source={{uri: backImage || frontImage}}
                        style={styles.flipDocImage}
                      />

                      <View style={styles.docFaceBadge}>
                        <AppText weight="bold" style={styles.docFaceBadgeText}>
                          {tr('order_summary.back_card', 'ظهر البطاقة')}
                        </AppText>
                      </View>
                    </Animated.View>
                  </View>
                </TouchableOpacity>

                {canFlip ? (
                  <View style={[styles.flipHint, {flexDirection: rowDirection}]}>
                    <Ionicons name="sync-outline" size={16} color={COLORS.main} />

                    <AppText style={styles.flipHintText}>
                      {docsFlipped
                        ? tr(
                            'order_summary.tap_to_front',
                            'اضغط لعرض وجه البطاقة',
                          )
                        : tr(
                            'order_summary.tap_to_back',
                            'اضغط لعرض ظهر البطاقة',
                          )}
                    </AppText>
                  </View>
                ) : null}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  const renderPriceSheet = () => {
    const steps = [
      tr(
        'order_summary.price_steps.step_1',
        'يفحص الفني المشكلة بعد معاينة العمل.',
      ),
      tr(
        'order_summary.price_steps.step_2',
        'يحدد هل يوجد تعديل في السعر.',
      ),
      tr(
        'order_summary.price_steps.step_3',
        'يعرض لك قبل بدء الخدمة.',
      ),
      tr(
        'order_summary.price_steps.step_4',
        'توافق أنت على السعر قبل إتمام العمل.',
      ),
    ];

    return (
      <Modal
        visible={priceSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setPriceSheet(false)}>
        <Pressable
          style={styles.sheetOverlay}
          onPress={() => setPriceSheet(false)}>
          <Pressable style={styles.priceSheetContent} onPress={() => {}}>
            <View style={styles.sheetHandle} />

            <AppText weight="bold" style={styles.sheetTitle}>
              {tr('order_summary.how_price_adjusted', 'كيف يتم تعديل السعر؟')}
            </AppText>

            {steps.map((text, index) => (
              <View
                key={String(index)}
                style={[styles.priceStepRow, {flexDirection: rowDirection}]}>
                <View style={styles.stepCircle}>
                  <AppText weight="bold" style={styles.stepNumber}>
                    {index + 1}
                  </AppText>
                </View>

                <AppText style={styles.priceStepText}>{text}</AppText>
              </View>
            ))}

            <View style={[styles.priceSheetNote, {flexDirection: rowDirection}]}>
              <Ionicons
                name="checkmark-done-outline"
                size={18}
                color={COLORS.orange}
              />

              <AppText style={styles.priceSheetNoteText}>
                {tr(
                  'order_summary.price_change_note',
                  'السعر لا يتغير إلا بعد موافقتك.',
                )}
              </AppText>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={COLORS.main} />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderWrap}>
          <AppText style={styles.emptyStateText}>
            {tr('order_summary.order_not_found', 'لم يتم العثور على الطلب')}
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  const isPending = order.status === 'pending';
  const isAccepted = order.status === 'accepted';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {renderHeader()}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            isAccepted && styles.scrollContentAccepted,
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          {isAccepted ? renderAcceptedHero() : renderPendingHero()}

          {renderRefresh()}
          {renderInfoCard()}

          {isPending ? renderPendingProviders() : null}
          {isAccepted ? renderAcceptedPriceSection() : null}
        </ScrollView>

        {isAccepted ? (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('PaymentMethodsScreen', {
                order_id: order?.id,
                amount: order?.price,
              });
            }}
            activeOpacity={0.9}
            style={styles.doneButton}>
            <AppText weight="bold" style={styles.doneButtonText}>
              {tr('order_summary.service_completed', 'انتهت الخدمة بنجاح')}
            </AppText>
          </TouchableOpacity>
        ) : null}

        {renderDocsSheet()}
        {renderPriceSheet()}
        {renderProviderRequestSheet()}
      </View>
    </SafeAreaView>
  );
};

export default OrderSummaryScreen;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  loaderWrap: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  emptyStateText: {fontSize: 15, color: COLORS.muted},

  headerRow: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerBack: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {fontSize: 19, color: COLORS.text},
  headerLink: {fontSize: 15, color: COLORS.orange},

  scrollContent: {
    paddingBottom: 24,
    paddingHorizontal: 8,
  },
  scrollContentAccepted: {paddingBottom: 120},

  pendingHero: {
    borderRadius: 18,
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginBottom: 18,
  },
  pendingHeroText: {
    fontSize: 18,
    color: '#1B1B1B',
    textAlign: 'center',
    lineHeight: 34,
  },

  acceptedHero: {
    borderRadius: 18,
    minHeight: 162,
    padding: 14,
    marginBottom: 18,
  },
  acceptedTopRow: {
    alignItems: 'center',
  },
  acceptedInfo: {
    flex: 1,
    alignItems: 'center',
  },
  acceptedName: {
    fontSize: 17,
    color: COLORS.text,
  },
  acceptedJob: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
  },
  starsRow: {
    marginTop: 7,
  },
  experienceRow: {
    alignItems: 'center',
    marginTop: 7,
  },
  experienceText: {
    fontSize: 13,
    color: COLORS.text,
    marginHorizontal: 4,
  },
  acceptedAvatar: {
    width: 82,
    height: 82,
    borderRadius: 16,
    backgroundColor: '#DDD',
    marginHorizontal: 10,
  },
  acceptedActionsRow: {
    marginTop: 14,
    alignItems: 'center',
  },
  callCircle: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  outlineHeroBtn: {
    flex: 1,
    height: 42,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.4,
    borderColor: COLORS.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  outlineHeroText: {
    fontSize: 13,
    color: COLORS.main,
  },
  filledHeroBtn: {
    flex: 1,
    height: 42,
    borderRadius: 16,
    backgroundColor: COLORS.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  filledHeroText: {
    fontSize: 13,
    color: '#FFFFFF',
  },

  refreshRow: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    marginBottom: 18,
  },
  refreshText: {
    fontSize: 14,
    color: COLORS.main,
    marginHorizontal: 6,
  },

  sectionTitle: {
    fontSize: 17,
    color: COLORS.text,
    marginBottom: 12,
  },

  infoCard: {
    minHeight: 84,
    borderRadius: 18,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 22,
  },
  infoCol: {flex: 1, alignItems: 'center'},
  infoLabel: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 10,
  },
  verticalDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#E6E6E6',
    marginHorizontal: 10,
  },
  pillNeutral: {
    minWidth: 86,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E3E3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  pillNeutralText: {fontSize: 15, color: COLORS.text},
  statusPill: {
    minWidth: 102,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.orangeLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  statusPillText: {fontSize: 15, color: COLORS.orange},
  statusPillBlue: {backgroundColor: COLORS.blueLight},
  statusPillBlueText: {color: '#4A73E8'},

  loadingProvidersBox: {
    minHeight: 86,
    borderRadius: 18,
    backgroundColor: '#F7FBFE',
    borderWidth: 1,
    borderColor: '#E5F1F8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  loadingProvidersText: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.main,
    textAlign: 'center',
    lineHeight: 21,
  },
  emptyProvidersBox: {
    minHeight: 120,
    borderRadius: 18,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  emptyProvidersText: {
    marginTop: 8,
    fontSize: 14,
    color: '#9B9B9B',
    textAlign: 'center',
    lineHeight: 22,
  },

  providerCard: {
    borderRadius: 18,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    marginBottom: 12,
    minHeight: 116,
  },
  providerTopRow: {
    alignItems: 'center',
  },
  rateBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rateInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateNumber: {
    fontSize: 20,
    color: COLORS.text,
    marginHorizontal: 3,
  },
  providerTextBlock: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  providerName: {
    fontSize: 17,
    color: COLORS.text,
    marginBottom: 3,
    textAlign: 'auto',
  },
  providerJob: {
    fontSize: 13,
    color: '#9A9A9A',
    marginBottom: 7,
    textAlign: 'auto',
  },
  providerYearsRow: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  providerYearsText: {
    fontSize: 13,
    color: COLORS.text,
    marginHorizontal: 4,
  },
  providerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#E8E8E8',
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerBottomRow: {
    marginTop: 10,
  },
  requestTechBtn: {
    minWidth: 92,
    height: 38,
    borderRadius: 14,
    borderWidth: 1.4,
    borderColor: COLORS.main,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  requestTechBtnText: {
    fontSize: 14,
    color: COLORS.main,
  },

  requestProviderSheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
  },
  requestProviderCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  requestProviderAvatar: {
    width: 92,
    height: 92,
    borderRadius: 20,
    backgroundColor: '#E9E9E9',
    marginBottom: 14,
  },
  requestProviderName: {
    fontSize: 24,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  requestProviderJob: {
    fontSize: 14,
    color: '#8C8C8C',
    textAlign: 'center',
    marginBottom: 10,
  },
  requestProviderStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  requestProviderYearsRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  requestProviderYearsText: {
    fontSize: 13,
    color: COLORS.text,
    marginHorizontal: 4,
  },
  requestProviderActionsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requestProviderPrimaryBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  requestProviderPrimaryText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  requestProviderOutlineBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1.4,
    borderColor: COLORS.main,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  requestProviderOutlineText: {
    fontSize: 14,
    color: COLORS.main,
  },

  priceSection: {
    marginTop: 4,
  },
  priceNote: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 23,
    marginBottom: 18,
  },
  acceptedPriceRow: {
    alignItems: 'center',
  },
  adjustPriceBtn: {
    height: 32,
    borderRadius: 12,
    backgroundColor: '#FF8400',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 11,
    marginHorizontal: 5,
  },
  adjustPriceText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  finalPriceWrap: {
    alignItems: 'flex-start',
    marginHorizontal: 10,
  },
  finalPrice: {
    fontSize: 26,
    color: COLORS.text,
  },
  finalCurrency: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 5,
    marginHorizontal: 4,
  },
  priceHelpRow: {
    alignItems: 'center',
    flex: 1,
  },
  priceHelpText: {
    fontSize: 13,
    color: COLORS.main,
    marginHorizontal: 4,
  },

  doneButton: {
    position: 'absolute',
    end: 16,
    start: 16,
    bottom: 16,
    height: 56,
    borderRadius: 15,
    backgroundColor: COLORS.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    fontSize: 17,
    color: '#FFFFFF',
  },

  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.48)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopStartRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 30,
  },
  priceSheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopStartRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 30,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 10,
    backgroundColor: '#D4D4D4',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 18,
  },
  noDocsBox: {
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDocsText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.muted,
  },

  flipDocPress: {
    width: '100%',
  },
  flipDocCard: {
    width: '100%',
    height: 235,
    borderRadius: 16,
  },
  flipDocFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: '#EEEEEE',
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
  },
  flipDocBackFace: {
    transform: [{rotateY: '180deg'}],
  },
  flipDocImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  docFaceBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    minHeight: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docFaceBadgeText: {
    fontSize: 12,
    color: COLORS.text,
  },
  flipHint: {
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipHintText: {
    fontSize: 13,
    color: COLORS.main,
    marginHorizontal: 6,
    textAlign: 'center',
  },

  priceStepRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  stepNumber: {
    fontSize: 12,
    color: COLORS.main,
  },
  priceStepText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  priceSheetNote: {
    marginTop: 6,
    alignItems: 'center',
  },
  priceSheetNoteText: {
    fontSize: 13,
    color: COLORS.muted,
    marginHorizontal: 6,
  },
});

 