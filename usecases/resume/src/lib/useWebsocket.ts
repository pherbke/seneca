import { useEffect, useState, useCallback } from "react";

const useWebSocket = (url: string | null) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [wsClientId, setWsClientId] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [vpLink, setVpLink] = useState("");

  const connectWebSocket = useCallback(() => {
    if (url) {
      const newSocket = new WebSocket(url);

      newSocket.onopen = () => {
        console.log("WS: Connection established");
      };

      newSocket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      newSocket.onclose = () => {
        console.log("WebSocket connection closed");
      };

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [url]);

  useEffect(() => {
    if (url) {
      const cleanup = connectWebSocket();
      return () => {
        if (cleanup) cleanup();
      };
    }
  }, [connectWebSocket, url]);

  return {
    socket,
    wsClientId,
    setWsClientId,
    showQR,
    setShowQR,
    vpLink,
    setVpLink,
  };
};

export default useWebSocket;
