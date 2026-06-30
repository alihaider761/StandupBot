/**
 * Standup message parser.
 *
 * Strips social pleasantries and greeting filler from DM replies so we store
 * only the meaningful task content. Also detects blocker keywords.
 */

// ── Greeting / filler patterns to strip from the start of a message ──────────
const GREETING_PATTERNS: RegExp[] = [
  /^(hey|hi|hello|good\s+(morning|afternoon|evening)|howdy|sup|yo)[,!.\s]*/i,
  /^(sure|ok|okay|yep|yup|sounds\s+good|no\s+problem|got\s+it|will\s+do)[,!.\s]*/i,
  /^(thanks|thank\s+you|thx|ty)[,!.\s]*/i,
  /^(here\s+(you\s+go|goes|are|is)|here's\s+(my|the))[:\s]*/i,
  /^(my\s+(standup|update|answers?|report)(\s+(for\s+today|today))?)[:\s]*/i,
  /^(for\s+today|today's?\s+(standup|update))[:\s]*/i,
];

// ── Blocker / impediment keyword patterns ────────────────────────────────────
const BLOCKER_PATTERNS: RegExp[] = [
  /\b(block(ed|er|ing)?)\b/i,
  /\b(stuck|stalled|impediment|impeded|issue|problem|trouble|struggling)\b/i,
  /\b(can'?t\s+(proceed|continue|move\s+forward|do\s+it))\b/i,
  /\b(waiting\s+on|waiting\s+for)\b/i,
  /\b(need\s+(help|assistance|support))\b/i,
  /\b(escalat(e|ing|ion))\b/i,
  /\b(not\s+(working|sure\s+how))\b/i,
];

// ── Label prefixes for each standup section ───────────────────────────────────
// Users sometimes prefix their answers naturally, e.g. "Yesterday: …"
const SECTION_LABELS: Record<"yesterday" | "today" | "roadblocks", RegExp[]> =
  {
    yesterday: [
      /^(yesterday|done|completed?|finished?|accomplishe?d?)[:\-\s]+/i,
      /^\*?(yesterday|done)\*?[:\-\s]+/i,
    ],
    today: [
      /^(today|working\s+on|plan(ning)?|will\s+do|goal)[:\-\s]+/i,
      /^\*?(today|plan)\*?[:\-\s]+/i,
    ],
    roadblocks: [
      /^(roadblock|blocker|impediment|issue|problem|none|nothing|no\s+blocker)[:\-\s]*/i,
    ],
  };

/**
 * Strips greeting filler from the beginning of a raw message string.
 */
export function stripGreetings(raw: string): string {
  let text = raw.trim();
  let changed = true;
  while (changed) {
    changed = false;
    for (const pattern of GREETING_PATTERNS) {
      const replaced = text.replace(pattern, "");
      if (replaced !== text) {
        text = replaced.trim();
        changed = true;
      }
    }
  }
  return text.trim();
}

/**
 * Strips the section label prefix from a line (e.g. "Yesterday: " → "")
 */
function stripSectionLabel(
  text: string,
  section: "yesterday" | "today" | "roadblocks"
): string {
  let result = text;
  for (const pattern of SECTION_LABELS[section]) {
    result = result.replace(pattern, "");
  }
  return result.trim();
}

/**
 * Detects whether the given text contains any blocker-indicating language.
 */
export function detectBlocker(text: string): boolean {
  return BLOCKER_PATTERNS.some((pattern) => pattern.test(text));
}

export interface ParsedStandup {
  yesterday: string | null;
  today: string | null;
  roadblocks: string | null;
  hasBlocker: boolean;
  /** True when the reply contained all three sections */
  isComplete: boolean;
}

/**
 * Attempts to parse a full standup response from a single or multi-line
 * message. Supports both ordered (Q1 then Q2 then Q3 across separate messages)
 * and inline (numbered / labeled) formats.
 *
 * The function tries three strategies in order:
 *  1. Numbered list  (1. … 2. … 3. …)
 *  2. Labeled sections (Yesterday: …  Today: …  Roadblocks: …)
 *  3. Falls back to returning just the full cleaned text as "yesterday"
 */
export function parseStandupMessage(raw: string): ParsedStandup {
  const cleaned = stripGreetings(raw);

  // ── Strategy 1: numbered list ──────────────────────────────────────────────
  const numberedMatch = cleaned.match(
    /1[.)]\s*(.+?)(?:[\n\r]+)2[.)]\s*(.+?)(?:[\n\r]+)3[.)]\s*(.+)/is,
  );
  if (numberedMatch) {
    const [, y, t, r] = numberedMatch;
    const yesterday = stripSectionLabel(y.trim(), "yesterday");
    const today = stripSectionLabel(t.trim(), "today");
    const roadblocks = stripSectionLabel(r.trim(), "roadblocks");
    const hasBlocker = detectBlocker(roadblocks) || detectBlocker(today);
    return { yesterday, today, roadblocks, hasBlocker, isComplete: true };
  }

  // ── Strategy 2: labeled sections ──────────────────────────────────────────
  const lines = cleaned.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  let yesterday: string | null = null;
  let today: string | null = null;
  let roadblocks: string | null = null;
  let currentSection: "yesterday" | "today" | "roadblocks" | null = null;
  const sectionBuffers: Record<string, string[]> = {
    yesterday: [],
    today: [],
    roadblocks: [],
  };

  for (const line of lines) {
    if (SECTION_LABELS.yesterday.some((r) => r.test(line))) {
      currentSection = "yesterday";
      const stripped = stripSectionLabel(line, "yesterday");
      if (stripped) sectionBuffers.yesterday.push(stripped);
    } else if (SECTION_LABELS.today.some((r) => r.test(line))) {
      currentSection = "today";
      const stripped = stripSectionLabel(line, "today");
      if (stripped) sectionBuffers.today.push(stripped);
    } else if (SECTION_LABELS.roadblocks.some((r) => r.test(line))) {
      currentSection = "roadblocks";
      const stripped = stripSectionLabel(line, "roadblocks");
      if (stripped) sectionBuffers.roadblocks.push(stripped);
    } else if (currentSection) {
      sectionBuffers[currentSection].push(line);
    }
  }

  if (
    sectionBuffers.yesterday.length ||
    sectionBuffers.today.length ||
    sectionBuffers.roadblocks.length
  ) {
    yesterday =
      sectionBuffers.yesterday.join(" ").trim() || null;
    today = sectionBuffers.today.join(" ").trim() || null;
    roadblocks = sectionBuffers.roadblocks.join(" ").trim() || null;
    const hasBlocker =
      detectBlocker(roadblocks ?? "") || detectBlocker(today ?? "");
    const isComplete = !!(yesterday && today);
    return { yesterday, today, roadblocks, hasBlocker, isComplete };
  }

  // ── Strategy 3: single-answer fallback ────────────────────────────────────
  return {
    yesterday: cleaned || null,
    today: null,
    roadblocks: null,
    hasBlocker: detectBlocker(cleaned),
    isComplete: false,
  };
}

/**
 * Merges a new partial update into an existing ParsedStandup, filling in
 * whichever fields are still null.  Used when a user answers the three
 * standup questions across separate messages.
 */
export function mergeStandupUpdate(
  existing: Partial<ParsedStandup>,
  incoming: ParsedStandup
): ParsedStandup {
  const yesterday = existing.yesterday ?? incoming.yesterday;
  const today = existing.today ?? incoming.today;
  const roadblocks = existing.roadblocks ?? incoming.roadblocks;
  const hasBlocker =
    detectBlocker(roadblocks ?? "") || detectBlocker(today ?? "");
  const isComplete = !!(yesterday && today);
  return { yesterday, today, roadblocks, hasBlocker, isComplete };
}
