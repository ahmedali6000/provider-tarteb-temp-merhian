import React from 'react';
import {TouchableOpacity, StyleSheet, Image, View} from 'react-native';
import AppText from '../../shared/AppText';

const CategoryCard = ({item, onPress, itemWidth, style}) => {
  return (
    <TouchableOpacity
      style={[styles.card, {width: itemWidth}, style]}
      onPress={() => onPress(item)}>
      <View style={styles.iconBox}>
        <Image
          source={
            item?.image
              ? {uri: item.image}
              : require('../../../assets/app/images/placeholder-category.png')
          }
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <AppText style={styles.name} numberOfLines={2}>
        {item?.name || item?.name_ar}
      </AppText>
    </TouchableOpacity>
  );
};

export default CategoryCard;

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#F6F6F6',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  image: {
    width: 55,
    height: 55,
    // backgroundColor:"red"
  },
  name: {
    fontSize: 12,
    color: '#222',
    textAlign: 'center',
    lineHeight: 18,
    width: '100%',
  },
});