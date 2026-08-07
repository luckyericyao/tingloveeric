import type { BoardMessage } from "@/data/love";
import { boardSeedMessages } from "@/data/love";
import { getKvConfig, runKvCommand } from "@/lib/kvRest";

const boardKey = "tingloveeric:board-messages";

type GlobalBoardStore = typeof globalThis & {
  __tingLoveBoardMessages?: BoardMessage[];
};

function memoryMessages() {
  const boardGlobal = globalThis as GlobalBoardStore;

  if (!boardGlobal.__tingLoveBoardMessages) {
    boardGlobal.__tingLoveBoardMessages = [...boardSeedMessages];
  }

  return boardGlobal.__tingLoveBoardMessages;
}

export function boardPersistenceMode() {
  return getKvConfig() ? "redis" : "memory";
}

export async function getBoardMessages() {
  if (!getKvConfig()) {
    return [...memoryMessages()].sort((a, b) => b.datetime.localeCompare(a.datetime));
  }

  const saved = await runKvCommand<string | null>(["GET", boardKey]);

  if (!saved) {
    await runKvCommand<string>(["SET", boardKey, JSON.stringify(boardSeedMessages)]);
    return [...boardSeedMessages].sort((a, b) => b.datetime.localeCompare(a.datetime));
  }

  const parsed = JSON.parse(saved) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("Board messages in Redis are not an array.");
  }

  return (parsed as BoardMessage[]).sort((a, b) => b.datetime.localeCompare(a.datetime));
}

export async function addBoardMessage(message: BoardMessage) {
  if (!getKvConfig()) {
    const messages = memoryMessages();
    if (!messages.some((item) => item.id === message.id)) messages.unshift(message);
    return [...messages].sort((a, b) => b.datetime.localeCompare(a.datetime));
  }

  const messages = await getBoardMessages();
  if (messages.some((item) => item.id === message.id)) return messages;
  const nextMessages = [message, ...messages].sort((a, b) => b.datetime.localeCompare(a.datetime));
  await runKvCommand<string>(["SET", boardKey, JSON.stringify(nextMessages)]);

  return nextMessages;
}
