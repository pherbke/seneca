// web/theme/index.tsx
"use client";

import React, { FC, ReactNode } from "react";
import { ConfigProvider } from "antd";
import enUS from "antd/es/locale/en_US";
import en from "antd/es/date-picker/locale/en_US";

interface ThemeProps {
  children: ReactNode;
}

const Theme: FC<ThemeProps> = ({ children }) => {
  const buddhistLocale: typeof en = {
    ...en,
    lang: {
      ...en.lang,
      fieldDateFormat: "DD/MM/YYYY",
      fieldDateTimeFormat: "YYYY-MM-DD HH:mm:ss",
      yearFormat: "YYYY",
      cellYearFormat: "YYYY",
    },
  };

  const locale: typeof enUS = {
    ...enUS,
    DatePicker: {
      ...enUS.DatePicker!,
      lang: buddhistLocale.lang,
    },
  };

  return (
      <ConfigProvider
          componentSize="middle"
          theme={{
            token: {
              colorTextBase: "#000",
              colorPrimary: "#1976D2",
              fontFamily: "var(--inter)",
              colorBgContainer: "#fff",
              fontSize: 14,
              fontSizeHeading1: 16,
              screenSMMin: 601,
              screenSM: 601,
              screenXSMax: 600,
            },
            components: {
              Layout: {
                headerBg: "#fff",
              },
            },
          }}
          locale={locale}
      >
        {children as React.ReactNode}
      </ConfigProvider>
  );
};

export default Theme;