import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  RefreshControl,
  Keyboard,
  BackHandler,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useFocusEffect} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import AppText from '../../../../shared/AppText';
import {
  getConversationMessages,
  sendConversationMessage,
  markConversationAsRead,
  getChatQuickReplies,
} from '../../../../services/chatService';
import {listenChatMessageReceived} from '../../../../events/chatRealtimeEvents';

const COLORS = {
  main: '#3296D9',
  mainDark: '#2388C8',
  bg: '#FFFFFF',
  white: '#FFFFFF',
  text: '#151515',
  muted: '#8A8A8A',
  border: '#E9E9E9',
  danger: '#E84D5B',
  bubbleMine: '#3296D9',
  bubbleOther: '#FFFFFF',
  quickBg: '#FFFFFF',
  quickBorder: '#F28B32',
};

const DEFAULT_AVATAR = 'https://tarteb.app/boy.png';
const PER_PAGE = 20;

/*
 * نفس فكرة شاشة العميل:
 * ده مش ارتفاع الكيبورد نفسه.
 * دي مساحة بسيطة تمنع الـ input من اللزق أو الطفو الغلط فوق اقتراحات iOS.
 * لو لسه قريب من الكيبورد زودها لـ 52.
 * لو عالي قللها لـ 34.
 */
const IOS_INPUT_EXTRA_SPACE_WHEN_KEYBOARD_OPEN = 44;

