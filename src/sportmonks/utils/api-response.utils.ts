import { Logger } from '@nestjs/common';
import { ApiFixture, ApiFixtureResponse } from '../types/api-response.types';

const logger = new Logger('SportMonksApiResponseUtils');

/**
 * Padroniza a resposta da API SportMonks para um formato consistente com paginação
 * @param data Dados a serem normalizados
 * @returns Resposta padronizada com dados e informações de paginação
 */
export function normalizeApiResponse(data: any): ApiFixtureResponse {
  const normalizedData = Array.isArray(data) 
    ? data 
    : (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) 
      ? data.data 
      : [data];

  logger.debug(`Normalized SportMonks API response with ${normalizedData.length} items`);

  return {
    data: normalizedData,
    pagination: {
      count: normalizedData.length,
      per_page: normalizedData.length,
      current_page: 1,
      next_page: null,
      has_more: false,
    },
  };
} 