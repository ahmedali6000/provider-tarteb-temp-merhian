import React, {useCallback, useMemo, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  I18nManager,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useFocusEffect} from '@react-navigation/native';

import AppText from '../../../../shared/AppText';
import {getChatConversations} from '../../../../services/chatService';
import AppHeader from '../../../../shared/AppHeader';
import {listenChatMessageReceived} from '../../../../events/chatRealtimeEvents';

const emptyMessagesImage = require('../../../../../assets/app/images/empty_messages.png');
const defaultUserImage = require('../../../../../assets/app/images/default_user.png');

const MessagesScreen = ({navigation}) => {
  const {t, i18n} = useTranslation();
  const isRTL = i18n.language === 'ar' || I18nManager.isRTL;

  const tabs = useMemo(
    () => [
      {
        key: 'all',
        title: t('messages.filters.all', {defaultValue: 'الكل'}),
      },
      {
        key: 'new',
        title: t('messages.filters.new', {defaultValue: 'طلبات جديدة'}),
      },
      {
        key: 'upcoming',
        title: t('messages.filters.upcoming', {defaultValue: 'طلبات قادمة'}),
      },
      {
        key: 'active',
        title: t('messages.filters.active', {defaultValue: 'طلبات جارية'}),
      },
    ],
    [t],
  );

  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [conversations, setConversations] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const getNowTime = () => {
    const date = new Date();

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const fetchConversations = useCallback(
    async ({selectedFilter = activeTab, pageNumber = 1, refresh = false} = {}) => {
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

        const response = await getChatConversations({
          filter: selectedFilter,
          page: pageNumber,
          perPage: 20,
        });

        const list = response?.data || [];
        const pagination = response?.pagination || {};

        setPage(pagination?.current_page || pageNumber);
        setLastPage(pagination?.last_page || 1);

        if (pageNumber === 1) {
          setConversations(list);
        } else {
          setConversations(prev => {
            const existingIds = new Set(
              prev.map(item => String(item?.conversation_id || item?.id)),
            );

            const newItems = list.filter(
              item =>
                !existingIds.has(String(item?.conversation_id || item?.id)),
            );

            return [...prev, ...newItems];
          });
        }
      } catch (error) {
        console.log(
          'GET CONVERSATIONS ERROR:',
          error?.response?.data || error?.message,
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [activeTab],
  );

  useFocusEffect(
    useCallback(() => {
      fetchConversations({
        selectedFilter: activeTab,
        pageNumber: 1,
      });
    }, [activeTab, fetchConversations]),
  );

  const updateConversationFromIncomingMessage = useCallback(
    incoming => {
      const incomingConversationId =
        incoming?.conversation_id || incoming?.conversationId;

      if (!incomingConversationId) {
        return;
      }

      setConversations(prev => {
        let found = false;

        const updatedList = prev.map(item => {
          const itemConversationId = item?.conversation_id || item?.id;

          if (String(itemConversationId) !== String(incomingConversationId)) {
            return item;
          }

          found = true;

          const incomingSenderId = incoming?.sender_id;
          const otherUserId = item?.other_user?.id;

          const isFromOtherUser =
            String(incomingSenderId) === String(otherUserId);

          const oldUnreadCount = Number(item?.unread_count || 0);

          return {
            ...item,
            last_message_id: incoming?.message_id || incoming?.id,
            last_message_text:
              incoming?.body ||
              incoming?.message ||
              incoming?.notification_body ||
              '',
            last_message_at: incoming?.created_at || new Date().toISOString(),
            last_message_time: incoming?.time || getNowTime(),
            unread_count: isFromOtherUser
              ? oldUnreadCount + 1
              : oldUnreadCount,
          };
        });

        if (!found) {
          fetchConversations({
            selectedFilter: activeTab,
            pageNumber: 1,
          });

          return prev;
        }

        const targetItem = updatedList.find(item => {
          const itemConversationId = item?.conversation_id || item?.id;

          return String(itemConversationId) === String(incomingConversationId);
        });

        const restItems = updatedList.filter(item => {
          const itemConversationId = item?.conversation_id || item?.id;

          return String(itemConversationId) !== String(incomingConversationId);
        });

        return targetItem ? [targetItem, ...restItems] : updatedList;
      });
    },
    [activeTab, fetchConversations],
  );

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = listenChatMessageReceived(incoming => {
        console.log('CHAT MESSAGE EVENT IN MESSAGES LIST:', incoming);
        updateConversationFromIncomingMessage(incoming);
      });

      return unsubscribe;
    }, [updateConversationFromIncomingMessage]),
  );

  const onRefresh = () => {
    fetchConversations({
      selectedFilter: activeTab,
      pageNumber: 1,
      refresh: true,
    });
  };

  const onLoadMore = () => {
    if (loading || loadingMore || page >= lastPage) {
      return;
    }

    fetchConversations({
      selectedFilter: activeTab,
      pageNumber: page + 1,
    });
  };

  const onPressTab = tabKey => {
    if (tabKey === activeTab) {
      return;
    }

    setActiveTab(tabKey);
    setPage(1);
  };

  const openConversation = item => {
    setConversations(prev =>
      prev.map(conversation => {
        const conversationId =
          conversation?.conversation_id || conversation?.id;

        if (String(conversationId) === String(item?.conversation_id || item?.id)) {
          return {
            ...conversation,
            unread_count: 0,
          };
        }

        return conversation;
      }),
    );

    navigation.navigate('ProviderConversationScreen', {
      conversationId: item?.conversation_id,
      orderId: item?.order_id,
      otherUser: item?.other_user,
      title: item?.other_user?.name,
    });
  };

  const formatTime = time => {
    if (!time) {
      return '';
    }

    return time;
  };

  const renderTabs = () => {
    return (
      <View style={styles.tabsRow}>
        {tabs.map(tab => {
          const active = activeTab === tab.key;

          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.85}
              onPress={() => onPressTab(tab.key)}
              style={[styles.tabItem, active && styles.tabItemActive]}>
              <AppText
                style={[styles.tabText, active && styles.tabTextActive]}>
                {tab.title}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderHeader = () => {
    return <View>{renderTabs()}</View>;
  };

  const renderConversationItem = ({item, index}) => {
    const unreadCount = Number(item?.unread_count || 0);
    const timeText = formatTime(item?.last_message_time);

    const userName =
      item?.other_user?.name ||
      t('messages.client_name', {defaultValue: 'العميل'});

    const messageText =
      item?.last_message_text ||
      t('messages.default_message', {defaultValue: 'ابدأ المحادثة الآن'});

    const userImage = item?.other_user?.image;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => openConversation(item)}
        style={[styles.rowWrap, index === 0 && styles.firstRowWrap]}>
        <View style={styles.mainRowContent}>
          <Image
            source={userImage ? {uri: userImage} : defaultUserImage}
            style={styles.avatar}
          />

          <View style={styles.textArea}>
            <AppText weight="bold" style={styles.userName} numberOfLines={1}>
              {userName}
            </AppText>

            <AppText style={styles.messagePreview} numberOfLines={1}>
              {messageText}
            </AppText>
          </View>
        </View>

        <View style={styles.leftMeta}>
          <AppText style={styles.timeText}>{timeText}</AppText>

          {unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <AppText weight="bold" style={styles.unreadBadgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </AppText>
            </View>
          ) : (
            <View style={styles.unreadPlaceholder} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyWrap}>
        <Image
          source={emptyMessagesImage}
          resizeMode="contain"
          style={styles.emptyImage}
        />

        <AppText weight="bold" style={styles.emptyTitle}>
          {t('messages.empty_title', {
            defaultValue: 'لا توجد رسائل حتى الآن',
          })}
        </AppText>

        <AppText style={styles.emptyDescription}>
          {t('messages.empty_description', {
            defaultValue:
              'ستظهر هنا الرسائل بينك وبين العملاء عند بدء أي محادثة.',
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
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#1D1D1D" />
      </View>
    );
  };

  if (loading && conversations.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <AppHeader
            titleKey="messages.title"
            onBack={() => navigation.goBack()}
          />

          {renderHeader()}

          <View style={styles.loadingScreen}>
            <ActivityIndicator size="large" color="#1D1D1D" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader
          titleKey="messages.title"
          onBack={() => navigation.goBack()}
        />

        <FlatList
          data={conversations}
          keyExtractor={item => String(item.conversation_id || item.id)}
          renderItem={renderConversationItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            conversations.length === 0 && styles.emptyListContent,
          ]}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.25}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default MessagesScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  listContent: {
    paddingBottom: 22,
  },
  emptyListContent: {
    flexGrow: 1,
  },

  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  tabItem: {
    minWidth: 78,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginEnd: 8,
  },
  tabItemActive: {
    borderColor: '#F28A1A',
    backgroundColor: '#FFF9F3',
  },
  tabText: {
    fontSize: 13,
    color: '#5B5B5B',
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#1D1D1D',
  },

  rowWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  firstRowWrap: {
    paddingTop: 0,
  },
  mainRowContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3E3E3',
  },
  textArea: {
    flex: 1,
    marginStart: 12,
  },
  userName: {
    fontSize: 15,
    color: '#1D1D1D',
    textAlign: 'auto',
    marginBottom: 4,
  },
  messagePreview: {
    fontSize: 13,
    color: '#9C9C9C',
    textAlign: 'auto',
  },

  leftMeta: {
    width: 52,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#8B8B8B',
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F28A1A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginTop: 8,
  },
  unreadBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  unreadPlaceholder: {
    height: 24,
    marginTop: 8,
  },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    minHeight: 470,
  },
  emptyImage: {
    width: 170,
    height: 170,
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 20,
    color: '#1D1D1D',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 15,
    color: '#8D8D8D',
    textAlign: 'center',
    lineHeight: 25,
  },

  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  footerSpace: {
    height: 8,
  },
});