const ProviderConversationScreen = ({navigation, route}) => {
  const {t, i18n} = useTranslation();
  const insets = useSafeAreaInsets();

  const isRTL = i18n.language === 'ar';
  const currentUserId = useSelector(state => state.auth.user?.id);

  const flatListRef = useRef(null);
  const loadingMoreRef = useRef(false);
  const didInitialLoadRef = useRef(false);
  const canLoadMoreRef = useRef(false);

  const conversationRef = useRef(null);
  const currentUserIdRef = useRef(null);
  const pendingIncomingMessagesRef = useRef([]);

  const conversationId = route?.params?.conversationId;
  const orderId = route?.params?.orderId;
  const otherUser = route?.params?.otherUser || {};
  const title = route?.params?.title || otherUser?.name || '';

  const [conversation, setConversation] = useState(
    conversationId
      ? {
          id: conversationId,
          order_id: orderId,
        }
      : null,
  );

  const [client, setClient] = useState({
    id: otherUser?.id,
    name: title || otherUser?.name || '',
    image: otherUser?.image || DEFAULT_AVATAR,
    phone: otherUser?.phone,
  });

  const [messages, setMessages] = useState([]);
  const [quickReplies, setQuickReplies] = useState([]);

  const [messageText, setMessageText] = useState('');
  const [inputFocused, setInputFocused] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);

  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const tr = (key, fallback, options = {}) =>
    t(key, {defaultValue: fallback, ...options});

  const fallbackQuickReplies = useMemo(
    () => [
      {
        id: 'provider_fallback_1',
        title: tr('chat.provider_quick_1', 'أنا في الطريق إليك'),
      },
      {
        id: 'provider_fallback_2',
        title: tr('chat.provider_quick_2', 'سأصل خلال 10 دقائق'),
      },
      {
        id: 'provider_fallback_3',
        title: tr('chat.provider_quick_3', 'من فضلك أرسل موقعك بدقة'),
      },
      {
        id: 'provider_fallback_4',
        title: tr('chat.provider_quick_4', 'تم الوصول إلى الموقع'),
      },
      {
        id: 'provider_fallback_5',
        title: tr('chat.provider_quick_5', 'سأبدأ فحص المشكلة الآن'),
      },
      {
        id: 'provider_fallback_6',
        title: tr('chat.provider_quick_6', 'تم الانتهاء من الخدمة'),
      },
      {
        id: 'provider_fallback_7',
        title: tr('chat.provider_quick_7', 'هل يوجد أي تفاصيل إضافية؟'),
      },
    ],
    [t],
  );

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';

    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const getUserImage = user => {
    return (
      user?.image ||
      user?.avatar ||
      user?.photo ||
      user?.profile_image ||
      user?.profile_photo_url ||
      user?.picture ||
      DEFAULT_AVATAR
    );
  };

  const formatIncomingTime = incoming => {
    if (incoming?.time && !String(incoming.time).includes('-')) {
      return incoming.time;
    }

    if (incoming?.created_at) {
      try {
        const date = new Date(incoming.created_at);

        return date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch (e) {
        return tr('chat.now', 'الآن');
      }
    }

    return tr('chat.now', 'الآن');
  };

  const normalizeIncomingMessage = incoming => {
    const messageId =
      incoming?.message_id ||
      incoming?.id ||
      `push-${incoming?.conversation_id || 'chat'}-${Date.now()}-${Math.random()}`;

    const body =
      incoming?.body ||
      incoming?.message ||
      incoming?.notification_body ||
      incoming?.notification?.body ||
      '';

    return {
      id: messageId,
      conversation_id: incoming?.conversation_id,
      order_id: incoming?.order_id,
      sender_id: incoming?.sender_id,
      sender_role: incoming?.sender_role,
      message_type:
        incoming?.chat_message_type || incoming?.message_type || 'text',
      body,
      time: formatIncomingTime(incoming),
      created_at: incoming?.created_at,
      is_mine: String(incoming?.sender_id) === String(currentUserIdRef.current),
    };
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({
        offset: 0,
        animated: true,
      });
    }, 80);
  };

  const appendIncomingMessageFromNotification = incoming => {
    const activeConversation = conversationRef.current;

    const incomingConversationId =
      incoming?.conversation_id || incoming?.conversationId;

    if (!incomingConversationId) {
      return;
    }

    if (!activeConversation?.id) {
      pendingIncomingMessagesRef.current.push(incoming);
      return;
    }

    if (String(incomingConversationId) !== String(activeConversation.id)) {
      return;
    }

    if (String(incoming?.sender_id) === String(currentUserIdRef.current)) {
      return;
    }

    const normalizedMessage = normalizeIncomingMessage({
      ...incoming,
      conversation_id: incomingConversationId,
    });

    if (!normalizedMessage.body) {
      return;
    }

    setMessages(prev => {
      const exists = prev.some(item => {
        return (
          String(item.id) === String(normalizedMessage.id) ||
          String(item.local_id) === String(normalizedMessage.id)
        );
      });

      if (exists) {
        return prev;
      }

      return [normalizedMessage, ...prev];
    });

    scrollToBottom();

    markConversationAsRead({
      conversationId: activeConversation.id,
    }).catch(() => {});
  };

  useEffect(() => {
    if (!conversation?.id) {
      return;
    }

    if (!pendingIncomingMessagesRef.current.length) {
      return;
    }

    const pendingMessages = [...pendingIncomingMessagesRef.current];
    pendingIncomingMessagesRef.current = [];

    pendingMessages.forEach(item => {
      appendIncomingMessageFromNotification(item);
    });
  }, [conversation?.id]);

  useEffect(() => {
    const unsubscribe = listenChatMessageReceived(incoming => {
      appendIncomingMessageFromNotification(incoming);
    });

    return unsubscribe;
  }, []);

  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();

      parent?.setOptions({
        tabBarStyle: {display: 'none'},
      });

      return () => {
        parent?.setOptions({
          tabBarStyle: undefined,
        });
      };
    }, [navigation]),
  );

  const handleBack = useCallback(() => {
    Keyboard.dismiss();

    if (navigation.canGoBack()) {
      navigation.goBack();
      return true;
    }

    navigation.navigate('MessagesScreen');
    return true;
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBack,
      );

      return () => backHandler.remove();
    }, [handleBack]),
  );

  useEffect(() => {
    if (didInitialLoadRef.current) {
      return;
    }

    didInitialLoadRef.current = true;
    loadChat();
  }, [conversationId]);

  const loadQuickReplies = async () => {
    try {
      const response = await getChatQuickReplies();

      const apiReplies = Array.isArray(response?.data) ? response.data : [];

      if (apiReplies.length > 0) {
        setQuickReplies(apiReplies);
      } else {
        setQuickReplies(fallbackQuickReplies);
      }
    } catch (error) {
      console.log(
        'LOAD PROVIDER QUICK REPLIES ERROR:',
        error?.response?.data || error?.message,
      );

      setQuickReplies(fallbackQuickReplies);
    }
  };

  const loadChat = async (isRefresh = false) => {
    if (!conversationId) {
      setLoading(false);
      setErrorMessage(
        tr('chat.missing_conversation', 'رقم المحادثة غير متوفر'),
      );
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage('');

      const conversationData = {
        id: conversationId,
        order_id: orderId,
      };

      setConversation(conversationData);
      conversationRef.current = conversationData;

      if (otherUser?.id || otherUser?.name) {
        setClient({
          id: otherUser?.id,
          name: otherUser?.name || title,
          image: getUserImage(otherUser),
          phone: otherUser?.phone,
        });
      }

      await Promise.all([
        loadMessages({
          conversationId,
          pageNumber: 1,
          replace: true,
        }),
        loadQuickReplies(),
      ]);

      markConversationAsRead({
        conversationId,
      }).catch(() => {});
    } catch (error) {
      console.log(
        'LOAD PROVIDER CHAT ERROR:',
        error?.response?.data || error?.message,
      );

      setErrorMessage(
        error?.response?.data?.message ||
          tr('chat.failed_load_chat', 'تعذر تحميل المحادثة'),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMessages = async ({
    conversationId: id,
    pageNumber = 1,
    replace = false,
  }) => {
    if (!id) {
      return;
    }

    if (pageNumber > 1 && loadingMoreRef.current) {
      return;
    }

    try {
      if (pageNumber === 1) {
        setLoadingMessages(true);
      } else {
        loadingMoreRef.current = true;
        setLoadingMore(true);
      }

      const response = await getConversationMessages({
        conversationId: id,
        page: pageNumber,
        perPage: PER_PAGE,
      });

      if (!response?.status) {
        return;
      }

      const apiMessages = Array.isArray(response?.data) ? response.data : [];

      setMessages(prev => {
        if (replace) {
          return apiMessages;
        }

        const existingIds = new Set(prev.map(item => String(item.id)));
        const newItems = apiMessages.filter(
          item => !existingIds.has(String(item.id)),
        );

        return [...prev, ...newItems];
      });

      const currentPage = response?.pagination?.current_page || pageNumber;
      const hasMore = !!response?.pagination?.has_more;

      setPage(currentPage);
      canLoadMoreRef.current = hasMore;
    } catch (error) {
      console.log(
        'LOAD PROVIDER MESSAGES ERROR:',
        error?.response?.data || error?.message,
      );
    } finally {
      setLoadingMessages(false);
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  };

  const onRefresh = () => {
    loadChat(true);
  };

  const loadMoreMessages = () => {
    if (
      !conversation?.id ||
      loadingMoreRef.current ||
      loadingMessages ||
      !canLoadMoreRef.current
    ) {
      return;
    }

    loadMessages({
      conversationId: conversation.id,
      pageNumber: page + 1,
      replace: false,
    });
  };

  const sendMessage = async textValue => {
    const text = String(textValue || messageText).trim();

    if (!text || !conversation?.id || sending) {
      return;
    }

    const tempId = `temp-${Date.now()}`;

    const tempMessage = {
      id: tempId,
      local_id: tempId,
      conversation_id: conversation.id,
      order_id: orderId,
      sender_id: currentUserId,
      sender_role: 'provider',
      message_type: 'text',
      body: text,
      time: tr('chat.now', 'الآن'),
      is_mine: true,
      status: 'sending',
    };

    setMessages(prev => [tempMessage, ...prev]);
    setMessageText('');
    scrollToBottom();

    try {
      setSending(true);

      const response = await sendConversationMessage({
        conversationId: conversation.id,
        body: text,
        messageType: 'text',
      });

      if (response?.status && response?.data) {
        setMessages(prev =>
          prev.map(item => (item.id === tempId ? response.data : item)),
        );
      } else {
        setMessages(prev =>
          prev.map(item =>
            item.id === tempId ? {...item, status: 'failed'} : item,
          ),
        );
      }
    } catch (error) {
      console.log(
        'SEND PROVIDER MESSAGE ERROR:',
        error?.response?.data || error?.message,
      );

      setMessages(prev =>
        prev.map(item =>
          item.id === tempId ? {...item, status: 'failed'} : item,
        ),
      );
    } finally {
      setSending(false);
    }
  };

  const retryMessage = item => {
    if (!item?.body || item.status !== 'failed') {
      return;
    }

    setMessages(prev => prev.filter(msg => msg.id !== item.id));
    sendMessage(item.body);
  };

  const renderAvatar = () => {
    const image = getUserImage(client);

    if (image) {
      return <Image source={{uri: image}} style={styles.headerAvatar} />;
    }

    return (
      <View style={[styles.headerAvatar, styles.avatarFallback]}>
        <Ionicons name="person-outline" size={20} color={COLORS.main} />
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerWrap}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.backBtn}
          onPress={handleBack}>
          <Ionicons
            name={isRTL ? 'arrow-forward' : 'arrow-back'}
            size={26}
            color={COLORS.text}
          />
        </TouchableOpacity>

        <View style={styles.headerTitleArea}>
          <AppText weight="bold" style={styles.clientName} numberOfLines={1}>
            {client?.name || tr('chat.client', 'العميل')}
          </AppText>
        </View>

        {renderAvatar()}
      </View>
    </View>
  );

  const renderMessage = ({item}) => {
    const mine = item.is_mine;

    return (
      <View
        style={[
          styles.messageRow,
          {
            justifyContent: mine ? 'flex-start' : 'flex-end',
          },
        ]}>
        <TouchableOpacity
          activeOpacity={item.status === 'failed' ? 0.75 : 1}
          onPress={() => retryMessage(item)}
          style={[
            styles.messageBubble,
            mine ? styles.messageBubbleMine : styles.messageBubbleOther,
            item.status === 'failed' && styles.failedBubble,
          ]}>
          <AppText
            style={[
              styles.messageText,
              mine ? styles.messageTextMine : styles.messageTextOther,
            ]}>
            {item.body}
          </AppText>

          <View style={styles.messageMetaRow}>
            <AppText
              style={[
                styles.messageTime,
                mine ? styles.messageTimeMine : styles.messageTimeOther,
              ]}>
              {item.status === 'sending'
                ? tr('chat.sending', 'جاري الإرسال')
                : item.status === 'failed'
                ? tr(
                    'chat.failed_tap_retry',
                    'فشل الإرسال - اضغط لإعادة المحاولة',
                  )
                : item.time}
            </AppText>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyMessages = () => {
    if (loadingMessages || messages.length > 0) {
      return null;
    }

    return (
      <View pointerEvents="none" style={styles.emptyOverlay}>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={36}
          color="#B7B7B7"
        />

        <AppText style={styles.emptyMessagesText}>
          {tr('chat.empty_provider_messages', 'ابدأ المحادثة مع العميل الآن')}
        </AppText>
      </View>
    );
  };

  const renderQuickReplies = () => {
    if (!quickReplies.length || !conversation?.id) {
      return null;
    }

    return (
      <View style={styles.quickRepliesWrap}>
        <FlatList
          horizontal
          inverted={isRTL}
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator={false}
          data={quickReplies}
          keyExtractor={(item, index) => String(item?.id || index)}
          contentContainerStyle={styles.quickListContent}
          renderItem={({item}) => (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.quickReplyChip}
              onPress={() => sendMessage(item?.title)}>
              <AppText style={styles.quickReplyText} numberOfLines={1}>
                {item?.title}
              </AppText>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const renderInput = () => {
    const hasText = messageText.trim().length > 0;
    const inputActive = inputFocused || hasText;

    return (
      <View style={styles.inputWrap}>
        <View
          style={[
            styles.inputContainer,
            inputActive && styles.inputContainerActive,
          ]}>
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={!hasText || sending}
            style={[
              styles.sendBtn,
              !hasText && styles.micBtn,
              sending && hasText && styles.sendingBtn,
            ]}
            onPress={() => sendMessage()}>
            {sending && hasText ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : hasText ? (
              <Ionicons
                name="send"
                size={18}
                color="#FFFFFF"
                style={{
                  transform: [{scaleX: isRTL ? -1 : 1}],
                }}
              />
            ) : (
              <Ionicons name="mic-outline" size={20} color={COLORS.text} />
            )}
          </TouchableOpacity>

          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder={tr('chat.placeholder', 'اكتب رسالتك')}
            placeholderTextColor="#B6B6B6"
            style={[
              styles.textInput,
              {
                textAlign: isRTL ? 'right' : 'left',
                writingDirection: isRTL ? 'rtl' : 'ltr',
              },
            ]}
            multiline
            blurOnSubmit={false}
            textAlignVertical="center"
            returnKeyType="default"
          />
        </View>
      </View>
    );
  };

  const renderListFooter = () => {
    if (!loadingMore) {
      return null;
    }

    return (
      <View style={styles.loadMoreWrap}>
        <ActivityIndicator size="small" color={COLORS.main} />
      </View>
    );
  };

    const bottomPadding =
    Platform.OS === 'ios'
    ? keyboardVisible
      ? IOS_INPUT_EXTRA_SPACE_WHEN_KEYBOARD_OPEN
      : Math.max(insets.bottom, 8)
    : keyboardVisible
    ? 0
    : Math.max(insets.bottom, 8);

  if (loading) {
    return (
      <View style={styles.safeArea}>
        {renderHeader()}

        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={COLORS.main} />

          <AppText style={styles.loaderText}>
            {tr('chat.loading', 'جاري تحميل المحادثة...')}
          </AppText>
        </View>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.safeArea}>
        {renderHeader()}

        <View style={styles.errorWrap}>
          <Ionicons name="alert-circle-outline" size={42} color={COLORS.danger} />

          <AppText weight="bold" style={styles.errorTitle}>
            {tr('chat.error_title', 'تعذر فتح المحادثة')}
          </AppText>

          <AppText style={styles.errorText}>{errorMessage}</AppText>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.retryBtn}
            onPress={() => loadChat()}>
            <AppText weight="bold" style={styles.retryText}>
              {tr('chat.retry', 'إعادة المحاولة')}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
        <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}>
        {renderHeader()}

        <View style={styles.messagesContainer}>
          <FlatList
            ref={flatListRef}
            inverted
            data={messages}
            keyExtractor={item => String(item.id || item.local_id)}
            renderItem={renderMessage}
            ListFooterComponent={renderListFooter}
            onEndReached={loadMoreMessages}
            onEndReachedThreshold={0.35}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.messagesContent}
          />

          {renderEmptyMessages()}
        </View>

        <View style={[styles.bottomArea, {paddingBottom: bottomPadding}]}>
          {renderQuickReplies()}
          {renderInput()}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ProviderConversationScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardView: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  loaderWrap: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.muted,
  },

  errorWrap: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  errorTitle: {
    marginTop: 12,
    fontSize: 17,
    color: COLORS.text,
    textAlign: 'center',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryBtn: {
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.main,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: 18,
  },
  retryText: {
    fontSize: 14,
    color: COLORS.white,
  },

  headerWrap: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 32,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleArea: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  clientName: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'right',
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAF3FF',
    marginHorizontal: 6,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  messagesContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  messagesContent: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,
  },
  emptyOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyMessagesText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },
  loadMoreWrap: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  messageRow: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 10,
  },
  messageBubble: {
    maxWidth: '78%',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingTop: 7,
    paddingBottom: 6,
  },
  messageBubbleMine: {
    backgroundColor: COLORS.bubbleMine,
    borderBottomLeftRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: COLORS.bubbleOther,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  failedBubble: {
    backgroundColor: COLORS.danger,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'auto',
  },
  messageTextMine: {
    color: COLORS.white,
  },
  messageTextOther: {
    color: COLORS.text,
  },
  messageMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
  },
  messageTimeMine: {
    color: 'rgba(255,255,255,0.82)',
  },
  messageTimeOther: {
    color: COLORS.muted,
  },

 bottomArea: {
  backgroundColor: COLORS.white,
  borderTopWidth: 1,
  borderTopColor: COLORS.border,
},
  quickRepliesWrap: {
    backgroundColor: COLORS.white,
    paddingTop: 8,
    paddingBottom: 6,
  },
  quickListContent: {
    paddingHorizontal: 8,
  },
  quickReplyChip: {
    minHeight: 32,
    maxWidth: 210,
    borderRadius: 16,
    backgroundColor: COLORS.quickBg,
    borderWidth: 1,
    borderColor: COLORS.quickBorder,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 13,
    marginHorizontal: 4,
  },
  quickReplyText: {
    fontSize: 13,
    color: COLORS.text,
  },

  inputWrap: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingTop: 7,
    paddingBottom: 7,
  },
  inputContainer: {
    minHeight: 44,
    maxHeight: 92,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#DADADA',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  inputContainerActive: {
    borderColor: COLORS.mainDark,
  },
  textInput: {
    flex: 1,
    minHeight: 32,
    paddingHorizontal: 8,
    paddingTop: Platform.OS === 'ios' ? 10 : 6,
    paddingBottom: Platform.OS === 'ios' ? 10 : 6,
    fontSize: 14,
    color: COLORS.text,
  },
  sendBtn: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: COLORS.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendingBtn: {
    opacity: 0.75,
  },
  micBtn: {
    backgroundColor: COLORS.white,
  },
});