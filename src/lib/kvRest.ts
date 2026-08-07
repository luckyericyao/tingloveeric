type KvResponse<T> = {
  result?: T;
  error?: string;
};

export function getKvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return { url, token };
}

export async function runKvCommand<T>(command: Array<string | number>) {
  const config = getKvConfig();

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
    throw new Error(`KV command failed with status ${response.status}`);
  }

  const payload = (await response.json()) as KvResponse<T>;

  if (payload.error) {
    throw new Error(payload.error);
  }

  return payload.result ?? null;
}
