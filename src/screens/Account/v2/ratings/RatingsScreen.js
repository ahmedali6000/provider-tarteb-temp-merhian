import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Pressable,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useTranslation} from 'react-i18next';

import AppHeader from '../../../../shared/AppHeader';
import AppText from '../../../../shared/AppText';
import {getProviderRatings} from '../../../../services/ratingsService';

const emptyReviewsImage = require('../../../../../assets/app/images/empty_reviews.png');

const RatingsScreen = ({navigation}) => {
  const {t} = useTranslation();

  const sortOptions = useMemo(
    () => [
      {
        key: 'latest',
        label: t('ratings.sort_latest', {defaultValue: 'الأحدث'}),
      },
      {
        key: 'oldest',
        label: t('ratings.sort_oldest', {defaultValue: 'الأقدم'}),
      },
      {
        key: 'highest',
        label: t('ratings.sort_highest', {defaultValue: 'الأعلى تقييمًا'}),
      },
      {
        key: 'lowest',
        label: t('ratings.sort_lowest', {defaultValue: 'الأقل تقييمًا'}),
      },
    ],
    [t],
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const [distribution, setDistribution] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [sort, setSort] = useState('latest');
  const [showSort, setShowSort] = useState(false);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const activeSortLabel = useMemo(() => {
    const selected = sortOptions.find(item => item.key === sort);

    return t('ratings.sort_by', {
      label: selected?.label || t('ratings.sort_latest', {defaultValue: 'الأحدث'}),
      defaultValue: `ترتيب حسب ${
        selected?.label || t('ratings.sort_latest', {defaultValue: 'الأحدث'})
      }`,
    });
  }, [sort, sortOptions, t]);

  const fetchRatings = useCallback(
    async ({pageNumber = 1, refresh = false, selectedSort = sort} = {}) => {
      try {
        if (pageNumber === 1 && !refresh) {
          setLoading(true);
        }

        if (refresh) {
          setRefreshing(true);
        }

        if (pageNumber > 1) {
          setLoadingMore(true);
        }

        const response = await getProviderRatings({
          page: pageNumber,
          sort: selectedSort,
        });

        const result = response?.data;

        setAverage(result?.average || 0);
        setTotal(result?.total || 0);
        setDistribution(result?.distribution || []);

        const reviewsPayload = result?.reviews;
        const newReviews = reviewsPayload?.data || [];

        setPage(reviewsPayload?.meta?.current_page || pageNumber);
        setLastPage(reviewsPayload?.meta?.last_page || 1);

        if (pageNumber === 1) {
          setReviews(newReviews);
        } else {
          setReviews(prev => [...prev, ...newReviews]);
        }
      } catch (error) {
        console.log(
          'GET RATINGS ERROR:',
          error?.response?.data || error?.message,
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [sort],
  );

  useEffect(() => {
    fetchRatings({pageNumber: 1});
  }, [fetchRatings]);

  const onRefresh = () => {
    fetchRatings({
      pageNumber: 1,
      refresh: true,
    });
  };

  const onLoadMore = () => {
    if (loadingMore || loading || page >= lastPage) {
      return;
    }

    fetchRatings({
      pageNumber: page + 1,
    });
  };

  const changeSort = selectedSort => {
    setSort(selectedSort);
    setShowSort(false);
    setPage(1);

    fetchRatings({
      pageNumber: 1,
      selectedSort,
    });
  };

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('ProfileScreen');
    }
  };

  const renderStars = value => {
    const rounded = Math.round(Number(value) || 0);

    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map(star => {
          const active = star <= rounded;

          return (
            <Ionicons
              key={star}
              name={active ? 'star' : 'star-outline'}
              size={24}
              color="#FF8A00"
              style={styles.starIcon}
            />
          );
        })}
      </View>
    );
  };

  const renderDistribution = () => {
    const safeDistribution =
      distribution && distribution.length
        ? distribution
        : [5, 4, 3, 2, 1].map(star => ({
            star,
            count: 0,
            percentage: 0,
          }));

    return (
      <View style={styles.distributionWrap}>
        {safeDistribution.map(item => (
          <View key={item.star} style={styles.distributionLine}>
            <AppText style={styles.starNumber}>{item.star}  </AppText>
            
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${Math.min(item.percentage || 0, 100)}%`,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderListHeader = () => {
    return (
      <View>
        <View style={styles.summarySection}>
          <View style={styles.summaryRight}>
            <View style={styles.averageRow}>
              <AppText weight="bold" style={styles.averageNumber}>
                {Number(average || 0).toString()}
              </AppText>

              <AppText style={styles.outOfFive}>/5</AppText>
            </View>

            {renderStars(average)}

            <AppText style={styles.totalText}>
              {t('ratings.from_reviews', {
                count: total,
                defaultValue: `من ${total} تقييم`,
              })}
            </AppText>
          </View>

          <View style={styles.summaryLeft}>{renderDistribution()}</View>
        </View>

        <View style={styles.commentsHeader}>
          <AppText weight="bold" style={styles.commentsTitle}>
            {t('ratings.comments', {defaultValue: 'التعليقات'})}
          </AppText>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowSort(true)}
            style={styles.sortButton}>
            <Ionicons name="chevron-down" size={13} color="#111" />

            <AppText style={styles.sortText}>{activeSortLabel}</AppText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderReviewCard = ({item}) => {
    return (
      <View style={styles.reviewCard}>
        <View style={styles.cardTop}>
          

          <View style={styles.clientInfo}>
            <Image
              source={
                item?.client?.image
                  ? {uri: item.client.image}
                  : require('../../../../../assets/app/images/default_user.png')
              }
              style={styles.clientImage}
            />

            <View style={styles.clientTextWrap}>
              <AppText weight="bold" style={styles.clientName}>
                {item?.client?.name ||
                  t('ratings.client', {defaultValue: 'عميل'})}
              </AppText>

              <AppText style={styles.reviewDate}>{item.date}</AppText>
            </View>
          </View>
          <View style={styles.rateSmall}>
            

            <Ionicons name="star" size={17} color="#FF8A00" />
            <AppText weight="bold" style={styles.rateSmallText}>
              {item.rate}
            </AppText>
          </View>
        </View>

        <AppText style={styles.reviewComment}>
          {item.comment ||
            t('ratings.default_comment', {
              defaultValue: 'الخدمة كانت ممتازة والفني كان ملتزم بالموعد.',
            })}
        </AppText>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyWrap}>
        <Image
          source={emptyReviewsImage}
          style={styles.emptyImage}
          resizeMode="contain"
        />

        <AppText weight="bold" style={styles.emptyTitle}>
          {t('ratings.empty_title', {defaultValue: 'لا توجد تقييمات بعد'})}
        </AppText>

        <AppText style={styles.emptyDescription}>
          {t('ratings.empty_description', {
            defaultValue: 'عند إتمام الطلبات ستظهر تقييمات العملاء هنا.',
          })}
        </AppText>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) {
      return <View style={styles.footerSpace} />;
    }

    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color="#111" />
      </View>
    );
  };

  const renderSortBottomSheet = () => {
    return (
      <Modal
        visible={showSort}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSort(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSort(false)}>
          <Pressable style={styles.bottomSheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />

            {sortOptions.map((item, index) => {
              const selected = sort === item.key;

              return (
                <TouchableOpacity
                  key={item.key}
                  activeOpacity={0.85}
                  onPress={() => changeSort(item.key)}
                  style={[
                    styles.sheetItem,
                    index !== sortOptions.length - 1 &&
                      styles.sheetItemBorder,
                  ]}>
                  <AppText
                    weight={selected ? 'bold' : 'regular'}
                    style={[
                      styles.sheetItemText,
                      selected && styles.sheetItemTextActive,
                    ]}>
                    {item.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <AppHeader titleKey="ratings.title" onBack={goBack} />

          <View style={styles.loadingScreen}>
            <ActivityIndicator size="large" color="#111" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader titleKey="ratings.title" onBack={goBack} />

        <FlatList
          data={reviews}
          keyExtractor={item => String(item.id)}
          renderItem={renderReviewCard}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            reviews.length === 0 && styles.emptyListContent,
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
        />

        {renderSortBottomSheet()}
      </View>
    </SafeAreaView>
  );
};

export default RatingsScreen;

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
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyListContent: {
    flexGrow: 1,
  },

  summarySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 18,
    paddingHorizontal: 5,
  },
  summaryLeft: {
    flex: 1,
    paddingTop: 3,
    paddingRight: 6,
  },
  summaryRight: {
    flex: 1,
    alignItems: 'center',
  },

  distributionWrap: {
    width: '100%',
  },
  distributionLine: {
    height: 25,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  barTrack: {
    flex: 1,
    height: 11,
    borderRadius: 20,
    backgroundColor: '#E5E5E5',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 20,
    backgroundColor: '#3498DB',
  },
  starNumber: {
    width: 18,
    marginEnd: 5,
    fontSize: 16,
    color: '#111',
    textAlign: 'auto',
  },

  averageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfFive: {
    fontSize: 24,
    color: '#8E8E8E',
    marginBottom: 5,
    marginStart: 2,
  },
  averageNumber: {
    fontSize: 48,
    color: '#111',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  starIcon: {
    marginHorizontal: 1,
  },
  totalText: {
    marginTop: 7,
    fontSize: 16,
    color: '#777',
  },

  commentsHeader: {
    marginTop: 3,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commentsTitle: {
    fontSize: 16,
    color: '#111',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: 12,
    color: '#111',
    marginEnd: 4,
  },

  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 12,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  rateSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 2,
  },
  rateSmallText: {
    fontSize: 20,
    color: '#111',
    marginStart: 4,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientImage: {
    width: 42,
    height: 42,
    borderRadius: 55,
    backgroundColor: '#DDD',
  },
  clientTextWrap: {
    marginStart: 8,
    alignItems: 'flex-start',
  },
  clientName: {
    fontSize: 16,
    color: '#111',
  },
  reviewDate: {
    marginTop: 1,
    fontSize: 12,
    color: '#AAAAAA',
  },
  reviewComment: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
    lineHeight: 19,
    textAlign: 'auto',
  },

  emptyWrap: {
    flex: 1,
    minHeight: 360,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  emptyImage: {
    width: 125,
    height: 125,
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 20,
    color: '#111',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#9A9A9A',
    lineHeight: 18,
    textAlign: 'center',
  },

  loadingMore: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  footerSpace: {
    height: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginHorizontal: 6,
    paddingTop: 8,
    paddingBottom: 22,
    overflow: 'hidden',
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 20,
    backgroundColor: '#BDBDBD',
    alignSelf: 'center',
    marginBottom: 4,
  },
  sheetItem: {
    height: 33,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  sheetItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sheetItemText: {
    fontSize: 12,
    color: '#111111',
    textAlign: 'center',
  },
  sheetItemTextActive: {
    color: '#111111',
  },
});