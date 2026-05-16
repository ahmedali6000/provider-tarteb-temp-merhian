import api from './api';

export const getTraditionalServices = async ({

  categoryId,
  page = 1,
  perPage = 10,
  search = '',
  sort = 'all',
  subCategoryId = 'all',
}) => {
  const params = {
    page,
    per_page: perPage,
    sort,
  };
 
  if (search?.trim()) {
    params.search = search.trim();
  }

  if (subCategoryId && subCategoryId !== 'all') {
    params.sub_category_id = subCategoryId;
  }

  const response = await api.get(`/categories/${categoryId}/services`, {
    params,
  });

  return response.data;
};