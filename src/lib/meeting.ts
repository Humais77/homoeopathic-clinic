import {
  AccessToken,
  RoomServiceClient,
} from "livekit-server-sdk";

const livekitUrl = process.env.LIVEKIT_URL;
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;

if (!livekitUrl) {
  throw new Error("LIVEKIT_URL is not configured.");
}

if (!apiKey) {
  throw new Error("LIVEKIT_API_KEY is not configured.");
}

if (!apiSecret) {
  throw new Error("LIVEKIT_API_SECRET is not configured.");
}

export const livekitHost = livekitUrl;

export const roomService = new RoomServiceClient(
  livekitUrl,
  apiKey,
  apiSecret
);

export async function createMeetingToken({
  roomName,
  identity,
  name,
  canPublish,
}: {
  roomName: string;
  identity: string;
  name: string;
  canPublish: boolean;
}) {
  const token = new AccessToken(
    apiKey,
    apiSecret,
    {
      identity,
      name,
      ttl: "2h",
    }
  );

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish,
    canSubscribe: true,
    roomAdmin: false,
  });

  return token.toJwt();
}