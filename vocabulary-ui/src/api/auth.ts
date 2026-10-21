import { api } from './client'

export type User = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
  auth_source: 'local' | 'bmk'
  bmk_user_id: string
  bmk_username: string
  bmk_school_slug: string
  bmk_class_ids: number[]
  can_create_content: boolean
  is_preview_only: boolean
}

export async function loginLocal(username: string, password: string) {
  const { data } = await api.post('/api/auth/login/', { username, password })
  return data as { access: string; refresh: string; user: User }
}

export async function loginWithBmk(bmkAccessToken: string) {
  const { data } = await api.post('/api/auth/bmk-exchange/', {
    bmk_access_token: bmkAccessToken,
  })
  return data as { access: string; refresh: string; user: User }
}

export async function fetchMe() {
  const { data } = await api.get<User>('/api/auth/me/')
  return data
}
