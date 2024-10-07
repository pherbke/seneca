import { FC, PropsWithChildren } from "react";
import Theme from "../../theme";
import Auth from "./auth";

const App: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Auth>
      <Theme>{children}</Theme>
    </Auth>
  );
};

export default App;
