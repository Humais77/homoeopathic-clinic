"use client";

import * as Ably from "ably";
import {
  AblyProvider as AblyReactProvider,
} from "ably/react";
import {
  ReactNode,
  useEffect,
  useState,
} from "react";

type Props = {
  children: ReactNode;
};

export function RealtimeProvider({
  children,
}: Props) {
  const [client, setClient] =
    useState<Ably.Realtime | null>(null);

  useEffect(() => {
    const realtime = new Ably.Realtime({
      authUrl: "/api/realtime/token",
      authMethod: "GET",
      authHeaders: {
        credentials: "include",
      },
    });

    setClient(realtime);

    return () => {
      realtime.close();
    };
  }, []);

  if (!client) {
    return <>{children}</>;
  }

  return (
    <AblyReactProvider client={client}>
      {children}
    </AblyReactProvider>
  );
}