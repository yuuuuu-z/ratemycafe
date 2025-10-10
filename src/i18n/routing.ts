import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "km"],
  defaultLocale: "km",
  localePrefix: "as-needed",
});
