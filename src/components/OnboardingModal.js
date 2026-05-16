import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  I18nManager
} from 'react-native';
import Modal from 'react-native-modal';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width;
const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.82);


export default function OnboardingModal({ visible, onClose }) {
  const carouselRef = useRef(null);
  const isRTL = I18nManager.isRTL;


    const { t } = useTranslation();
const slides = [
  {
    key: 's1',
    image: require('../../assets/images/news/1.jpg'),
    title: t('news.t1'),
    desc:  t('news.d1'),
  },
  {
    key: 's2',
    image: require('../../assets/images/news/2.jpg'),
     title: t('news.t2'),
    desc:  t('news.d2'),
  },
  {
    key: 's3',
    image: require('../../assets/images/news/3.jpg'),
    title: t('news.t3'),
    desc:  t('news.d3'),
  }
];


  // خلي Carousel يبدأ من آخر عنصر لو RTL (عشان المظهر يبقى صح)
  const firstCarouselIndex = isRTL ? slides.length - 1 : 0;

  // هذا هو الـ index "المنطقي" اللي بنعرضه في الـ pagination وبتعتمد عليه الأزرار
  const [activeIndex, setActiveIndex] = useState(0);

  // هذا الهاندلر يحوّل index الداخلي للـ Carousel إلى index منطقي
  const handleSnapToItem = (carouselIndex) => {
    const logicalIndex = isRTL ? (slides.length - 1 - carouselIndex) : carouselIndex;
    setActiveIndex(logicalIndex);
  };

  // التالي — يدير snap حسب اتجاه الـ RTL
  const goNext = () => {
    if (activeIndex < slides.length - 1) {
      if (isRTL) {
        // في RTL، الحركة البصرية "التالي" تعادل snapToPrev داخليًا
        carouselRef.current?.snapToPrev();
      } else {
        carouselRef.current?.snapToNext();
      }
    } else {
      onClose();
    }
  };

  // السابق — يدير snap حسب اتجاه الـ RTL
  const goPrev = () => {
    if (activeIndex > 0) {
      if (isRTL) {
        // في RTL، الحركة البصرية "السابق" تعادل snapToNext داخليًا
        carouselRef.current?.snapToNext();
      } else {
        carouselRef.current?.snapToPrev();
      }
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.slideWrap}>
        <View style={styles.previewWrapper}>
          <View style={styles.previewCard}>
            <Image source={item.image} style={styles.previewImage} resizeMode="cover" />
          </View>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        {item.desc ? <Text style={styles.desc}>{item.desc}</Text> : null}
      </View>
    );
  };

  return (
    <Modal
      isVisible={visible}
      backdropOpacity={0.5}
      onBackButtonPress={onClose}
      useNativeDriver
      hideModalContentWhileAnimating
    >
      <View style={styles.center}>
        <View style={styles.card}>
          <Carousel
            ref={carouselRef}
            data={slides}
            renderItem={renderItem}
            sliderWidth={SLIDER_WIDTH}
            itemWidth={ITEM_WIDTH}
            onSnapToItem={handleSnapToItem}
            firstItem={firstCarouselIndex}
            useScrollView
            inactiveSlideScale={0.98}
            inactiveSlideOpacity={1}
            scrollEnabled={false}
            inverted={false} // خليه false — احنا بندير الانعكاس بالـ mapping
          />

          <Pagination
            dotsLength={slides.length}
            activeDotIndex={activeIndex}
            containerStyle={styles.paginationContainer}
            dotStyle={styles.dotStyle}
            inactiveDotStyle={styles.inactiveDot}
            inactiveDotOpacity={0.4}
            inactiveDotScale={0.8}
          />

          <View style={styles.navRow}>
            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: activeIndex === 0 ? '#ddd' : '#0aa351' }]}
              onPress={goPrev}
              disabled={activeIndex === 0}
            >
              <Text style={styles.navText}>
                {isRTL ? 'السابق' : 'Prev'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navBtn, { marginStart: 15 }]}
              onPress={goNext}
            >
              <Text style={styles.navText}>
                {activeIndex === slides.length - 1
                  ? (isRTL ? 'تم' : 'Done')
                  : (isRTL ? 'التالي' : 'Next')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow:'hidden'
  },
  card: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingTop: 18,
    paddingBottom: 16,
    paddingHorizontal: 14,
    alignItems: 'center',
    elevation: 8
  },
  slideWrap: {
    alignItems: 'center',
    paddingBottom: 6
  },
  previewWrapper: {
    width: ITEM_WIDTH - 20,
    height: ITEM_WIDTH,
    marginBottom: 12,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  previewCard: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5'
  },
  previewImage: {
    width: '100%',
    height: '100%'
  },
  title: {
    fontSize: 16,
    color:'black',
    textAlign: 'center',
    fontFamily:'Tajawal-Bold',
    marginBottom: 4,
    paddingHorizontal: 8,
     lineHeight:22
  },
  desc: {
    fontSize: 15,
    fontFamily:'Tajawal-Regular',
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 8,
    marginBottom: 6,
    lineHeight:20
  },
  paginationContainer: {
    paddingVertical: 6
  },
  dotStyle: {
    width: 28,
    height: 6,
    borderRadius: 6,
    backgroundColor: '#0aa351',
    marginHorizontal: 3
  },
  inactiveDot: {
    backgroundColor: '#e6e6e6'
  },
  navBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#0aa351',
    alignItems: 'center',
    marginTop: 6
  },
  navText: {
    color: '#fff',
    fontSize: 12.5,
    fontFamily:'Tajawal-Bold'
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '86%'
  }
});
