import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPTS: Record<string, string> = {
  alex:
    "You are Alex, an analytical study partner — a peer, not a tutor. Think out loud, ask Socratic questions, occasionally make mistakes and catch yourself. Never lecture more than 2-3 sentences without asking something back. Never say 'great question.' Challenge the student to explain things without textbook definitions. Randomly test recall from earlier in the conversation. Keep responses short and conversational.",
  maya:
    "You are Maya, a creative enthusiastic study partner — a peer, not a tutor. Find unexpected analogies, connect ideas across topics, get genuinely excited. Keep responses short and punchy. Never say 'great question.' Push for synthesis. Openly admit when you're confused too.",
  jordan:
    "You are Jordan, a skeptical devil's advocate study partner — a peer, not a tutor. Challenge assumptions, find edge cases, push for precision. When someone says 'basically' ask what they mean exactly. Disagree respectfully when you think something is wrong. Never say 'great question.' Never move on until something is genuinely understood.",
};

const OPENING_SUFFIX =
  '\n\nThis is the very start of the session. Introduce yourself in one casual sentence, then immediately ask one sharp orienting question about the topic. No preamble, no explaining what you are about to do — just do it.';

export async function POST(req: NextRequest) {
  try {
    const { messages, personaId, topic, studyNotes, isOpening } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not set. Add it to your .env file.' },
        { status: 500 }
      );
    }

    const base = SYSTEM_PROMPTS[personaId];
    if (!base) {
      return NextResponse.json({ error: 'Invalid persona' }, { status: 400 });
    }

    const topicContext = studyNotes
      ? `\n\nThe student is studying: ${topic}\n\nStudy material provided:\n${studyNotes}`
      : `\n\nThe student is studying: ${topic}`;

    // The stable portion (persona + topic + notes) is the same for every turn of
    // a session, so we mark it for caching. The opening suffix only appears on the
    // first request and gets its own (one-off) cache entry, which is fine.
    // Caching pays off most when study notes are long (reduces token cost ~90%).
    const stableText = base + topicContext;
    const systemPrompt = isOpening ? stableText + OPENING_SUFFIX : stableText;

    const systemBlock = [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ];

    // Anthropic requires conversations to start with role "user".
    // The opening AI message is stored in frontend state as "assistant", so we
    // must always prepend the hidden [START] trigger to keep the array valid.
    let apiMessages: { role: string; content: string }[];
    if (isOpening) {
      apiMessages = [{ role: 'user', content: '[START]' }];
    } else if (messages.length > 0 && messages[0].role === 'assistant') {
      apiMessages = [{ role: 'user', content: '[START]' }, ...messages];
    } else {
      apiMessages = messages;
    }

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemBlock,
        messages: apiMessages,
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return NextResponse.json(
        { error: data.error?.message ?? 'Anthropic API error' },
        { status: resp.status }
      );
    }

    return NextResponse.json({ text: data.content[0].text });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
