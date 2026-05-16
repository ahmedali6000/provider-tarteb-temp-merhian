import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  I18nManager,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useTranslation} from 'react-i18next';

import AppText from '../../../shared/AppText';
import {getDocData} from '../../../services/docService';

const AboutDocScreen = ({navigation, route}) => {
  const {t, i18n} = useTranslation();

  const isArabic = i18n.language === 'ar';

  const title = route?.params?.title || t('about_main.title');
  const doc = route?.params?.doc || 'about';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [docData, setDocData] = useState(null);

  const fetchDoc = useCallback(
    async ({isRefresh = false} = {}) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await getDocData(doc);

        setDocData(response?.data || response || null);
      } catch (error) {
        console.log('DOC ERROR:', error?.response?.data || error?.message);
        setDocData(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [doc],
  );

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  const onRefresh = () => {
    fetchDoc({isRefresh: true});
  };

  const content = docData?.des || '';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#A8E6FF" />

      <LinearGradient
        colors={['#A8E6FF', '#FFFFFF']}
        locations={[0, 0.42]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.page}>
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Ionicons
                name={isArabic ? 'chevron-forward' : 'chevron-back'}
                size={24}
                color="#071B45"
              />
            </TouchableOpacity>

            <View style={styles.headerTextBox}>
              <AppText weight="bold" style={styles.title}>
                {title}
              </AppText>

              <AppText style={styles.subtitle}>
                {t('about_doc.subtitle') || 'Information and details'}
              </AppText>
            </View>

            <View style={styles.headerPlaceholder} />
          </View>

          <View style={styles.card}>
            {loading ? (
              <View style={styles.loaderWrap}>
                <ActivityIndicator size="large" color="#3498DB" />

                <AppText style={styles.loadingText}>
                  {t('common.loading') || 'جاري التحميل...'}
                </AppText>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#3498DB']}
                    tintColor="#3498DB"
                  />
                }>
                <AppText
                  style={[
                    styles.contentText,
                    {
                      textAlign: 'auto',
                     
                    },
                  ]}>
                  {content || t('about_doc.no_content')}
                </AppText>
              </ScrollView>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default AboutDocScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  page: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 18,
  },
  header: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#071B45',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  headerTextBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  headerPlaceholder: {
    width: 42,
    height: 42,
  },
  title: {
    fontSize: 23,
    color: '#071B45',
    textAlign: 'center',
    marginBottom: 7,
  },
  subtitle: {
    fontSize: 13,
    color: '#607089',
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    shadowColor: '#071B45',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    color: '#607089',
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 26,
  },
  contentText: {
    fontSize: 16,
    color: '#4F5D73',
    lineHeight: 31,
  },
});