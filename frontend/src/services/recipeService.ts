import axios from 'axios';

const recipeApi = axios.create({
  baseURL: 'https://www.themealdb.com/api/json/v1/1',
});

export const recipeService = {
  findByIngredient: (ingredient) =>
    recipeApi.get('/filter.php', {
      params: { i: ingredient },
    }),

  searchByName: (query) =>
    recipeApi.get('/search.php', {
      params: { s: query },
    }),

  getById: (id) =>
    recipeApi.get('/lookup.php', {
      params: { i: id },
    }),
};
