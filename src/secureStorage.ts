import * as Keychain from "react-native-keychain";

export const secureStorage = {
  async getItem(key: string) {
    const result = await Keychain.getGenericPassword({ service: key });
    return result ? result.password : null;
  },
  async setItem(key: string, value: string) {
    await Keychain.setGenericPassword("coaching", value, { service: key });
  },
  async removeItem(key: string) {
    await Keychain.resetGenericPassword({ service: key });
  },
};