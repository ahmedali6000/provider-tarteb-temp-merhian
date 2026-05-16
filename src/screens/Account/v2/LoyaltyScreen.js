import React, {useMemo} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';

import AppHeader from '../../../shared/AppHeader';
import AppText from '../../../shared/AppText';
import AppButton from '../../../component/AppButton';

const LoyaltyScreen = ({navigation}) => {
  const {t} = useTranslation();
  const user = useSelector(state => state.auth.user);

  const currentPoints = Number(user?.points || 0);
  const maxPoints = Number(user?.maxPoints || 2000);

  const progressPercent =
    maxPoints > 0 ? Math.min((currentPoints / maxPoints) * 100, 100) : 0;

  const remainingPoints = Math.max(maxPoints - currentPoints, 0);

  const badgeImage = useMemo(() => {
    const percent = maxPoints > 0 ? (currentPoints / maxPoints) * 100 : 0;

    if (percent > 75) {
      return require('../../../../assets/app/images/account/golden.png');
    } else if (percent >= 40) {
      return require('../../../../assets/app/images/account/sliver.png');
    } else {
      return require('../../../../assets/app/images/account/prime.png');
    }
  }, [currentPoints, maxPoints]);

  const userLevelKey = useMemo(() => {
    const percent = maxPoints > 0 ? (currentPoints / maxPoints) * 100 : 0;

    if (percent > 75) {
      return 'profile.level_golden';
    } else if (percent >= 40) {
      return 'profile.level_silver';
    } else {
      return 'profile.level_prime';
    }
  }, [currentPoints, maxPoints]);

  const levels = [
    {
      id: 'prime',
      image: require('../../../../assets/app/images/account/prime.png'),
      title: t('profile.level_prime'),
      desc: t('loyalty.level_prime_desc'),
    },
    {
      id: 'silver',
      image: require('../../../../assets/app/images/account/sliver.png'),
      title: t('profile.level_silver'),
      desc: t('loyalty.level_silver_desc'),
    },
    {
      id: 'golden',
      image: require('../../../../assets/app/images/account/golden.png'),
      title: t('profile.level_golden'),
      desc: t('loyalty.level_golden_desc'),
    },
  ];

  const pointRules = [
    {id: 1, title: t('loyalty.first_order'), points: 100},
    {id: 2, title: t('loyalty.complete_order'), points: 10},
    {id: 3, title: t('loyalty.rate_service'), points: 20},
    {id: 4, title: t('loyalty.two_success_orders_month'), points: 50},
    {id: 5, title: t('loyalty.five_success_orders'), points: 200},
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader
          titleKey="loyalty.title"
          onBack={() => navigation.goBack()}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.topSection}>
            <Image source={badgeImage} style={styles.mainBadge} resizeMode="contain" />
            <AppText weight="bold" style={styles.currentLevelText}>
              {t(userLevelKey)}
            </AppText>
          </View>

          <View style={styles.pointsCard}>
            <View style={styles.pointsTopRow}>
              <View style={styles.pointsRightBlock}>
                <AppText weight="bold" style={styles.pointsTitle}>
                  {t('loyalty.points_title')}
                </AppText>

                <View style={styles.pointsNumbersRow}>
                  <AppText weight="bold" style={styles.pointsBigNumber}>
                    {currentPoints} 
                  </AppText>
                  <AppText style={styles.pointsSmallNumber}>
                     {maxPoints} /
                  </AppText>

                  
                </View>
              </View>

              <View style={styles.pointsMiddleBlock}>
                <AppText style={styles.pointsDesc}>
                  {t('loyalty.remaining_points', {count: remainingPoints})}
                </AppText>

                <AppText style={styles.pointsDesc}>
                  {t('loyalty.to_next_level')}
                </AppText>


                  <View style={styles.progressTrack}>
                    <View
                        style={[
                          styles.progressFill,
                          {width: `${Math.max(progressPercent, 8)}%`},
                        ]}
                      />
                  </View>
              </View>
            </View>

          
          </View>

          <AppText style={styles.redeemInfoText}>
            {t('loyalty.redeem_info')}
          </AppText>

          <AppButton
            title={t('loyalty.redeem_button')}
            onPress={() => {}}
            style={[styles.redeemButton, (progressPercent < '100') && {backgroundColor: '#BFD6E5'}]}
            textStyle={styles.redeemButtonText}
          />

          <AppText weight="bold" style={styles.sectionTitle}>
            {t('loyalty.account_levels')}
          </AppText>

          <View style={styles.levelsList}>
            {levels.map(item => (
              <View key={item.id} style={styles.levelCard}>
                 <Image source={item.image} style={styles.levelCardBadge} resizeMode="contain" />
                <View style={styles.levelTextWrap}>
                  <AppText weight="bold" style={styles.levelCardTitle}>
                    {item.title}
                  </AppText>
                  <AppText style={styles.levelCardDesc}>
                    {item.desc}
                  </AppText>
                </View>

               
              </View>
            ))}
          </View>

          <AppText weight="bold" style={styles.sectionTitle}>
            {t('loyalty.how_get_points')}
          </AppText>

          <View style={styles.rulesCard}>
            {pointRules.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.ruleRow,
                  index !== pointRules.length - 1 && styles.ruleBorder,
                ]}>
                <AppText style={styles.ruleTitle}>{item.title}</AppText>

                <AppText weight="bold" style={styles.rulePoints}>
                  {item.points} {t('loyalty.point_unit')}
                </AppText>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default LoyaltyScreen;

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
  scrollContent: {
    paddingBottom: 32,
  },

  topSection: {
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 14,
  },
  mainBadge: {
    width: 74,
    height: 74,
  },
  currentLevelText: {
    marginTop: 8,
    fontSize: 20,
    color: '#1E1E1E',
  },

  pointsCard: {
    backgroundColor: '#ECECEC',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
  },
  pointsTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pointsRightBlock: {
     
    alignItems: 'flex-start',
  },
  pointsTitle: {
    fontSize: 16,
    color: '#1F1F1F',
    marginBottom: 4,
  },
  pointsNumbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsBigNumber: {
    fontSize: 32,
    color: '#1F1F1F',
    
  },
  pointsSmallNumber: {
    fontSize: 16,
    color: '#888888',
    marginStart: 2,
    marginBottom: 1,
  },
  pointsMiddleBlock: {
    flex: 1,
   
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingTop: 2,
  },
  pointsDesc: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 20,
  },
  progressTrack: {
    marginTop: 12,
    width: '100%',
    height: 14,
    backgroundColor: '#DFDFDF',
    borderRadius: 10,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  progressFill: {
    height: 14,
    backgroundColor: '#F39A20',
    borderRadius: 10,
  },

  redeemInfoText: {
    marginTop: 14,
    fontSize: 13,
    color: '#6A6A6A',
    lineHeight: 21,
    textAlign: 'auto',
  },
  redeemButton: {
    marginTop: 12,
    // backgroundColor: '#BFD6E5',
    borderRadius: 14,
  },
  redeemButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
  },

  sectionTitle: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: 16,
    color: '#1F1F1F',
    textAlign: 'auto',
  },

  levelsList: {
    gap: 10,
  },
  levelCard: {
    minHeight: 76,
    borderRadius: 16,
    backgroundColor: '#EFEFEF',
    borderWidth: 1,
    borderColor: '#E2E2E2',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelTextWrap: {
    flex: 1,
    marginHorizontal: 10,
  },
  levelCardTitle: {
    fontSize: 16,
    color: '#1F1F1F',
    textAlign: 'auto',
    marginBottom: 4,
  },
  levelCardDesc: {
    fontSize: 13,
    color: '#7A7A7A',
    textAlign: 'auto',
    lineHeight: 19,
  },
  levelCardBadge: {
    width: 34,
    height: 34,
  },

  rulesCard: {
    marginTop: 2,
    backgroundColor: '#EFEFEF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    overflow: 'hidden',
  },
  ruleRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  ruleBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  ruleTitle: {
    fontSize: 14,
    color: '#6E6E6E',
    textAlign: 'auto',
  },
  rulePoints: {
    fontSize: 15,
    color: '#1F1F1F',
  },
});