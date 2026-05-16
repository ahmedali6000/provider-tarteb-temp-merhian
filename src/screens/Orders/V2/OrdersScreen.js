import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import Ionicons from '@react-native-vector-icons/ionicons';

import AppHeader from '../../../shared/AppHeader';
import AppText from '../../../shared/AppText';
import {getMyOrders} from '../../../services/orderService';

const OrdersScreen = ({navigation}) => {
  const {t} = useTranslation();

  const [activeTab, setActiveTab] = useState('pending');
  const [sortBy, setSortBy] = useState('latest');
  const [sortVisible, setSortVisible] = useState(false);

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const tabs = [
    {key: 'pending', label: t('orders.pending')},
    {key: 'accepted', label: t('orders.accepted')},
    {key: 'complete', label: t('orders.complete')},
    {key: 'canceled', label: t('orders.canceled')},
  ];

  const fetchOrders = useCallback(
    async ({pageNumber = 1, isRefresh = false} = {}) => {
      try {
        if (pageNumber === 1 && !isRefresh) {
          setLoading(true);
        } else if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoadingMore(true);
        }

        const response = await getMyOrders({
          status: activeTab,
          page: pageNumber,
          perPage: 10,
          sort: sortBy,
        });

        const newData = response?.data || [];
        const meta = response?.meta || {};

        if (pageNumber === 1) {
          setOrders(newData);
        } else {
          setOrders(prev => [...prev, ...newData]);
        }

        setPage(meta?.current_page || pageNumber);
        setHasMorePages(!!meta?.has_more_pages);
      } catch (error) {
        console.log('ORDERS ERROR:', error?.response?.data || error?.message);
        if (pageNumber === 1) {
          setOrders([]);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [activeTab, sortBy],
  );

  useEffect(() => {
    fetchOrders({pageNumber: 1});
  }, [fetchOrders]);

  const onRefresh = () => {
    fetchOrders({pageNumber: 1, isRefresh: true});
  };

  const onEndReached = () => {
    if (!loadingMore && hasMorePages && orders.length > 0) {
      fetchOrders({pageNumber: page + 1});
    }
  };

 const renderOrderItem = ({item}) => {
  const isAccepted = item.status === 'accepted';
  const hasProvider = !!item.provider;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.card}
      onPress={() => {
  const targetScreen =
    item.status === 'complete' || item.status === 'canceled'
      ? 'OrderFullDetailsScreen'
      : 'OrderSummaryScreen';

  navigation.navigate(targetScreen, {
    order_id: item.id,
  });
}}>
      <View
        style={[
          styles.cardSideColor,
          {backgroundColor: item.status_color || '#F5A623'},
        ]}
      />

      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
         

          <View style={styles.titleWrap}>
            <AppText weight="bold" style={styles.orderTitle}>
              {item.order_no} 
              <AppText  weight="bold" style={{color:'#9e9e9e'}}> | </AppText>
               {item.title}
            </AppText>
          </View>

           <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: item.status_color
                  ? `${item.status_color}20`
                  : '#FFF4DE',
              },
            ]}>
            <AppText
              weight="medium"
              style={[
                styles.statusBadgeText,
                {color: item.status_color || '#F5A623'},
              ]}>
              {item.status_label}
            </AppText>
          </View>
          
        </View>

        <View style={styles.middleRow}>
        
         

          <View style={styles.dateTimeWrap}>
             <View style={{flexDirection:'row'}}>

               <Ionicons name="calendar-outline" size={15} color="#1F1F1F" />
            <AppText style={styles.dateText}>
              {item.date} | {(item.hour) ? item.hour : '-- : --'}
            </AppText>
             </View>
          </View>

           <AppText weight="bold" style={styles.priceText}>
            {item.price}
            <AppText style={styles.currencyText}>
              {' '}{t('orders.currency')}
            </AppText>
          </AppText>
        </View>

        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={15} color="#8B8B8B" />
          <AppText style={styles.addressText}>
            {item.address}
          </AppText>
        </View>

        {hasProvider ? (
          <>
            <View style={styles.cardDivider} />

            <View style={styles.providerRow}>
       

              <View style={styles.providerInfo}>
                  <Image
                  source={
                    item.provider.image
                      ? {uri: item.provider.image}
                      : require('../../../../assets/app/data/avatar.png')
                  }
                  style={styles.providerImage}
                />
                <AppText weight="bold" style={styles.providerName}>
                  {item.provider.name}
                </AppText>

              
              </View>
                     {(isAccepted && hasProvider) ? (
                      <TouchableOpacity
                        style={styles.chatButton}
                        activeOpacity={0.85}
                        onPress={() => {
                            navigation.navigate('OrderChatScreen', {
                              order_id: item?.id,
                              provider_id: item?.provider_id,
                              provider: {
                                id: item?.provider_id,
                                name: item.provider.name,
                                image: item.provider.image,
                                job: item.provider.categoryName,
                              },
                            });
                          }}>
                        <AppText weight="bold" style={styles.chatButtonText}>
                          {t('orders.chat_provider')}
                        </AppText>
                      </TouchableOpacity>
                    ) : (
                <View />
              )}
            </View>
          </>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

  const emptyText = useMemo(() => {
    if (activeTab === 'pending') return t('orders.no_pending');
    if (activeTab === 'accepted') return t('orders.no_accepted');
    if (activeTab === 'complete') return t('orders.no_complete');
    return t('orders.no_canceled');
  }, [activeTab, t]);


  const emptySubtitle = useMemo(() => {
  if (activeTab === 'pending') {
    return t('orders.empty_pending_sub');
  }
  if (activeTab === 'accepted') {
    return t('orders.empty_accepted_sub');
  }
  if (activeTab === 'complete') {
    return t('orders.empty_complete_sub');
  }
  return t('orders.empty_canceled_sub');
}, [activeTab, t]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader
          titleKey="orders.title"
          onBack={() => navigation.goBack()}
        />

        <View style={styles.tabsRow}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;

            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.85}
                style={styles.tabItem}
                onPress={() => setActiveTab(tab.key)}>
                <AppText
                  weight={isActive ? 'bold' : 'regular'}
                  style={[styles.tabText, isActive && styles.activeTabText]}>
                  {tab.label}
                </AppText>
                {isActive ? <View style={styles.activeLine} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sortRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.sortButton}
            onPress={() => setSortVisible(true)}>
           
            <AppText style={styles.sortPrefix}>{t('orders.sort_by')}</AppText>
             
            <AppText weight="medium" style={styles.sortText}>
              {sortBy === 'latest'
                ? t('orders.sort_latest')
                : t('orders.sort_oldest')}
            </AppText>
            <Ionicons name="caret-down-outline" size={15} color="#1F1F1F" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#3B97D3" />
          </View>
        ) : (
         <FlatList
  data={orders}
  keyExtractor={item => String(item.id)}
  renderItem={renderOrderItem}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={[
    styles.listContent,
    orders.length === 0 && styles.emptyListContent,
  ]}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
  onEndReached={onEndReached}
  onEndReachedThreshold={0.3}
  ListEmptyComponent={
    <View style={styles.emptyWrap}>
      <Image
        source={require('../../../../assets/app/images/vectors/no-orders.png')}
        style={styles.emptyImage}
        resizeMode="contain"
      />

      <AppText weight="bold" style={styles.emptyTitle}>
        {emptyText}
      </AppText>

      <View style={{paddingHorizontal:50}}>
        <AppText style={styles.emptySubtitle}>
         {emptySubtitle}
      </AppText>
      </View>

      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.emptyButton}
        onPress={() => navigation.navigate('HomeStack')}>
        <AppText weight="bold" style={styles.emptyButtonText}>
          {t('orders.order_service')}
        </AppText>
      </TouchableOpacity>
    </View>
  }
  ListFooterComponent={
    loadingMore ? (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#3B97D3" />
      </View>
    ) : null
  }
/>
        )}

        <Modal
          visible={sortVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setSortVisible(false)}>
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setSortVisible(false)}>
            <Pressable style={styles.sortSheet} onPress={() => {}}>
              <View style={styles.sheetHandle} />

              <AppText weight="bold" style={styles.sheetTitle}>
                {t('orders.sort_title')}
              </AppText>

              <TouchableOpacity
                style={styles.sheetOption}
                onPress={() => {
                  setSortBy('latest');
                  setSortVisible(false);
                }}>
                <AppText style={styles.sheetOptionText}>
                  {t('orders.sort_latest')}
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sheetOption}
                onPress={() => {
                  setSortBy('oldest');
                  setSortVisible(false);
                }}>
                <AppText style={styles.sheetOptionText}>
                  {t('orders.sort_oldest')}
                </AppText>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    marginTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 8,
  },
  tabText: {
    fontSize: 14,
    color: '#7C7C7C',
  },
  activeTabText: {
    color: '#1F1F1F',
  },
  activeLine: {
    marginTop: 8,
    width: 34,
    height: 2.5,
    borderRadius: 10,
    backgroundColor: '#4AA5E6',
  },

  sortRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  sortPrefix: {
    fontSize: 13,
    color: '#4A4A4A',
    marginEnd: 3,
  },
  sortText: {
    fontSize: 13,
    color: '#1F1F1F',
    marginHorizontal: 5,
  },

