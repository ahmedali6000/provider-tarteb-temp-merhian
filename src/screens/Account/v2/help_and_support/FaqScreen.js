import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useTranslation} from 'react-i18next';

import AppHeader from '../../../../shared/AppHeader';
import AppText from '../../../../shared/AppText';
import api from '../../../../services/api';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FaqScreen = ({navigation}) => {
  const {t} = useTranslation();

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  const fetchFaqs = async () => {
    try {
      setLoading(true);

      const response = await api.get('/faqs');
      const data = Array.isArray(response?.data) ? response.data : [];

      const sorted = [...data].sort((a, b) => {
        if ((b?.show_first || 0) !== (a?.show_first || 0)) {
          return (b?.show_first || 0) - (a?.show_first || 0);
        }
        return (a?.id || 0) - (b?.id || 0);
      });

      setFaqs(sorted);

      const firstOpenItem = sorted.find(item => Number(item?.show_first) === 1);
      if (firstOpenItem) {
        setOpenId(firstOpenItem.id);
      }
    } catch (error) {
      console.log('FAQ ERROR:', error?.response?.data || error?.message);
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const toggleItem = id => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId(prev => (prev === id ? null : id));
  };

  const isEmpty = useMemo(() => faqs.length === 0, [faqs]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader
          titleKey="help_main.faq"
          onBack={() => navigation.goBack()}
        />

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#3B97D3" />
          </View>
        ) : isEmpty ? (
          <View style={styles.emptyWrap}>
            <AppText style={styles.emptyText}>
              {t('faq.no_data')}
            </AppText>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {faqs.map(item => {
              const isOpen = openId === item.id;

              return (
                <View
                  key={item.id}
                  style={[styles.card, isOpen && styles.cardOpen]}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.cardHeader}
                    onPress={() => toggleItem(item.id)}>
                   

                    <AppText weight="medium" style={styles.questionText}>
                      {item.question}
                    </AppText>

                     <Ionicons
                      name={isOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
                      size={18}
                      color="#1F1F1F"
                    />
                  </TouchableOpacity>

                  {isOpen ? (
                    <View style={styles.answerWrap}>
                      <AppText style={styles.answerText}>
                        {item.answer}
                      </AppText>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default FaqScreen;

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

  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#8A8A8A',
  },

  scrollContent: {
    paddingTop: 18,
    paddingBottom: 24,
  },

  card: {
    backgroundColor: '#E4E6E7',
    borderWidth: 1,
    borderColor: '#E4E6E7',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardOpen: {
    backgroundColor: '#E4E6E7',
  },

  cardHeader: {
    minHeight: 52,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  questionText: {
    flex: 1,
    fontSize: 15,
    color: '#1F1F1F',
    textAlign: 'auto',
    marginLeft: 12,
  },

  answerWrap: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    marginTop: -2,
  },
  answerText: {
    fontSize: 15,
    color: '#7B7B7B',
    lineHeight: 24,
    textAlign: 'auto',
  },
});