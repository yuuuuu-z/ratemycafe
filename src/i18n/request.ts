import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

import en from "../messages/en.json";
import km from "../messages/km.json";

const messagesMap: Record<string, Messages> = {
  en,
  km,
};
type Messages = typeof en;
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: messagesMap[locale] || messagesMap.en,
  };
});
