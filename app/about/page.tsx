// app/about/page.tsx
import React from 'react';
import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';

// Server-side function to read markdown file
async function getMarkdownContent() {
  const filePath = path.join(process.cwd(), 'app/about/content.md');
  try {
    const markdownContent = fs.readFileSync(filePath, 'utf8');
    return markdownContent;
  } catch (error) {
    console.error('Error reading markdown file:', error);
    return '# About Us\n\nThis is the about page. Content coming soon!';
  }
}

export default async function About() {
  const markdownContent = await getMarkdownContent();
  
  return (
    <div className="prose max-w-none p-8">
      <ReactMarkdown>{markdownContent}</ReactMarkdown>
    </div>
  );
}