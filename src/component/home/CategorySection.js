import React, {useMemo} from 'react';
import {View, StyleSheet, FlatList, Dimensions} from 'react-native';
import SectionHeader from './SectionHeader';
import CategoryCard from './CategoryCard';

const {width: screenWidth} = Dimensions.get('window');

const HORIZONTAL_PADDING = 16;
const ITEM_SPACING = 8;
const NUM_COLUMNS = screenWidth < 360 ? 3 : 4;

const totalSpacing = ITEM_SPACING * (NUM_COLUMNS - 1);
const itemWidth =
  (screenWidth - HORIZONTAL_PADDING * 2 - totalSpacing) / NUM_COLUMNS;

const CategorySection = ({title, data = [], onPressCategory}) => {
  const displayData = useMemo(() => {
    return [...data].reverse();
  }, [data]);

  const renderItem = ({item, index}) => {
    const isLastColumn = (index + 1) % NUM_COLUMNS === 0;

    return (
      <CategoryCard
        item={item}
        onPress={onPressCategory}
        itemWidth={itemWidth}
        style={{
          marginLeft: isLastColumn ? 0 : ITEM_SPACING,
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <SectionHeader title={title} />

      <FlatList
        data={displayData}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        numColumns={NUM_COLUMNS}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={false}
      />
    </View>
  );
};

export default CategorySection;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: HORIZONTAL_PADDING,
    marginTop: 18,
    
  },
  listContent: {
    paddingTop: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 18,
  },
});