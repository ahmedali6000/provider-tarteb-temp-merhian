import React, {useCallback, useEffect, useRef, useState} from 'react';
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
  Modal,
  Pressable,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useFocusEffect} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import AppText from '../../../../shared/AppText';
import {
  getOrderConversation,
  getConversationMessages,
  sendConversationMessage,
  markConversationAsRead,
  getChatQuickReplies,
  getComplaintReasons,
  sendOrderComplaint,
} from '../../../../services/chatService';
import {listenChatMessageReceived} from '../../../../events/chatRealtimeEvents';

const COLORS = {
  main: '#3296D9',
  mainDark: '#2388C8',
  bg: '#F7F8FA',
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

const DUMMY_PROVIDER = {
  id: null,
  name: '',
  job: '',
  image: null,
  status: 'online',
};

const PER_PAGE = 20;

/*
 * مهم:
 * ده مش ارتفاع الكيبورد.
 * ده بس مساحة بسيطة ترفع input فوق شريط الاقتراحات في iOS.
 * لو لسه قريب من الكيبورد زوّدها لـ 52.
 * لو عالي قللها لـ 34.
 */
const IOS_INPUT_EXTRA_SPACE_WHEN_KEYBOARD_OPEN = 44;

const OrderChatScreen = ({navigation, route}) => {
  const {t, i18n} = useTranslation();
  const insets = useSafeAreaInsets();

  const isRTL = i18n.language === 'ar';
  const currentUserId = useSelector(state => state.auth.user?.id);

  const flatListRef = useRef(null);
  const loadingMoreRef = useRef(false);
  const loadingChatRef = useRef(false);
  const didInitialLoadRef = useRef(false);
  const canLoadMoreRef = useRef(false);

  const conversationRef = useRef(null);
  const currentUserIdRef = useRef(null);
  const pendingIncomingMessagesRef = useRef([]);

  const orderId = route?.params?.order_id;
  const providerId = route?.params?.provider_id || route?.params?.provider?.id;
  const providerFromRoute = route?.params?.provider || DUMMY_PROVIDER;

  const [conversation, setConversation] = useState(null);
  const [provider, setProvider] = useState(providerFromRoute);

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

  const [complaintVisible, setComplaintVisible] = useState(false);
  const [complaintReasons, setComplaintReasons] = useState([]);
  const [selectedComplaintReason, setSelectedComplaintReason] = useState(null);
  const [complaintNote, setComplaintNote] = useState('');
  const [loadingComplaintReasons, setLoadingComplaintReasons] = useState(false);
  const [sendingComplaint, setSendingComplaint] = useState(false);
  const [complaintError, setComplaintError] = useState('');
  const [complaintSuccess, setComplaintSuccess] = useState('');

  const tr = (key, fallback, options = {}) =>
    t(key, {defaultValue: fallback, ...options});

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

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
      null
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
        incoming?.chat_message_type ||
        incoming?.message_type ||
        'text',
      body,
      time: formatIncomingTime(incoming),
      created_at: incoming?.created_at,
      is_mine:
        String(incoming?.sender_id) === String(currentUserIdRef.current),
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
    console.log('CHAT PUSH RECEIVED IN SCREEN RAW:', incoming);

    const activeConversation = conversationRef.current;

    const incomingConversationId =
      incoming?.conversation_id ||
      incoming?.conversationId;

    if (!incomingConversationId) {
      console.log('CHAT PUSH IGNORED: no conversation_id');
      return;
    }

    if (!activeConversation?.id) {
      pendingIncomingMessagesRef.current.push(incoming);
      console.log('CHAT PUSH QUEUED: conversation not ready yet');
      return;
    }

    if (String(incomingConversationId) !== String(activeConversation.id)) {
      console.log('CHAT PUSH IGNORED: different conversation', {
        incomingConversationId,
        activeConversationId: activeConversation.id,
      });
      return;
    }

    if (String(incoming?.sender_id) === String(currentUserIdRef.current)) {
      console.log('CHAT PUSH IGNORED: message from current user');
      return;
    }

    const normalizedMessage = normalizeIncomingMessage({
      ...incoming,
      conversation_id: incomingConversationId,
    });

    if (!normalizedMessage.body) {
      console.log('CHAT PUSH IGNORED: empty body after normalize');
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
        console.log('CHAT PUSH IGNORED: already exists by id');
        return prev;
      }

      console.log('CHAT PUSH APPENDED:', normalizedMessage);
      return [normalizedMessage, ...prev];
    });

    scrollToBottom();

    markConversationAsRead({
      conversationId: activeConversation.id,
    }).catch(() => {});
  };

  useEffect(() => {
    conversationRef.current = conversation;

    if (!conversation?.id) {
      return;
    }

    if (!pendingIncomingMessagesRef.current.length) {
      return;
    }

    const pendingMessages = [...pendingIncomingMessagesRef.current];
    pendingIncomingMessagesRef.current = [];

    console.log('CHAT PUSH FLUSH PENDING:', pendingMessages.length);

    pendingMessages.forEach(item => {
      appendIncomingMessageFromNotification(item);
    });
  }, [conversation?.id]);

  useEffect(() => {
    const unsubscribe = listenChatMessageReceived(incoming => {
      console.log('CHAT MESSAGE EVENT IN SCREEN:', incoming);
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

    if (orderId) {
      navigation.navigate('OrderFullDetailsScreen', {
        order_id: orderId,
      });
      return true;
    }

    navigation.navigate('OrdersScreen');
    return true;
  }, [navigation, orderId]);

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
  }, [orderId, providerId]);

  const getParticipantByRole = (participants = [], role) => {
    return participants.find(item => item?.role === role);
  };

  const prepareProviderFromConversation = conversationData => {
    const participants = conversationData?.participants || [];
    const providerParticipant = getParticipantByRole(participants, 'provider');

    if (!providerParticipant?.user) {
      return providerFromRoute || DUMMY_PROVIDER;
    }

    const user = providerParticipant.user;

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      image: getUserImage(user) || getUserImage(providerFromRoute),
      job:
        providerFromRoute?.job ||
        providerFromRoute?.category_name ||
        tr('chat.provider_job_fallback', 'فني صيانة'),
      status: 'online',
    };
  };

  const loadChat = async (isRefresh = false) => {
    if (!orderId) {
      setLoading(false);
      setErrorMessage(tr('chat.missing_order', 'رقم الطلب غير متوفر'));
      return;
    }

    if (loadingChatRef.current && !isRefresh) {
      return;
    }

    loadingChatRef.current = true;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage('');

      const [conversationResponse, quickRepliesResponse] = await Promise.all([
        getOrderConversation({
          orderId,
          providerId,
        }),
        getChatQuickReplies(),
      ]);

      if (!conversationResponse?.status) {
        setErrorMessage(
          conversationResponse?.message ||
            tr('chat.failed_load_conversation', 'تعذر فتح المحادثة'),
        );
        return;
      }

      const conversationData = conversationResponse?.data?.conversation;

      if (!conversationData?.id) {
        setErrorMessage(tr('chat.no_conversation', 'المحادثة غير متوفرة'));
        return;
      }

      setConversation(conversationData);
      conversationRef.current = conversationData;

      setProvider(prepareProviderFromConversation(conversationData));

      const quickData = quickRepliesResponse?.data || [];
      setQuickReplies(Array.isArray(quickData) ? quickData : []);

      await loadMessages({
        conversationId: conversationData.id,
        pageNumber: 1,
        replace: true,
      });

      if (pendingIncomingMessagesRef.current.length) {
        const pendingMessages = [...pendingIncomingMessagesRef.current];
        pendingIncomingMessagesRef.current = [];

        pendingMessages.forEach(item => {
          appendIncomingMessageFromNotification(item);
        });
      }

      markConversationAsRead({
        conversationId: conversationData.id,
      }).catch(() => {});
    } catch (error) {
      console.log('LOAD CHAT ERROR:', error?.response?.data || error?.message);

      setErrorMessage(
        error?.response?.data?.message ||
          tr('chat.failed_load_chat', 'تعذر تحميل المحادثة'),
      );
    } finally {
      loadingChatRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMessages = async ({
    conversationId,
    pageNumber = 1,
    replace = false,
  }) => {
    if (!conversationId) {
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
        conversationId,
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
        'LOAD MESSAGES ERROR:',
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
      sender_role: 'client',
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
      console.log('SEND MESSAGE ERROR:', error?.response?.data || error?.message);

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

  const getIsOtherReason = reason => {
    const title = String(reason?.title || '').toLowerCase();

    return (
      reason?.requires_note ||
      title.includes('آخر') ||
      title.includes('اخر') ||
      title.includes('other')
    );
  };

  const getAgainstUserId = () => {
    return provider?.id || providerId || null;
  };

  const openComplaintSheet = async () => {
    Keyboard.dismiss();

    setComplaintVisible(true);
    setComplaintError('');
    setComplaintSuccess('');
    setComplaintNote('');

    if (complaintReasons.length > 0) {
      setSelectedComplaintReason(prev => prev || complaintReasons[0]);
      return;
    }

    try {
      setLoadingComplaintReasons(true);

      const response = await getComplaintReasons({
        targetType: 'provider',
      });

      if (response?.status) {
        const reasons = Array.isArray(response?.data) ? response.data : [];

        setComplaintReasons(reasons);

        if (reasons.length > 0) {
          setSelectedComplaintReason(reasons[0]);
        }
      } else {
        setComplaintError(
          response?.message ||
            tr('chat.complaint_failed_load', 'تعذر تحميل أسباب الشكوى'),
        );
      }
    } catch (error) {
      console.log(
        'LOAD COMPLAINT REASONS ERROR:',
        error?.response?.data || error?.message,
      );

      setComplaintError(
        error?.response?.data?.message ||
          tr('chat.complaint_failed_load', 'تعذر تحميل أسباب الشكوى'),
      );
    } finally {
      setLoadingComplaintReasons(false);
    }
  };

  const closeComplaintSheet = () => {
    if (sendingComplaint) {
      return;
    }

    setComplaintVisible(false);
    setComplaintError('');
    setComplaintSuccess('');
    setComplaintNote('');
  };

  const submitComplaint = async () => {
    if (!selectedComplaintReason || sendingComplaint) {
      return;
    }

    const shouldWriteNote = getIsOtherReason(selectedComplaintReason);

    if (shouldWriteNote && !complaintNote.trim()) {
      setComplaintError(
        tr('chat.complaint_note_required', 'برجاء كتابة سبب الشكوى'),
      );
      return;
    }

    if (!orderId) {
      setComplaintError(tr('chat.missing_order', 'رقم الطلب غير متوفر'));
      return;
    }

    try {
      setSendingComplaint(true);
      setComplaintError('');

      const response = await sendOrderComplaint({
        orderId,
        conversationId: conversation?.id,
        complaintReasonId: selectedComplaintReason?.id,
        againstUserId: getAgainstUserId(),
        note: complaintNote.trim(),
      });

      if (!response?.status) {
        setComplaintError(
          response?.message ||
            tr('chat.complaint_send_failed', 'تعذر إرسال الشكوى'),
        );
        return;
      }

      setComplaintVisible(false);
      setComplaintNote('');
      setComplaintError('');
    } catch (error) {
      console.log(
        'SEND COMPLAINT ERROR:',
        error?.response?.data || error?.message,
      );

      setComplaintError(
        error?.response?.data?.message ||
          tr('chat.complaint_send_failed', 'تعذر إرسال الشكوى'),
      );
    } finally {
      setSendingComplaint(false);
    }
  };

  const renderAvatar = () => {
    const image = getUserImage(provider);

    if (image) {
      return <Image source={{uri: image}} style={styles.headerAvatar} />;
    }

    return (
      <View style={[styles.headerAvatar, styles.avatarFallback]}>
        <Ionicons name="person-outline" size={22} color={COLORS.main} />
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
            size={28}
            color={COLORS.text}
          />
        </TouchableOpacity>

        {renderAvatar()}

        <View style={styles.headerCenter}>
          <AppText weight="bold" style={styles.providerName} numberOfLines={1}>
            {provider?.name || tr('chat.provider', 'الفني')}
          </AppText>

          {orderId ? (
            <View style={styles.statusRow}>
              <AppText style={styles.orderHint}>
                {tr('chat.order_number', 'محادثة طلب #{{id}}', {id: orderId})}
              </AppText>

              <View style={styles.onlineDot} />
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.complainBtn}
          onPress={openComplaintSheet}>
          <AppText weight="bold" style={styles.complainText}>
            {tr('chat.complain', 'شكوى')}
          </AppText>
        </TouchableOpacity>
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
              {textAlign: 'auto'},
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
                ? tr('chat.failed_tap_retry', 'فشل الإرسال - اضغط لإعادة المحاولة')
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
          size={38}
          color="#B7B7B7"
        />

        <AppText
          style={[
            styles.emptyMessagesText,
            {
              writingDirection: isRTL ? 'rtl' : 'ltr',
            },
          ]}>
          {tr('chat.empty_messages', 'ابدأ المحادثة مع الفني الآن')}
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
              <AppText style={styles.quickReplyText}>{item?.title}</AppText>
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
         {/* <TouchableOpacity activeOpacity={0.8} style={styles.attachBtn}>
            <Ionicons name="add" size={25} color={COLORS.main} />
          </TouchableOpacity> */}
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
            ) : (
              <Ionicons
                name={hasText && 'send'}
                size={20}
                color={hasText ? '#FFFFFF' : COLORS.main}
                style={{
                  transform: [{scaleX: isRTL && hasText ? -1 : 1}],
                }}
              />
            )}
          </TouchableOpacity>

          
        </View>
      </View>
    );
  };

  const renderComplaintSheet = () => {
    const shouldShowNote = getIsOtherReason(selectedComplaintReason);

    return (
      <Modal
        visible={complaintVisible}
        transparent
        animationType="slide"
        onRequestClose={closeComplaintSheet}>
        <View style={styles.sheetRoot}>
          <Pressable style={styles.sheetBackdrop} onPress={closeComplaintSheet} />

          <View style={styles.complaintSheet}>
            <View style={styles.sheetHandle} />

            <AppText weight="bold" style={styles.complaintTitle}>
              {tr('chat.complaint_title', 'تقديم شكوى')}
            </AppText>

            {loadingComplaintReasons ? (
              <View style={styles.complaintLoader}>
                <ActivityIndicator size="small" color={COLORS.main} />

                <AppText style={styles.complaintLoaderText}>
                  {tr('chat.loading_complaint_reasons', 'جاري تحميل الأسباب...')}
                </AppText>
              </View>
            ) : (
              <>
                {complaintReasons.map(reason => {
                  const active =
                    Number(selectedComplaintReason?.id) === Number(reason.id);

                  return (
                    <TouchableOpacity
                      key={String(reason.id)}
                      activeOpacity={0.85}
                      style={[
                        styles.reasonItem,
                        active && styles.reasonItemActive,
                      ]}
                      onPress={() => {
                        setSelectedComplaintReason(reason);
                        setComplaintError('');
                        setComplaintSuccess('');

                        if (!getIsOtherReason(reason)) {
                          setComplaintNote('');
                        }
                      }}>
                      <View
                        style={[
                          styles.radioOuter,
                          active && styles.radioOuterActive,
                        ]}>
                        {active ? <View style={styles.radioInner} /> : null}
                      </View>

                      <AppText
                        weight={active ? 'bold' : 'regular'}
                        style={[
                          styles.reasonText,
                          active && styles.reasonTextActive,
                        ]}>
                        {reason.title}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}

                {shouldShowNote ? (
                  <TextInput
                    value={complaintNote}
                    onChangeText={text => {
                      setComplaintNote(text);
                      setComplaintError('');
                      setComplaintSuccess('');
                    }}
                    placeholder={tr(
                      'chat.complaint_note_placeholder',
                      'أخبرنا ما سبب الشكوى',
                    )}
                    placeholderTextColor="#9C9C9C"
                    multiline
                    textAlignVertical="top"
                    style={[
                      styles.complaintNoteInput,
                      {
                        textAlign: isRTL ? 'right' : 'left',
                        writingDirection: isRTL ? 'rtl' : 'ltr',
                      },
                    ]}
                  />
                ) : null}

                {complaintError ? (
                  <AppText style={styles.complaintError}>
                    {complaintError}
                  </AppText>
                ) : null}

                {complaintSuccess ? (
                  <AppText style={styles.complaintSuccess}>
                    {complaintSuccess}
                  </AppText>
                ) : null}
              </>
            )}

            <View style={styles.complaintActions}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.submitComplaintBtn,
                  (!selectedComplaintReason ||
                    loadingComplaintReasons ||
                    sendingComplaint) &&
                    styles.disabledComplaintBtn,
                ]}
                disabled={
                  sendingComplaint ||
                  loadingComplaintReasons ||
                  !selectedComplaintReason
                }
                onPress={submitComplaint}>
                {sendingComplaint ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <AppText weight="bold" style={styles.submitComplaintText}>
                    {tr('chat.send_complaint', 'إرسال الشكوى')}
                  </AppText>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.cancelComplaintBtn}
                disabled={sendingComplaint}
                onPress={closeComplaintSheet}>
                <AppText weight="bold" style={styles.cancelComplaintText}>
                  {tr('chat.cancel', 'إلغاء')}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

        {renderComplaintSheet()}
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

        {renderComplaintSheet()}
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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

      {renderComplaintSheet()}
    </View>
  );
};

export default OrderChatScreen;

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
    borderBottomWidth: 0,
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
  headerAvatar: {
    width: 45,
    height: 45,
    borderRadius: 17,
    backgroundColor: '#EAF3FF',
    marginHorizontal: 6,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  providerName: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginHorizontal: 5,
  },
  complainBtn: {
    minWidth: 44,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    backgroundColor: 'transparent',
  },
  complainText: {
    fontSize: 12,
    color: COLORS.danger,
  },
  orderHint: {
    marginTop: 5,
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'auto',
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
    paddingHorizontal: 10,
    paddingTop: 5,
    paddingBottom: 7,
  },
  inputContainer: {
    minHeight: 42,
    maxHeight: 92,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1.4,
    borderColor: '#3296D9',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  inputContainerActive: {
    borderColor: COLORS.mainDark,
  },
  attachBtn: {
    width: 31,
    height: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    minHeight: 32,
    // maxHeight: 90,
    paddingHorizontal: 8,
    paddingTop: Platform.OS === 'ios' ? 12 : 6,
    paddingBottom: Platform.OS === 'ios' ? 12 : 6,
    fontSize: 18,
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

  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.76)',
  },
  complaintSheet: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 18,
  },
  sheetHandle: {
    width: 46,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#C9C9C9',
    alignSelf: 'center',
    marginBottom: 18,
  },
  complaintTitle: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  complaintLoader: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  complaintLoaderText: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
  },
  reasonItem: {
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: COLORS.white,
    marginBottom: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reasonItemActive: {
    borderColor: COLORS.main,
    backgroundColor: '#EAF7FF',
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: '#B9B9B9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioOuterActive: {
    borderColor: COLORS.main,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.main,
  },
  reasonText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    textAlign: 'right',
  },
  reasonTextActive: {
    color: COLORS.text,
  },
  complaintNoteInput: {
    minHeight: 74,
    maxHeight: 115,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 12,
    color: COLORS.text,
    marginTop: 2,
    marginBottom: 10,
  },
  complaintError: {
    color: COLORS.danger,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 8,
  },
  complaintSuccess: {
    color: '#16A34A',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 8,
  },
  complaintActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  submitComplaintBtn: {
    flex: 1,
    height: 43,
    borderRadius: 10,
    backgroundColor: COLORS.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  disabledComplaintBtn: {
    opacity: 0.65,
  },
  submitComplaintText: {
    fontSize: 13,
    color: COLORS.white,
  },
  cancelComplaintBtn: {
    flex: 1,
    height: 43,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.main,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  cancelComplaintText: {
    fontSize: 13,
    color: COLORS.main,
  },
});