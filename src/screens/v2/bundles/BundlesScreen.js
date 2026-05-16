import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import Ionicons from '@react-native-vector-icons/ionicons';

import AppHeader from '../../../shared/AppHeader';
import AppText from '../../../shared/AppText';
import {getMyBundles, getAvailableBundles} from '../../../services/bundlesService';
import { useSelector } from 'react-redux';

const BundlesScreen = ({navigation, route}) => {
  const {t} = useTranslation();

  const tr = (key, fallback) => t(key, {defaultValue: fallback});

  const routeCategory = route?.params?.category || null;

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    routeCategory?.id || null,
  );

  const [myBundles, setMyBundles] = useState([]);
  const [availableBundles, setAvailableBundles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBundles = useCallback(
    async ({isRefresh = false} = {}) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const [myBundlesResponse, availableBundlesResponse] =
          await Promise.all([
            getMyBundles(),
            getAvailableBundles({
              categoryId: selectedCategoryId,
            }),
          ]);

        setMyBundles(myBundlesResponse?.data?.all || []);

        const availableData = availableBundlesResponse?.data || {};

        setCategories(availableData?.categories || []);
        setAvailableBundles(availableData?.bundles || []);
      } catch (error) {
        console.log(
          'BUNDLES ERROR:',
          error?.response?.data || error?.message,
        );

        setMyBundles([]);
        setCategories([]);
        setAvailableBundles([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedCategoryId],
  );

  useEffect(() => {
    fetchBundles();
  }, [fetchBundles]);

  const onRefresh = () => {
    fetchBundles({isRefresh: true});
  };

  const hasSubscribedBundles = myBundles.length > 0;
const user = useSelector(state => state.auth.user);
  const goToBundleDetails = bundle => {
    if(user?.paymentAva != 0)
    navigation.navigate('DaySelectionScreen', {
      bundle,
    });
  };

  const goToSubscribedBundles = () => {
    navigation.navigate('MySubscribedBundlesScreen');
  };

  const renderHeroCard = () => {
    return (
      <View style={styles.heroCard}>
        <View style={styles.heroShapeOne} />
        <View style={styles.heroShapeTwo} />

        <View style={styles.heroInfo}>
          <View style={styles.heroIconBox}>
            <Ionicons name="basket" size={30} color="#F28B22" />
          </View>

          <View style={styles.heroTextWrap}>
            <AppText weight="bold" style={styles.heroTitle}>
              {tr('bundles.my_bundles', 'باقاتي')}
            </AppText>

            <AppText style={styles.heroSubTitle}>
              {hasSubscribedBundles
                ? tr(
                    'bundles.subscribed_bundles_hint',
                    'عرض الباقات التي تم الاشتراك بها',
                  )
                : tr('bundles.no_active_bundle', 'لا توجد باقات نشطة حاليا')}
            </AppText>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.heroButton}
          onPress={goToSubscribedBundles}>
          <AppText weight="bold" style={styles.heroButtonText}>
            {tr('bundles.my_bundles', 'باقاتي')}
          </AppText>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCategoryFilters = () => {
    const filterData = [
      {
        id: null,
        name: tr('bundles.all', 'الكل'),
      },
      ...categories,
    ];

    return (
      <View style={styles.filtersWrap}>
        <FlatList
          data={filterData}
          keyExtractor={item =>
            item.id === null ? 'all-categories' : String(item.id)
          }
          horizontal
          inverted
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
          renderItem={({item}) => {
            const isActive = selectedCategoryId === item.id;

            return (
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setSelectedCategoryId(item.id)}>
                <AppText
                  weight={isActive ? 'bold' : 'regular'}
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}>
                  {item.name}
                </AppText>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  };

  const renderAvailableBundle = ({item, index}) => {
    const isSelected = index === 0;
    const isGolden =
      String(item?.name || '').includes('ذهبية') ||
      String(item?.name || '')
        .toLowerCase()
        .includes('gold');

    const features =
      item.features && item.features.length > 0
        ? item.features
        : [
            {
              text: `${item.num_per_week} ${tr(
                'bundles.week_times',
                'مرة اسبوعيا',
              )}`,
            },
            {
              text: `${item.num_per_month} ${tr(
                'bundles.month_times',
                'مرة شهريا',
              )}`,
            },
            {
              text: item.description || tr('bundles.full_cleaning', 'تنظيف شامل'),
            },
          ];

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.bundleCard, isSelected && styles.bundleCardActive]}
        onPress={() => goToBundleDetails(item)}>
          <View style={styles.bundleInfo}>
          <View style={styles.bundleTitleRow}>
            {isGolden ? (
              <Ionicons
                name="ribbon"
                size={17}
                color="#F2A51A"
                style={styles.bundleTitleIcon}
              />
            ) : null}

            <AppText weight="bold" style={styles.bundleTitle}>
              {item.name}
            </AppText>
          </View>

          <AppText style={styles.bundleType}>
            {item.type === 'weekly'
              ? tr('bundles.weekly_package', 'باقة أسبوعية')
              : tr('bundles.monthly_package', 'باقة شهرية')}
          </AppText>

          <View style={styles.featuresWrap}>
            {features.map((feature, featureIndex) => (
              <View
                key={`${item.id}-${featureIndex}`}
                style={styles.featureRow}>
                <Ionicons name="checkmark-done" size={16} color="#3296D9" />

                <AppText style={styles.featureText}>{feature.text}</AppText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.priceSide}>
          <View style={styles.discountBadge}>
            <AppText weight="bold" style={styles.discountText}>
              {tr('bundles.save', 'وفر')} %{item.discount}
            </AppText>
          </View>

          <View style={styles.priceWrap}>
            <AppText style={styles.startFromText}>
              {tr('bundles.starts_from', 'يبدأ من')}
            </AppText>

            <View style={styles.priceRow}>
              <AppText style={styles.currencyText}>
                {tr('orders.currency', 'ج.م')}
              </AppText>

              <AppText weight="bold" style={styles.priceText}>
                {formatPrice(item.price)}
              </AppText>
            </View>

            <View style={styles.oldPriceRow}>
              <AppText style={styles.oldCurrencyText}>
                {tr('orders.currency', 'ج.م')}
              </AppText>

              <AppText weight="bold" style={styles.oldPriceText}>
                {formatPrice(item.real_price)}
              </AppText>
            </View>
          </View>
        </View>

        
      </TouchableOpacity>
    );
  };

  const emptyTitle = useMemo(() => {
    return tr('bundles.no_bundles_title', 'لا توجد باقات متاحة حاليا');
  }, [t]);

  const emptySubtitle = useMemo(() => {
    return tr(
      'bundles.no_bundles_subtitle',
      'سيتم عرض الباقات المتاحة هنا عند إضافتها',
    );
  }, [t]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader titleKey="bundles.title" onBack={() => navigation.goBack()} />

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#3B97D3" />
          </View>
        ) : (
          <FlatList
            data={availableBundles}
            keyExtractor={item => String(item.id)}
            renderItem={renderAvailableBundle}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              availableBundles.length === 0 && styles.emptyListContent,
            ]}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListHeaderComponent={
              <>
                {renderHeroCard()}

                <AppText weight="bold" style={styles.sectionTitle}>
                  {tr('bundles.choose_package_category', 'اختر نوع الباقة')}
                </AppText>

                {renderCategoryFilters()}

                <AppText weight="bold" style={styles.sectionTitle}>
                  {tr('bundles.available_bundles', 'الباقات المتاحة')}
                </AppText>
              </>
            }
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIconBox}>
                  <Ionicons name="cube-outline" size={42} color="#A5A5A5" />
                </View>

                <AppText weight="bold" style={styles.emptyTitle}>
                  {emptyTitle}
                </AppText>

                <AppText style={styles.emptySubtitle}>{emptySubtitle}</AppText>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default BundlesScreen;

const formatPrice = value => {
  if (value === null || value === undefined || value === '') {
    return '0';
  }

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return String(value);
  }

  return numberValue % 1 === 0
    ? String(numberValue)
    : numberValue.toFixed(2);
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 120,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  heroCard: {
    minHeight: 88,
    backgroundColor: '#FFF2E3',
    borderRadius: 18,
    marginBottom: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  heroShapeOne: {
    position: 'absolute',
    width: 140,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.35)',
    left: -35,
    top: -18,
    transform: [{rotate: '22deg'}],
  },

  heroShapeTwo: {
    position: 'absolute',
    width: 170,
    height: 80,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.22)',
    start: 45,
    bottom: -38,
    transform: [{rotate: '-18deg'}],
  },

  heroButton: {
    backgroundColor: '#F28B22',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 2,
  },

  heroButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
  },

  heroInfo: {
    flex: 1,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginStart: 8,
  },

  heroIconBox: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#FFE6C9',
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 10,
  },

  heroTextWrap: {
    alignItems: 'flex-start',
    flex: 1,
  },

  heroTitle: {
    fontSize: 15,
    color: '#1F1F1F',
    marginBottom: 3,
    textAlign: 'auto',
  },

  heroSubTitle: {
    fontSize: 11.5,
    color: '#777777',
    textAlign: 'auto',
  },

  sectionTitle: {
    fontSize: 14,
    color: '#1F1F1F',
    textAlign: 'auto',
    marginBottom: 10,
  },

  filtersWrap: {
    marginBottom: 16,
  },

  filtersContent: {
    paddingVertical: 2,
  },

  filterChip: {
    minHeight: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#F1F1F1',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginStart: 8,
  },

  filterChipActive: {
    backgroundColor: '#EAF6FF',
    borderColor: '#3296D9',
  },

  filterChipText: {
    fontSize: 13,
    color: '#777777',
  },

  filterChipTextActive: {
    color: '#3296D9',
  },

  bundleCard: {
    minHeight: 118,
    backgroundColor: '#F1F1F1',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 14,
    padding: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  bundleCardActive: {
    backgroundColor: '#EAF6FF',
    borderColor: '#3296D9',
    borderWidth: 1.5,
  },

  priceSide: {
    width: 98,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  discountBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3296D9',
    borderRadius: 16,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  discountText: {
    fontSize: 10.5,
    color: '#3296D9',
  },

  priceWrap: {
    alignItems: 'flex-start',
  },

  startFromText: {
    fontSize: 11,
    color: '#777777',
    marginBottom: 1,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  currencyText: {
    fontSize: 11,
    color: '#555555',
    marginEnd: 4,
    marginBottom: 4,
  },

  priceText: {
    fontSize: 24,
    color: '#1F1F1F',
    lineHeight: 30,
  },

  oldPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -2,
  },

  oldCurrencyText: {
    fontSize: 10,
    color: '#A0A0A0',
    marginEnd: 4,
    textDecorationLine: 'line-through',
  },

  oldPriceText: {
    fontSize: 16,
    color: '#A0A0A0',
    textDecorationLine: 'line-through',
  },

  bundleInfo: {
    flex: 1,
    alignItems: 'flex-start',
    paddingStart: 8,
  },

  bundleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },

  bundleTitleIcon: {
    marginEnd: 4,
  },

  bundleTitle: {
    fontSize: 15.5,
    color: '#1F1F1F',
    textAlign: 'auto',
  },

  bundleType: {
    fontSize: 11.5,
    color: '#777777',
    textAlign: 'auto',
    marginBottom: 9,
  },

  featuresWrap: {
    alignItems: 'flex-start',
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },

  featureText: {
    fontSize: 12,
    color: '#1F1F1F',
    textAlign: 'auto',
    marginStart: 4,
  },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 80,
  },

  emptyIconBox: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#F1F1F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 18,
    color: '#1F1F1F',
    textAlign: 'center',
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#8A8A8A',
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 22,
  },
});