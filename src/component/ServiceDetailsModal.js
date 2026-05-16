import React, {useEffect, useMemo, useState} from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {SvgUri} from 'react-native-svg';
import AppText from '../shared/AppText';
import { isSvg } from '../utils/HelperFunctions';
 
const FALLBACK_IMAGE = require('./../../assets/app/images/vectors/about-main.png');

const ServiceDetailsModal = ({
  visible,
  service,
  category,
  currencyText = 'ج.م',
  onClose,
  onRequestService,
}) => {
  const isRTL = I18nManager.isRTL;
  const [selectedOption, setSelectedOption] = useState(null);

  const isOptions = service?.service_type === 'options';

  useEffect(() => {
    if (visible && isOptions && service?.options?.length > 0) {
      setSelectedOption(service.options[0]);
    }

    if (!visible) {
      setSelectedOption(null);
    }
  }, [visible, isOptions, service]);

  const imageUrl = service?.image || service?.category_image || category?.image;

  const selectedPrice = useMemo(() => {
    if (isOptions) {
      return Number(selectedOption?.price_value || selectedOption?.price || 0);
    }

    return Number(service?.price_value || service?.price || 0);
  }, [isOptions, selectedOption, service]);

  const priceText = useMemo(() => {
    if (selectedPrice % 1 === 0) {
      return String(selectedPrice);
    }

    return selectedPrice.toFixed(2);
  }, [selectedPrice]);

  const renderImage = () => {
    if (!imageUrl) {
      return <Image source={FALLBACK_IMAGE} style={styles.heroImage} resizeMode="cover" />;
    }

    if (isSvg(imageUrl)) {
      return (
        <View style={styles.svgBox}>
          <SvgUri uri={imageUrl} width="100%" height="100%" />
        </View>
      );
    }

    return <Image source={{uri: imageUrl}} style={styles.heroImage} resizeMode="cover" />;
  };

  const handleRequest = () => {
    if (!service) {
      return;
    }

    if (isOptions && !selectedOption) {
      return;
    }

    onRequestService({
      service,
      option: selectedOption,
      price: selectedPrice,
    });
  };

  if (!service) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={() => {}}>
          <View style={styles.handle} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            <View style={styles.imageWrap}>{renderImage()}</View>

            <View style={styles.content}>
              <View style={styles.badge}>
                <AppText weight="medium" style={styles.badgeText}>
                  {category?.name || service?.category_name || ''}
                </AppText>
              </View>

              <AppText weight="bold" style={styles.title}>
                {service?.name}
              </AppText>

              {isOptions ? (
                <View style={styles.optionsGrid}>
                  {(service?.options || []).map(option => {
                    const active = String(selectedOption?.id) === String(option.id);
                    const optionPrice = option?.price_value || option?.price || 0;

                    return (
                      <TouchableOpacity
                        key={String(option.id)}
                        activeOpacity={0.88}
                        style={[styles.optionCard, active && styles.activeOptionCard]}
                        onPress={() => setSelectedOption(option)}>
                        <AppText
                          weight="bold"
                          style={[
                            styles.optionName,
                            active && styles.activeOptionName,
                          ]}>
                          {option.name}
                        </AppText>

                        <View style={styles.optionPriceRow}>
                          <AppText
                            weight="bold"
                            style={[
                              styles.optionPrice,
                              active && styles.activeOptionPrice,
                            ]}>
                            {optionPrice}
                          </AppText>

                          <AppText
                            style={[
                              styles.optionCurrency,
                              active && styles.activeOptionCurrency,
                            ]}>
                            {currencyText}
                          </AppText>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.priceRow}>
                  <AppText weight="bold" style={styles.price}>
                    {priceText}
                  </AppText>

                  <AppText style={styles.currency}>
                    {currencyText}
                  </AppText>
                </View>
              )}

              <View style={styles.section}>
                <AppText weight="bold" style={styles.sectionTitle}>
                  الوصف
                </AppText>

                <AppText style={styles.description}>
                  {service?.description || 'لا يوجد وصف متاح لهذه الخدمة حاليًا.'}
                </AppText>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.requestButton}
            onPress={handleRequest}>
            <Ionicons
              name={isRTL ? 'arrow-back-outline' : 'arrow-forward-outline'}
              size={18}
              color="#FFFFFF"
            />

            <AppText weight="bold" style={styles.requestButtonText}>
              طلب الخدمة
            </AppText>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ServiceDetailsModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 14,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 10,
    backgroundColor: '#D1D1D1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  scrollContent: {
    paddingBottom: 72,
  },
  imageWrap: {
    height: 185,
    borderRadius: 20,
    backgroundColor: '#EAF4FA',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  svgBox: {
    width: '100%',
    height: '100%',
    padding: 30,
  },
  content: {
    paddingTop: 14,
  },
  badge: {
    alignSelf: 'flex-start',
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F28A1A',
    backgroundColor: '#FFF4E8',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 11.5,
    color: '#D97812',
  },
  title: {
    fontSize: 20,
    color: '#111111',
    lineHeight: 29,
    textAlign: 'auto',
  },
  priceRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 26,
    color: '#111111',
  },
  currency: {
    fontSize: 13,
    color: '#8A8A8A',
    marginHorizontal: 5,
    marginBottom: 5,
  },
  optionsGrid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '31.5%',
    minHeight: 74,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  activeOptionCard: {
    borderColor: '#3296D9',
    backgroundColor: '#EAF6FE',
  },
  optionName: {
    fontSize: 12.5,
    color: '#1F1F1F',
    textAlign: 'center',
    marginBottom: 6,
  },
  activeOptionName: {
    color: '#157FC2',
  },
  optionPriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  optionPrice: {
    fontSize: 13.5,
    color: '#222222',
  },
  activeOptionPrice: {
    color: '#157FC2',
  },
  optionCurrency: {
    fontSize: 10.5,
    color: '#8A8A8A',
    marginHorizontal: 2,
    marginBottom: 1,
  },
  activeOptionCurrency: {
    color: '#157FC2',
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 15,
    color: '#111111',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#606060',
    lineHeight: 22,
    textAlign: 'auto',
  },
  requestButton: {
    position: 'absolute',
    start: 14,
    end: 14,
    bottom: 14,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#3296D9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginHorizontal: 6,
  },
});