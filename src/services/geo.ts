import fetch from 'node-fetch';
import { googlePointApiUrl, googleApiKey } from './constants';

export const getCityNameFromMapByGoogleMaps = async (lat: number, lng: number): Promise<{ city: string, address: string }> => {
  const url = `${googlePointApiUrl}latlng=${lat},${lng}&language=en&key=${googleApiKey}`;
  const result = await fetch(url);
  if (result.ok) {
    const body = await result.json();
    const results = body.results;
    let city = '', address = '';
    for (let i = 0; i < results.length; i++) {
      if (results[i].address_components) {
        const cityData = getByType(results[i].address_components);
        if (cityData.city) city = cityData.city;
        if (cityData.address) address = cityData.address;
        if (!city || !address) continue;
        else break;
      }
    }
    return { city, address };
  } else {
    console.log('Google Points API did not give city name by coordinates');
    return null;
  }
};

function getByType(addressComponents: Array<{ long_name?: string, short_name: string, types: string[] }>): { city: string, address: string } {
  const cityType = ['locality', 'political'];
  const addressType = ['route'];
  let city, address;
  for (let i = 0; i < addressComponents.length; i++) {
    const isCity = arraysEqual(cityType, addressComponents[i].types);
    const isAddress = arraysEqual(addressType, addressComponents[i].types);
    if (isCity && addressComponents[i].long_name) {
      city = addressComponents[i].long_name;
    } else if (isAddress && addressComponents[i].long_name) {
      address = addressComponents[i].long_name;
    }
  }
  return { city, address };
}

function arraysEqual(arr1: any[], arr2: any[]) {
  arr1.sort();
  arr2.sort();
  if (arr1.length !== arr2.length) return false;
  for (let i = arr1.length; i--;) {
    if (arr1[i].toString() !== arr2[i].toString()) return false;
  }
  return true;
}