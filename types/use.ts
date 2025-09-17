export interface UserInfo {
  name: string;
  fansCount: number;
  postCount: number;
}

export interface BioProps {
  userInfo: UserInfo;
}