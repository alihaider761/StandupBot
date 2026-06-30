/**
 * Slack Web API client factory.
 * Returns a WebClient pre-configured with the bot token.
 * Can optionally accept a per-org token to support multi-workspace setups.
 */
import { WebClient } from "@slack/web-api";

// Default client using the environment-level bot token
let _defaultClient: WebClient | null = null;

export function getSlackClient(token?: string): WebClient {
  if (token) {
    return new WebClient(token);
  }
  if (!_defaultClient) {
    const botToken = process.env.SLACK_BOT_TOKEN;
    if (!botToken) {
      throw new Error("SLACK_BOT_TOKEN environment variable is not set.");
    }
    _defaultClient = new WebClient(botToken);
  }
  return _defaultClient;
}

/**
 * Opens (or retrieves a cached) DM channel between the bot and a user.
 * Returns the channel ID string.
 */
export async function openDmChannel(
  slackUserId: string,
  token?: string
): Promise<string> {
  const client = getSlackClient(token);
  const result = await client.conversations.open({ users: slackUserId });
  if (!result.ok || !result.channel?.id) {
    throw new Error(
      `Failed to open DM channel for user ${slackUserId}: ${result.error}`
    );
  }
  return result.channel.id;
}

/**
 * Sends a message to a Slack channel/DM.
 */
export async function sendMessage(
  channelId: string,
  text: string,
  token?: string
): Promise<{ ts: string; channel: string }> {
  const client = getSlackClient(token);
  const result = await client.chat.postMessage({ channel: channelId, text });
  if (!result.ok || !result.ts) {
    throw new Error(`Failed to send message: ${result.error}`);
  }
  return { ts: result.ts, channel: result.channel as string };
}
