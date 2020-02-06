export const mediaPaths = {
  files  : 'files/',
  photos : 'photos/',
  videos : 'videos/',
  audios : 'audios/'
};

export const socialProvidersKeys = {
  facebookUrl : 'https://graph.facebook.com/me?fields=last_name,first_name,email,gender,picture.width(400)&access_token=',
  googleUrl   : 'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token='
};


// ! TODO Change this
export const googleApiKey = 'AIzaSyDqJcJAtQJJXQcFHJ12FAkvMPhw79tE3Oc';
export const googleDistanceApiUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json?';
export const googlePointApiUrl = 'https://maps.googleapis.com/maps/api/geocode/json?';

export const schemaReferences = {
  user                    : 'User',
  userPassword            : 'UserPassword',
  device                  : 'Device',
  country                 : 'Country',
  countryTranslation      : 'CountryTranslations',
  supportMessage          : 'SupportMessage',
  news                    : 'News',
  newsTranslation         : 'NewsTranslation',
  file                    : 'File',
  staff                   : 'Staff',
  staffTranslation        : 'StaffTranslation',
  appTerm                 : 'AppTerm',
  partner                 : 'Partner',
  partnerTranslation      : 'PartnerTranslation',
  notification            : 'Notification',
  notificationTranslation : 'NotificationTranslation',
  userNotification        : 'UserNotification',
  refreshToken            : 'RefreshToken',
  topicCategory           : 'TopicCategory',
  topicCategoryTranslation: 'TopicCategoryTranslation',
  topic                   : 'Topic',
  topicAddress            : 'TopicAddress',
  topicAction             : 'TopicAction',
  movie                   : 'Movie',
  movieTranslation        : 'MovieTranslation',
};

export const languageCount = 4;

export const fireBaseKeys = {
  serverKey : 'AAAAybGNt3A:APA91bFj0uHAGBmD8rXAckw695tsV_ClIzVeT_rKhkBSfEPsize-kgQlNQ3Na73nbh1GfCC_w8J41LWs72Gd1D5i4HFKnZj_doKa9hUghAWtr1KJH-WbT1n2SAbSElcbFLUrqy78EnZq',
  senderId  : '866267281264'
};

export const jwtExpiration = {
  web  : '3m',
  admin: '10m',
  app  : '5m',
};

export const refreshExpiration = {
  web  : 1000 * 60 * 60 * 24,
  admin: 1000 * 60 * 60 * 24 * 4,
  app  : 1000 * 60 * 60 * 24 * 60
};