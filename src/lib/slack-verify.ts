/**
 * Slack request signature verification.
 *
 * Slack signs every request it sends to your endpoint using your signing secret
 * and HMAC-SHA256.  We replicate that computation and compare the result to
 * the X-Slack-Signature header to ensure the request is authentic.
 *
 * Reference: https://api.slack.com/authentication/verifying-requests-from-slack
 */
import crypto from "crypto";

const SLACK_VERSION = "v0";
/** Reject requests older than 5 minutes to prevent replay attacks. */
const MAX_AGE_SECONDS = 60 * 5;

export class SlackVerificationError extends Error {}

/**
 * Verifies an incoming Slack request.
 *
 * @param rawBody   - The raw, unparsed request body as a string or Buffer.
 * @param headers   - An object containing at minimum the two Slack headers.
 * @throws {SlackVerificationError} when verification fails.
 */
export function verifySlackRequest(
  rawBody: string | Buffer,
  headers: {
    "x-slack-signature": string | null | undefined;
    "x-slack-request-timestamp": string | null | undefined;
  }
): void {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  if (!signingSecret) {
    throw new SlackVerificationError(
      "SLACK_SIGNING_SECRET environment variable is not set."
    );
  }

  const timestamp = headers["x-slack-request-timestamp"];
  const providedSignature = headers["x-slack-signature"];

  if (!timestamp || !providedSignature) {
    throw new SlackVerificationError(
      "Missing required Slack verification headers."
    );
  }

  // Guard against replay attacks
  const requestAge = Math.abs(Date.now() / 1000 - parseInt(timestamp, 10));
  if (requestAge > MAX_AGE_SECONDS) {
    throw new SlackVerificationError(
      `Request timestamp is too old (${requestAge}s). Possible replay attack.`
    );
  }

  const body =
    rawBody instanceof Buffer ? rawBody.toString("utf8") : rawBody;

  const sigBasestring = `${SLACK_VERSION}:${timestamp}:${body}`;

  const computedSignature =
    `${SLACK_VERSION}=` +
    crypto
      .createHmac("sha256", signingSecret)
      .update(sigBasestring, "utf8")
      .digest("hex");

  // Constant-time comparison to prevent timing attacks
  const computedBuffer = Buffer.from(computedSignature, "utf8");
  const providedBuffer = Buffer.from(providedSignature, "utf8");

  if (
    computedBuffer.length !== providedBuffer.length ||
    !crypto.timingSafeEqual(computedBuffer, providedBuffer)
  ) {
    throw new SlackVerificationError("Slack request signature mismatch.");
  }
}
