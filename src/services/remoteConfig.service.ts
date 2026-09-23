import {
  fetchAndActivate,
  getBoolean,
  getNumber,
  getString,
} from 'firebase/remote-config';
import { DEV_MODE, getFirebaseRemoteConfig } from './firebase';
import { DEV_REMOTE_CONFIG } from '../data/devData';
import type { RemoteConfigState } from '../types';

const DEFAULTS: Record<string, string | number | boolean> = {
  home_banner_visible: false,
  home_banner_title: '',
  home_banner_subtitle: '',
  home_banner_color: '#FF5722',
  home_banner_action_url: '',
  home_banner_icon: 'shield',
  offer_visible: false,
  offer_title: '',
  offer_discount_percent: 0,
  offer_code: '',
  offer_expiry: '',
  new_feature_visible: false,
  new_feature_title: '',
  new_feature_description: '',
  new_feature_screen: '',
  maintenance_mode: false,
  maintenance_message: '',
  force_update_required: false,
  min_app_version: '1.0.0',
  tip_of_day: 'Apni medicines time pe lena bhool mat!',
  thalsaathi_campaign: false,
  thalsaathi_banner_text: '',
};

export async function initRemoteConfig(): Promise<RemoteConfigState> {
  if (DEV_MODE) {
    return DEV_REMOTE_CONFIG;
  }

  const config = getFirebaseRemoteConfig();
  if (!config) return DEV_REMOTE_CONFIG;

  config.settings.minimumFetchIntervalMillis = __DEV__ ? 0 : 300000;
  config.defaultConfig = DEFAULTS;

  await fetchAndActivate(config);
  return readRemoteConfig();
}

export function readRemoteConfig(): RemoteConfigState {
  if (DEV_MODE) return DEV_REMOTE_CONFIG;

  const config = getFirebaseRemoteConfig();
  if (!config) return DEV_REMOTE_CONFIG;

  return {
    homeBanner: {
      visible: getBoolean(config, 'home_banner_visible'),
      title: getString(config, 'home_banner_title'),
      subtitle: getString(config, 'home_banner_subtitle'),
      color: getString(config, 'home_banner_color'),
      actionUrl: getString(config, 'home_banner_action_url'),
      icon: getString(config, 'home_banner_icon'),
    },
    offer: {
      visible: getBoolean(config, 'offer_visible'),
      title: getString(config, 'offer_title'),
      discount: getNumber(config, 'offer_discount_percent'),
      code: getString(config, 'offer_code'),
      expiry: getString(config, 'offer_expiry'),
    },
    newFeature: {
      visible: getBoolean(config, 'new_feature_visible'),
      title: getString(config, 'new_feature_title'),
      description: getString(config, 'new_feature_description'),
      screen: getString(config, 'new_feature_screen'),
    },
    maintenance: {
      active: getBoolean(config, 'maintenance_mode'),
      message: getString(config, 'maintenance_message'),
    },
    forceUpdate: getBoolean(config, 'force_update_required'),
    minAppVersion: getString(config, 'min_app_version'),
    tipOfDay: getString(config, 'tip_of_day'),
    thalsaathiCampaign: getBoolean(config, 'thalsaathi_campaign'),
  };
}

export async function refreshRemoteConfig(): Promise<RemoteConfigState> {
  return initRemoteConfig();
}
