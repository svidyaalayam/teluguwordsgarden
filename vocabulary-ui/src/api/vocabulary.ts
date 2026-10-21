import { api } from './client'

export interface VocabularyWord {
  id: number
  term: string
  definition: string
  part_of_speech: string
  pronunciation: string
  audio_url: string
  image_url: string
  example_sentence: string
  categories: number[]
  levels: number[]
}

export interface VocabularyCategory {
  id: number
  name: string
  active: boolean
}

export interface LearningLevel {
  id: number
  name: string
  description: string
  display_order: number
  active: boolean
}

export async function listVocabularyWords(q = ''): Promise<VocabularyWord[]> {
  const { data } = await api.get<VocabularyWord[]>('/api/vocabulary/words/', { params: { q } })
  return data
}

export async function listVocabularyCategories(): Promise<VocabularyCategory[]> {
  const { data } = await api.get<VocabularyCategory[]>('/api/vocabulary/categories/')
  return data
}

export async function listLearningLevels(): Promise<LearningLevel[]> {
  const { data } = await api.get<LearningLevel[]>('/api/vocabulary/levels/')
  return data
}
