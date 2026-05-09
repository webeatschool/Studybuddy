import { NextRequest } from 'next/server';

const EXTRACTION_TIMEOUT = 10000; // 10 seconds
const MAX_PDF_PAGES = 50; // Limit to first 50 pages for performance
const MAX_CHARS = 50000; // Cap output at 50KB characters

async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const { getDocument } = await import('pdfjs-dist/legacy/build/pdf');
    
    // Set up worker
    const pdfjsWorker = await import('pdfjs-dist/legacy/build/pdf.worker');
    if (typeof window === 'undefined') {
      // We're in Node/server context
      const pdfWorker = require('pdfjs-dist/legacy/build/pdf.worker');
      // @ts-ignore
      getDocument.workerSrc = pdfWorker;
    }
    
    const buffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: new Uint8Array(buffer) }).promise;
    const pageCount = Math.min(pdf.numPages, MAX_PDF_PAGES);
    
    const textExtraction: string[] = [];
    
    // Extract pages in parallel (up to 5 at a time)
    const batchSize = 5;
    for (let i = 0; i < pageCount; i += batchSize) {
      const batchPromises = [];
      for (let j = i; j < Math.min(i + batchSize, pageCount); j++) {
        batchPromises.push(
          (async () => {
            try {
              const page = await pdf.getPage(j + 1);
              const textContent = await page.getTextContent();
              const pageText = (textContent.items as any[])
                .map((item: any) => item.str || '')
                .join('');
              return pageText;
            } catch (e) {
              return ''; // Skip pages that fail
            }
          })()
        );
      }
      
      const results = await Promise.all(batchPromises);
      textExtraction.push(...results);
    }
    
    let fullText = textExtraction.join('\n').trim();
    
    if (!fullText) {
      throw new Error('No readable text found in PDF');
    }
    
    // Truncate if necessary
    if (fullText.length > MAX_CHARS) {
      fullText = fullText.slice(0, MAX_CHARS) + '\n\n[Content truncated due to size...]';
    }
    
    return fullText;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function extractTextFromDocx(file: File): Promise<string> {
  try {
    const mammoth = await import('mammoth');
    
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    
    let text = result.value || '';
    text = text.trim();
    
    if (!text) {
      throw new Error('No readable text found in DOCX');
    }
    
    if (text.length > MAX_CHARS) {
      text = text.slice(0, MAX_CHARS) + '\n\n[Content truncated due to size...]';
    }
    
    return text;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error(`DOCX extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function extractTextFromDoc(file: File): Promise<string> {
  // For .doc files (older format), we can attempt basic extraction or return an error
  // Note: Full .doc support would require a dedicated library
  throw new Error('Legacy .doc format is not fully supported. Please convert to .docx');
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('document') as File;
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No document provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const fileSize = file.size;
    
    // Validate file type
    if (!['pdf', 'docx', 'doc', 'txt', 'md', 'rtf'].includes(ext)) {
      return new Response(
        JSON.stringify({ error: `Unsupported file type: .${ext}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate file size (max 20MB)
    if (fileSize > 20 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ 
          error: `File is too large (${(fileSize / 1024 / 1024).toFixed(2)}MB). Maximum size is 20MB.` 
        }),
        { status: 413, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Set extraction timeout
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Extraction timeout')), EXTRACTION_TIMEOUT)
    );
    
    let text = '';
    
    try {
      if (ext === 'txt' || ext === 'md' || ext === 'rtf') {
        // Simple text file
        text = await Promise.race([file.text(), timeoutPromise]);
      } else if (ext === 'pdf') {
        text = await Promise.race([extractTextFromPDF(file), timeoutPromise]);
      } else if (ext === 'docx') {
        text = await Promise.race([extractTextFromDocx(file), timeoutPromise]);
      } else if (ext === 'doc') {
        text = await Promise.race([extractTextFromDoc(file), timeoutPromise]);
      }
    } catch (timeoutError) {
      if (timeoutError instanceof Error && timeoutError.message === 'Extraction timeout') {
        return new Response(
          JSON.stringify({ error: 'Document extraction took too long (>10 seconds). Please try a smaller file or simpler format.' }),
          { status: 408, headers: { 'Content-Type': 'application/json' } }
        );
      }
      throw timeoutError;
    }
    
    text = text.trim();
    if (!text || text.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No extractable text found in document. The file may be encrypted or contain only images.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ text }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Unsupported') || message.includes('too large') ? 400 : 500;
    
    console.error('Extract text error:', message);
    
    return new Response(
      JSON.stringify({ error: message }),
      { status, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
