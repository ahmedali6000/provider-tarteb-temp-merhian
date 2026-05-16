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
import {getMyBundles} from '../../../services/bundlesService';

const MySubscribedBundlesScreen = ({navigation}) => {
  const {t} = useTranslation();

  const tr = (key, fallback) => t(key, {defaultValue: fallback});

  const [activeBundles, setActiveBundles] = useState([]);
  const [previousBundles, setPreviousBundles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyBundles = useCallback(async ({isRefresh = false} = {}) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getMyBundles();

      setActiveBundles(response?.data?.active || []);
      setPreviousBundles(response?.data?.previous || []);
    } catch (error) {
      console.log(
        'MY SUBSCRIBED BUNDLES ERROR:',
        error?.response?.data || error?.message,
      );

      setActiveBundles([]);
      setPreviousBundles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMyBundles();
  }, [fetchMyBundles]);

  const onRefresh = () => {
    fetchMyBundles({isRefresh: true});
  };

  const hasAnyBundles = activeBundles.length > 0 || previousBundles.length > 0;

  const listData = useMemo(() => {
    const data = [];

    if (activeBundles.length > 0) {
      data.push({
        type: 'section',
        id: 'active-section',
        title: tr('bundles.active_bundles', 'الباقات النشطة'),
      });

      activeBundles.forEach(item => {
        data.push({
          type: 'active',
          ...item,
        });
      });
    }

    if (previousBundles.length > 0) {
      data.push({
        type: 'section',
        id: 'previous-section',
        title: tr('bundles.previous_bundles', 'الباقات السابقة'),
      });

      previousBundles.forEach(item => {
        data.push({
          type: 'previous',
          ...item,
        });
      });
    }

    return data;
  }, [activeBundles, previousBundles, t]);

  const renderSectionTitle = item => {
    return (
      <AppText weight="bold" style={styles.sectionTitle}>
        {item.title}
      </AppText>
    );
  };

  const renderActiveCard = item => {
    const progressPercent = Math.min(
      100,
      Math.max(0, Number(item.visits_progress || 0)),
    );

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.activeCard}
        >
        <View style={styles.cardPatternOne} />
        <View style={styles.cardPatternTwo} />

        <View style={styles.activeCardHeader}>
        

          <View style={styles.activeInfoWrap}>
            <View style={styles.crownBoxOrange}>
              <Ionicons name="basket" size={23} color="#F28B22" />
            </View>

            <View style={styles.bundleTitleWrap}>
              <AppText weight="bold" style={styles.activeBundleTitle}>
                {item.name}
              </AppText>

              <AppText style={styles.activeBundleSub}>
                {item.visits_done} {tr('bundles.completed_from', 'منتهية من')}{' '}
                {item.visits_total} {tr('bundles.visits', 'زيارات')}
              </AppText>
            </View>
          </View>
            <TouchableOpacity
            activeOpacity={0.86}
            style={styles.manageButton}
            >
            <AppText weight="bold" style={styles.manageButtonText}>
              {tr('bundles.manage_bundle', 'باقة نشطة')}
            </AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.nextRow}>
          <View style={styles.nextInfo}>
            <Ionicons name="calendar-outline" size={14} color="#1F1F1F" />
            <AppText style={styles.nextText}>
              {item.next_visit?.day_label || tr('bundles.no_next_visit', 'لا توجد زيارة')}
            </AppText>
          </View>

          <View style={styles.nextInfo}>
            <Ionicons name="time-outline" size={14} color="#1F1F1F" />
            <AppText style={styles.nextText}>
              {item.hour_label || '--:--'}
            </AppText>
          </View>
        </View>

        <View style={styles.progressRow}>
          <AppText style={styles.progressCount}>
            {item.visits_done}/{item.visits_total}
          </AppText>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercent}%`,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.endDateRow}>
          <Ionicons name="flag-outline" size={13} color="#A37B35" />
          <AppText style={styles.endDateText}>
            {tr('bundles.ends_at', 'تنتهي في')} {formatDate(item.end_at)}
          </AppText>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPreviousCard = item => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.previousCard}
        >
       

        <View style={styles.previousIconBox}>
          <Ionicons name="basket" size={25} color="#3296D9" />
        </View>

        <View style={styles.previousContent}>
          <AppText weight="bold" style={styles.previousTitle}>
            {item.name}
          </AppText>

          <AppText style={styles.previousSub}>
            {item.visits_total} {tr('bundles.completed_visits', 'زيارات مكتملة')}
          </AppText>

          <AppText style={styles.previousDate}>
            {tr('bundles.ended_at', 'انتهت في')} {formatDate(item.end_at)}
          </AppText>
        </View>

         <View style={styles.finishedPill}>
          <AppText style={styles.finishedPillText}>
            {tr('bundles.finished', 'منتهية')}
          </AppText>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({item}) => {
    if (item.type === 'section') {
      return renderSectionTitle(item);
    }

    if (item.type === 'active') {
      return renderActiveCard(item);
    }

    return renderPreviousCard(item);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader
          titleKey="bundles.my_bundles"
          onBack={() => navigation.goBack()}
        />

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#3296D9" />
          </View>
        ) : (
          <FlatList
            data={listData}
            keyExtractor={item => String(item.id)}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              !hasAnyBundles && styles.emptyListContent,
            ]}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIconBox}>
                  <Ionicons name="basket-outline" size={42} color="#A5A5A5" />
                </View>

                <AppText weight="bold" style={styles.emptyTitle}>
                  {tr('bundles.no_my_bundles_title', 'لا توجد باقات لديك حاليا')}
                </AppText>

                <AppText style={styles.emptySubtitle}>
                  {tr(
                    'bundles.no_my_bundles_subtitle',
                    'يمكنك اختيار باقة مناسبة والاشتراك بها بسهولة',
                  )}
                </AppText>

                <TouchableOpacity
                  activeOpacity={0.88}
                  style={styles.emptyButton}
                  onPress={() => navigation.navigate('BundlesScreen')}>
                  <AppText weight="bold" style={styles.emptyButtonText}>
                    {tr('bundles.show_bundles', 'عرض الباقات')}
                  </AppText>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default MySubscribedBundlesScreen;

const formatDate = date => {
  if (!date) {
    return '';
  }

  return String(date);
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
    alignItems: 'center',
    justifyContent: 'center',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 100,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  sectionTitle: {
    fontSize: 14,
    color: '#1F1F1F',
    textAlign: 'auto',
    marginBottom: 10,
    marginTop: 6,
  },

  activeCard: {
    minHeight: 122,
    borderRadius: 20,
    backgroundColor: '#FFE3BC',
    paddingHorizontal: 13,
    paddingVertical: 13,
    marginBottom: 18,
    overflow: 'hidden',
  },

  cardPatternOne: {
    position: 'absolute',
    width: 150,
    height: 90,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.28)',
    start: -45,
    top: -20,
    transform: [{rotate: '25deg'}],
  },

  cardPatternTwo: {
    position: 'absolute',
    width: 180,
    height: 90,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.18)',
    end: 30,
    bottom: -38,
    transform: [{rotate: '-18deg'}],
  },

  activeCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    zIndex: 2,
  },

  manageButton: {
    backgroundColor: '#F28B22',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  manageButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
  },

  activeInfoWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    marginStart: 8,
  },

  crownBoxOrange: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFD59F',
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 9,
  },

  bundleTitleWrap: {
    alignItems: 'flex-start',
    flex: 1,
  },

  activeBundleTitle: {
    fontSize: 16,
    color: '#1F1F1F',
    textAlign: 'auto',
  },

  activeBundleSub: {
    fontSize: 12,
    color: '#8B6D3F',
    textAlign: 'auto',
    marginTop: 2,
  },

  nextRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },

  nextInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  nextText: {
    fontSize: 12,
    color: '#1F1F1F',
    marginStart: 4,
    textAlign: 'auto',
  },

  progressRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },

  progressCount: {
    fontSize: 12,
    color: '#8B6D3F',
    marginEnd: 8,
  },

  progressTrack: {
    flex: 1,
    height: 7,
    borderRadius: 20,
    backgroundColor: '#DCE6EC',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 20,
    backgroundColor: '#F28B22',
  },

  endDateRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 2,
  },

  endDateText: {
    fontSize: 12,
    color: '#8B6D3F',
    marginStart: 4,
  },

  previousCard: {
    minHeight: 82,
    borderRadius: 16,
    backgroundColor: '#F1F1F1',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  finishedPill: {
    borderWidth: 1,
    borderColor: '#3296D9',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
  },

  finishedPillText: {
    fontSize: 12,
    color: '#3296D9',
  },

  previousIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#DFF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },

  previousContent: {
    flex: 1,
    alignItems: 'flex-start',
  },

  previousTitle: {
    fontSize: 16,
    color: '#1F1F1F',
    textAlign: 'auto',
  },

  previousSub: {
    fontSize: 13,
    color: '#777777',
    textAlign: 'auto',
    marginTop: 2,
  },

  previousDate: {
    fontSize: 12,
    color: '#777777',
    textAlign: 'auto',
    marginTop: 3,
  },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 80,
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

  emptyButton: {
    backgroundColor: '#3296D9',
    borderRadius: 16,
    paddingHorizontal: 58,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
});