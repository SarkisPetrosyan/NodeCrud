export enum LanguageEnum {
  armenian = 1,
  russian,
  english,
  french
}

export enum UserRoleEnum {
  user = 1,
  corporate,
  admin,
  superAdmin
}

export enum LoginProviderTypeEnum {
  local = 1,
  facebook,
  google
}

export enum OsTypeEnum {
  android = 1,
  ios,
  web
}

export enum GenderTypeEnum {
  male = 1,
  female
}

export enum WebRedirectTypeEnum {
  register = 1,
  restore
}

export enum AuthActivityTypeEnum {
  register = 1,
  restore
}

export enum MediaTypeEnum {
  photo = 1,
  video
}

export enum NewsStatusEnum {
  hidden = 1,
  active
}

export enum StaffStatusEnum {
  hidden = 1,
  active
}

export enum AppTermTypeEnum {
  terms = 1,
  policy
}

export enum UserStatusEnum {
  active = 1,
  blocked = 2
}

export enum NotificationTypeEnum {
  custom = 1
}

export enum NotificationStatusEnum {
  scheduled = 1,
  sent
}

export enum TopicStatusEnum {
  pending = 1,
  rejected,
  published
}

export enum UserTopicSortEnum {
  date = 1,
  vote,
  view
}

export enum TopicActionTypeEnum {
  view = 1,
  vote
}

export enum SupportMessageListTypeEnum {
  important = 1,
  unread = 2
}

export enum SupportMessageListUserTypeEnum {
  user = 1,
  corporate = 2,
  notRegistered = 3
}