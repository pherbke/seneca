import React, { FC, PropsWithChildren } from "react";
import { Layout as AntLayout } from "antd";

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <AntLayout style={{ height: "100vh" }}>
      <AntLayout>{children}</AntLayout>
    </AntLayout>
  );
};

export default Layout;
