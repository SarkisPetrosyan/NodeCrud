import fetch from 'node-fetch';

import { LoginProviderTypeEnum } from './enums';
import { socialProvidersKeys } from './constants';

class SocialProviderServices {

  public getUserData = async(socialProvider: number, token: string): Promise<ISocialMediaData> => {
    switch (socialProvider) {
      case LoginProviderTypeEnum.facebook: {
        const data = await this.getFacebookData(token);
        return data;
      }
      case LoginProviderTypeEnum.google: {
        const data = await this.getGoogleData(token);
        return data;
      }
      default: {
        return;
      }
    }
  }

  private async getFacebookData(token: string): Promise<ISocialMediaData> {
    const data: IFacebookData = await fetch( socialProvidersKeys.facebookUrl + token, { method: 'GET' }).then(res => {
      if (res.status === 200) {
        const data = res.json();
        return data;
      } else {
        return;
      }
    });
    if (data) {
      const socialData: ISocialMediaData = {
        id: data.id,
        email: data.email.toLowerCase(),
        firstName: data.first_name,
        lastName: data.last_name,
        profilePicture: data.picture && data.picture.data && data.picture.data.url
      };
      return socialData;
    } else {
      return;
    }
  }

  private async getGoogleData(token: string): Promise<ISocialMediaData> {
    const data: IGoogleData = await fetch( socialProvidersKeys.googleUrl + token, { method: 'GET' }).then(res => {
      if (res.status === 200) {
        const data = res.json();
        return data;
      } else {
        return;
      }
    });
    if (data) {
      const socialData: ISocialMediaData = {
        id: data.sub,
        email: data.email.toLowerCase(),
        firstName: data.given_name,
        lastName: data.family_name,
        profilePicture: data.picture,
      };
      return socialData;
    } else {
      return;
    }
  }
}

export default new SocialProviderServices();

export interface ISocialMediaData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

interface IFacebookData {
  id: string;
  email: string;
  last_name: string;
  first_name: string;
  picture: {
    data: {
      height: number;
      is_silhouette: boolean,
      url: string;
      width: number;
    }
  };
}

interface IGoogleData {
  sub: string;
  email: string;
  given_name: string;
  family_name: string;
  picture: string;
}