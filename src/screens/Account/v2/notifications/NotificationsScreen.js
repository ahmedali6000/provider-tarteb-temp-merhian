import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useTranslation} from 'react-i18next';

import AppHeader from '../../../../shared/AppHeader';
import AppText from '../../../../shared/AppText';
import {
  getNotifications,
  getNotificationDetails,
  markAllNotificationsAsRead,
} from '../../../../services/notificationService';

const NotificationsScreen = ({navigation}) => {
  const {t} = useTranslation();

  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchNotifications = useCallback(
    async ({pageNumber = 1, isRefresh = false} = {}) => {
      try {
        if (pageNumber === 1 && !isRefresh) {
          setLoading(true);
        } else if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoadingMore(true);
        }

        const response = await getNotifications({
          page: pageNumber,
          perPage: 15,
        });

        const newData = response?.data || [];
        const meta = response?.meta || {};

        if (pageNumber === 1) {
          setNotifications(newData);
        } else {
          setNotifications(prev => [...prev, ...newData]);
        }

        setPage(meta?.current_page || pageNumber);
        setHasMorePages(!!meta?.has_more_pages);
      } catch (error) {
        console.log('NOTIFICATIONS ERROR:', error?.response?.data || error?.message);
        if (pageNumber === 1) {
          setNotifications([]);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchNotifications({pageNumber: 1});
  }, [fetchNotifications]);

  const onRefresh = () => {
    fetchNotifications({pageNumber: 1, isRefresh: true});
  };

  const onEndReached = () => {
    if (!loadingMore && hasMorePages && notifications.length > 0) {
      fetchNotifications({pageNumber: page + 1});
    }
  };

  const handleOpenNotification = async item => {
    try {
      setSheetVisible(true);
      setSelectedNotification(item);
      setDetailsLoading(true);

      setNotifications(prev =>
        prev.map(n =>
          n.id === item.id ? {...n, is_read: true} : n,
        ),
      );

      const response = await getNotificationDetails(item.id);
      setSelectedNotification(response?.data || item);
    } catch (error) {
      console.log('NOTIFICATION DETAILS ERROR:', error?.response?.data || error?.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleReadAll = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(item => ({...item, is_read: true})));
    } catch (error) {
      console.log('READ ALL ERROR:', error?.response?.data || error?.message);
    }
  };

  const renderNotification = ({item}) => {
    const isRead = item.is_read;

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={[
          styles.notificationRow,
          !isRead && styles.notificationUnread,
        ]}
        onPress={() => handleOpenNotification(item)}>
        <View style={styles.bellBox}>
          <Ionicons
            name={isRead ? 'notifications-outline' : 'notifications'}
            size={20}
            color={isRead ? '#1F1F1F' : '#3296D9'}
          />
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.notificationTopRow}>
            <AppText weight="bold" style={styles.notificationTitle} numberOfLines={1}>
              {item.title}
            </AppText>

            <AppText style={styles.notificationTime}>
              {item.created_time || item.created_at}
            </AppText>
          </View>

          <AppText style={styles.notificationBody} numberOfLines={1}>
            {item.body}
          </AppText>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyComponent = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyWrap}>
        <Image
          source={require('../../../../../assets/app/images/vectors/no-notifications.png')}
          style={styles.emptyImage}
          resizeMode="contain"
        />

        <AppText weight="bold" style={styles.emptyTitle}>
          {t('notifications.empty_title')}
        </AppText>

        <AppText style={styles.emptySubtitle}>
          {t('notifications.empty_subtitle')}
        </AppText>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerWrap}>
          <AppHeader
            titleKey="notifications.title"
            onBack={() => navigation.goBack()}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.readAllButton}
            onPress={handleReadAll}>
            <AppText weight="bold" style={styles.readAllText}>
              {t('notifications.mark_all_read')}
            </AppText>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#3296D9" />
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={item => String(item.id)}
            renderItem={renderNotification}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              notifications.length === 0 && styles.emptyListContent,
            ]}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onEndReached={onEndReached}
            onEndReachedThreshold={0.35}
            ListEmptyComponent={<EmptyComponent />}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color="#3296D9" />
                </View>
              ) : null
            }
          />
        )}

        <Modal
          visible={sheetVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setSheetVisible(false)}>
          <Pressable
            style={styles.sheetOverlay}
            onPress={() => setSheetVisible(false)}>
            <Pressable style={styles.sheetContainer} onPress={() => {}}>
              <View style={styles.sheetHandle} />

              {detailsLoading ? (
                <View style={styles.detailsLoader}>
                  <ActivityIndicator size="large" color="#3296D9" />
                </View>
              ) : (
                <>
                  <View style={styles.sheetBellBox}>
                    <Ionicons
                      name="notifications-outline"
                      size={26}
                      color="#3296D9"
                    />
                  </View>

                  <AppText weight="bold" style={styles.sheetTitle}>
                    {selectedNotification?.title}
                  </AppText>

                  <AppText style={styles.sheetTime}>
                    {selectedNotification?.created_time ||
                      selectedNotification?.created_at}
                  </AppText>

                  {selectedNotification?.image ? (
                    <Image
                      source={{uri: selectedNotification.image}}
                      style={styles.sheetImage}
                      resizeMode="cover"
                    />
                  ) : null}

                  <AppText style={styles.sheetBody}>
                    {selectedNotification?.body}
                  </AppText>

                  <TouchableOpacity
                    activeOpacity={0.88}
                    style={styles.sheetButton}
                    onPress={() => setSheetVisible(false)}>
                    <AppText weight="bold" style={styles.sheetButtonText}>
                      {t('common.ok')}
                    </AppText>
                  </TouchableOpacity>
                </>
              )}
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    position: 'relative',
  },
  readAllButton: {
    position: 'absolute',
    end: 16,
    top: 22,
    zIndex: 10,
  },
  readAllText: {
    fontSize: 14,
    color: '#F28A1A',
  },

  listContent: {
    paddingTop: 14,
    paddingBottom: 30,
  },
  emptyListContent: {
    flexGrow: 1,
  },

  notificationRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E3E3E3',
    backgroundColor: '#F5F5F5',
  },
  notificationUnread: {
    backgroundColor: '#EAF4FB',
  },

  bellBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#3296D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 12,
    backgroundColor: '#F8FCFF',
  },

  notificationContent: {
    flex: 1,
  },
  notificationTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTitle: {
    flex: 1,
    fontSize: 15,
    color: '#1F1F1F',
    textAlign: 'auto',
  },
  notificationTime: {
    fontSize: 12,
    color: '#8A8A8A',
    marginStart: 10,
  },
  notificationBody: {
    marginTop: 6,
    fontSize: 13,
    color: '#8A8A8A',
    textAlign: 'auto',
  },

  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 70,
  },
  emptyImage: {
    width: 135,
    height: 135,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    color: '#1F1F1F',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8A8A8A',
    lineHeight: 22,
    textAlign: 'center',
  },

  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopEndRadius: 28,
    borderTopStartRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
    minHeight: 280,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 8,
    backgroundColor: '#D7D7D7',
    alignSelf: 'center',
    marginBottom: 18,
  },
  detailsLoader: {
    minHeight: 210,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetBellBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#EAF4FB',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 20,
    color: '#1F1F1F',
    textAlign: 'center',
    marginBottom: 6,
  },
  sheetTime: {
    fontSize: 13,
    color: '#8A8A8A',
    textAlign: 'center',
    marginBottom: 14,
  },
  sheetImage: {
    height: 150,
    borderRadius: 16,
    marginBottom: 14,
  },
  sheetBody: {
    fontSize: 15,
    color: '#555555',
    lineHeight: 25,
    textAlign: 'center',
    marginBottom: 22,
  },
  sheetButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#3296D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
  },
});