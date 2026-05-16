export const navigateByCategory = (navigation, category) => {
  if (Number(category?.id) === 50) {
    navigation.navigate('CleaningCategoriesView', {category});
    return;
  }

  switch (category.view_type) {
    case 'traditional':
      navigation.navigate('TraditionalView', {category});
      break;

    case 'services_direct':
    case 'dual':
      navigation.navigate('TraditionalServicesScreen', {category});
      break;

    case 'cleaning':
      navigation.navigate('CleaningScreen', {category});
      break;

    default:
      navigation.navigate('TraditionalView', {category});
      break;
  }
};