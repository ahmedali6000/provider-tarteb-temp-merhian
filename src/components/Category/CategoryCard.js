import { View, Text } from 'react-native'
import React from 'react'
import PlatformTouchable from '../PlatformTouchable'
import ImageLoad from 'react-native-image-placeholder'
import styles from './style'
import { useNavigation } from '@react-navigation/native'

export default function CategoryCard(props) {
  const navigation = useNavigation();
  const {category , ...rest} = props;
  return (
    <PlatformTouchable onPress={() => {
      if(category.childsCount == 0){
          navigation.navigate('CategoryScreen', {
              category: category
            });
      }else{
          navigation.navigate('SubCategoryScreen', {
              category: category
            });
      }
      
  }}>
        <View style={styles.note} >
            <View style={{flexDirection:'row',flex:1}}>
            <ImageLoad
                isShowActivity={false}
                style={{height:40,width:40,borderRadius:10,alignSelf:'center',marginEnd:10}}
                loadingStyle={{ size: 'small', color: 'blue' }}
                source={{ uri: category.image ,cache: 'only-if-cached' }}
                />
                <View style={{flex:1,justifyContent:'center',paddingHorizontal:5}}>
                <Text style={styles.noteT1}>{category.name}  </Text>
                <Text style={[styles.noteT2]}> {category.services_count} services in this category </Text>
                </View>
            </View>
        </View>
        </PlatformTouchable>
  )
}