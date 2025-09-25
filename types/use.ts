export interface UserInfo {
  id?: string
  name: string
  email?: string | null
  image?: string | null
  fansCount: number
  postCount: number
  followsCount?: number
  starsCount?: number
  totalViews?: number
  createdAt?: string | Date
  interests?: string[]
}

export interface BioProps {
  userInfo: UserInfo
}
