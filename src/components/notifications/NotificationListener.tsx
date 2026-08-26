"use client";

import {
  useChannel,
} from "ably/react";

import { toast } from "sonner";

type NotificationPayload = {
  title: string;
  message: string;
};

type Props = {
  channelName: string;
};

export function NotificationListener({
  channelName,
}: Props) {
  useChannel(
    channelName,
    (message) => {
      const data =
        message.data as NotificationPayload;

      toast(data.title, {
        description: data.message,
      });
    }
  );

  return null;
}