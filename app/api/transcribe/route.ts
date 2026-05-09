import { NextRequest } from 'next/server';

const TRANSCRIPTION_TIMEOUT = 30000; // 30 seconds
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('audio') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No audio file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file size upfront
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ 
          error: `File is too large. Maximum size is 25MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.` 
        }),
        { status: 413, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/flac'];
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const validExts = ['mp3', 'mp4', 'wav', 'm4a', 'ogg', 'webm', 'flac'];

    if (!validExts.includes(ext) && !validTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ 
          error: `Unsupported audio format: ${ext}. Supported formats: MP3, MP4, WAV, M4A, OGG, WEBM, FLAC` 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Audio transcription service is not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare FormData for OpenAI
    const openaiFormData = new FormData();
    openaiFormData.append('file', file);
    openaiFormData.append('model', 'whisper-1');

    // Set transcription timeout
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Transcription timeout')), TRANSCRIPTION_TIMEOUT)
    );

    const transcriptionPromise = fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: openaiFormData,
    });

    let response: Response;
    try {
      response = await Promise.race([transcriptionPromise, timeoutPromise]);
    } catch (timeoutError) {
      if (timeoutError instanceof Error && timeoutError.message === 'Transcription timeout') {
        return new Response(
          JSON.stringify({ error: 'Audio transcription took too long. Please try a shorter audio file.' }),
          { status: 408, headers: { 'Content-Type': 'application/json' } }
        );
      }
      throw timeoutError;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = (errorData as any).error?.message || 'OpenAI API error';
      
      return new Response(
        JSON.stringify({ error: `Transcription failed: ${errorMessage}` }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const transcript = (data as any).text || '';

    if (!transcript || transcript.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'No speech detected in audio file' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ transcript }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
