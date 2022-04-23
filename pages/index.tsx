import { useEffect, useState } from "react";
import App from "../components/app";

const AppPage = () => {
  const [hasAPI, setApiStatus] = useState<boolean | null>(null);
  const [isChrome, setIsChrome] = useState<boolean | null>(null);
  useEffect(() => {
    setApiStatus("showDirectoryPicker" in window);
    setIsChrome("chrome" in window);
  }, []);
  return hasAPI ? (
    <App />
  ) : (
    <div className="flex-1 flex items-center justify-center text-xl">
      FileSystem API not detected, please
      {!isChrome
        ? " make sure you're using chrome"
        : " make sure your browser is up to date"}
    </div>
  );
};

export default AppPage;
