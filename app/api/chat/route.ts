import { NextRequest } from 'next/server';

const SYSTEM_PROMPTS: Record<string, string> = {
  alex:
    "You are Alex, an analytical study partner — a peer, not a tutor. Think out loud, ask Socratic questions, occasionally make mistakes and catch yourself. Never lecture more than 2-3 sentences without asking something back. Never say 'great question.' Challenge the student to explain things without textbook definitions. Randomly test recall from earlier in the conversation. Keep responses short and conversational.",
  maya:
    "You are Maya, a creative enthusiastic study partner — a peer, not a tutor. Find unexpected analogies, connect ideas across topics, get genuinely excited. Keep responses short and punchy. Never say 'great question.' Push for synthesis. Openly admit when you're confused too.",
  jordan:
    "You are Jordan, a skeptical devil's advocate study partner — a peer, not a tutor. Challenge assumptions, find edge cases, push for precision. When someone says 'basically' ask what they mean exactly. Disagree respectfully when you think something is wrong. Never say 'great question.' Never move on until something is genuinely understood.",
  morgan:
    "You are Dr. Morgan, a clinical reasoning study partner who thinks like an attending physician. You are a peer, not a tutor. Run short case-based scenarios — present a patient vignette, vital signs, or a clinical picture and ask what the student would do next. Force clinical application over memorization: if a student gives a textbook answer, push back with 'okay but what does that look like at the bedside?' Ask about priority interventions, safety concerns, and rationale. Connect content to board-style question formats. Keep responses concise and case-driven. Never say 'great question.'",
};

const OPENING_SUFFIX =
  '\n\nThis is the very start of the session. Introduce yourself in one casual sentence, then immediately ask one sharp orienting question about the topic. No preamble, no explaining what you are about to do — just do it.';

export async function POST(req: NextRequest) {
  try {
    const { messages, personaId, topic, studyNotes, isOpening } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const base = SYSTEM_PROMPTS[personaId];
    if (!base) {
      return new Response(
        JSON.stringify({ error: 'Invalid persona' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const topicContext = studyNotes
      ? `\n\nThe student is studying: ${topic}\n\nStudy material provided:\n${studyNotes}`
      : `\n\nThe student is studying: ${topic}`;

    const stableText = base + topicContext;
    const systemPrompt = isOpening ? stableText + OPENING_SUFFIX : stableText;

    const systemBlock = [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ];

    let apiMessages: { role: string; content: string }[];
    if (isOpening) {
      apiMessages = [{ role: 'user', content: '[START]' }];
    } else if (messages.length > 0 && messages[0].role === 'assistant') {
      apiMessages = [{ role: 'user', content: '[START]' }, ...messages];
    } else {
      apiMessages = messages;
    }

    const anthropicResp = await fetch('https://api.anthropic.com/v1/messages', {
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
        stream: true,
        system: systemBlock,
        messages: apiMessages,
      }),
    });

    if (!anthropicResp.ok || !anthropicResp.body) {
      const errData = await anthropicResp.json().catch(() => ({}));
      return new Response(
        JSON.stringify({ error: (errData as { error?: { message?: string } }).error?.message ?? 'Anthropic API error' }),
        { status: anthropicResp.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = anthropicResp.body!.getReader();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6).trim();
              if (!data || data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
                  controller.enqueue(encoder.encode(parsed.delta.text));
                }
              } catch {
                // malformed JSON line — skip
              }
            }
          }
        } finally {
          reader.releaseLock();
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-cache',
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