listContent: {
  paddingHorizontal: 16,
  paddingBottom: 120,
},

emptyListContent: {
  flexGrow: 1,
},

emptyWrap: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 28,
  paddingBottom: 90,
},

emptyImage: {
  width: 150,
  height: 150,
  marginBottom: 18,
},

emptyTitle: {
  fontSize: 20,
  color: '#1F1F1F',
  textAlign: 'center',
  marginBottom: 10,
},

emptySubtitle: {
  fontSize: 15,
  color: '#8A8A8A',
  textAlign: 'center',
  lineHeight: 25,
  marginBottom: 22,
},

emptyButton: {
//   width: '100%',
//   height: 52,
paddingHorizontal:100,
paddingVertical:18,
  backgroundColor: '#3296D9',
  borderRadius: 16,
  justifyContent: 'center',
  alignItems: 'center',
},

emptyButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
},

  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
 
   
  card: {
  marginTop: 12,
  backgroundColor: '#ECECEC',
  borderRadius: 18,
  overflow: 'hidden',
  flexDirection: 'row',
},

cardSideColor: {
  width: 5,
  borderTopRightRadius: 18,
  borderBottomRightRadius: 18,
},

cardContent: {
  flex: 1,
  paddingHorizontal: 14,
  paddingVertical: 14,
},

cardTopRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
},

statusBadge: {
  borderRadius: 16,
  paddingHorizontal: 12,
  paddingVertical: 6,
},

statusBadgeText: {
  fontSize: 12,
},

titleWrap: {
  flex: 1,
  alignItems: 'flex-start',
  marginStart: 10,
},

orderTitle: {
  fontSize: 15,
  color: '#1F1F1F',
  textAlign: 'auto',
  lineHeight: 22,
},

middleRow: {
  marginTop: 10,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

priceText: {
  fontSize: 17,
  color: '#1F1F1F',
},

currencyText: {
  fontSize: 13,
  color: '#7E7E7E',
},

dateTimeWrap: {
  // flexDirection:'row',
  // backgroundColor:'red',
  flex: 1,
  alignItems: 'flex-start',
  marginStart: 2,
},

dateText: {
  fontSize: 13,
  color: '#666666',
  textAlign: 'auto',
  marginStart:5
},

addressRow: {
  marginTop: 8,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
},

addressText: {
  marginStart: 4,
  fontSize: 13,
  color: '#666666',
  textAlign: 'auto',
},

cardDivider: {
  marginTop: 10,
  height: 1,
  backgroundColor: '#DDDDDD',
},

providerRow: {
  marginTop: 12,
  flexDirection: 'row',
  // backgroundColor:'red',
  justifyContent: 'space-between',
  alignItems: 'center',
},

providerInfo: {
  flexDirection: 'row',
  alignItems: 'center',
},

providerName: {
  fontSize: 15,
  color: '#1F1F1F',
  marginStart: 10,
},

providerImage: {
  width: 38,
  height: 38,
  borderRadius: 19,
  backgroundColor: '#DDD',
},

chatButton: {
  backgroundColor: '#3296D9',
  borderRadius: 14,
  paddingHorizontal: 16,
  paddingVertical: 9,
},

chatButtonText: {
  color: '#FFFFFF',
  fontSize: 13,
},
 

  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    color: '#8A8A8A',
    fontSize: 14,
  },

  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-end',
  },
  sortSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 8,
    backgroundColor: '#D4D4D4',
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetTitle: {
    textAlign: 'center',
    fontSize: 18,
    color: '#1F1F1F',
    marginBottom: 16,
  },
  sheetOption: {
    minHeight: 50,
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  sheetOptionText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#1F1F1F',
  },
});