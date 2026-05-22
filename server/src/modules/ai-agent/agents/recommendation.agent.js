import * as recommendationService from '../../recommendations/service.js';

export async function runRecommendationAgent(userId, params) {
  return recommendationService.recommendForUser(userId, params);
}
