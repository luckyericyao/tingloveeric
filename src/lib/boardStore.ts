import type { BoardMessage } from "@/data/love";
import { boardSeedMessages } from "@/data/love";

const boardKey = "tingloveeric:board-messages";

type RedisResponse<T> = {
  result?: T;
  error?: string;
};

type GlobalBoardStore = typeof globalThis & {
  __tingLoveBoardMessages?: BoardMessage[];
};

function getRedisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return { url, token };
}

function memoryMessages() {
  const boardGlobal = globalThis as GlobalBoardStore;

  if (!boardGlobal.__tingLoveBoardMessages) {
    boardGlobal.__tingLoveBoardMessages = [...boardSeedMessages];
  }

  return boardGlobal.__tingLoveBoardMessages;
}

async function runRedisCommand<T>(command: Array<string | number>) {
  const config = getRedisConfig();

  if (!config) {
    return null;
  }

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Redis command failed with status ${response.status}`);
  }

  const payload = (await response.json()) as RedisResponse<T>;

  if (payload.error) {
    throw new Error(payload.error);
  }

  return payload.result ?? null;
}

export function boardPersistenceMode() {
  return getRedisConfig() ? "redis" : "memory";
}

export async function getBoardMessages() {
  if (!getRedisConfig()) {
    return [...memoryMessages()].sort((a, b) => b.datetime.localeCompare(a.datetime));
  }

  const saved = await runRedisCommand<string | null>(["GET", boardKey]);

  if (!saved) {
    await runRedisCommand<string>(["SET", boardKey, JSON.stringify(boardSeedMessages)]);
    return [...boardSeedMessages].sort((a, b) => b.datetime.localeCompare(a.datetime));
  }

  const parsed = JSON.parse(saved) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("Board messages in Redis are not an array.");
  }

  return (parsed as BoardMessage[]).sort((a, b) => b.datetime.localeCompare(a.datetime));
}

export async function addBoardMessage(message: BoardMessage) {
  if (!getRedisConfig()) {
    const messages = memoryMessages();
    messages.unshift(message);
    return [...messages].sort((a, b) => b.datetime.localeCompare(a.datetime));
  }

  const messages = await getBoardMessages();
  const nextMessages = [message, ...messages].sort((a, b) => b.datetime.localeCompare(a.datetime));
  await runRedisCommand<string>(["SET", boardKey, JSON.stringify(nextMessages)]);

  return nextMessages;
}
