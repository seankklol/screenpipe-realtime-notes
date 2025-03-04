import { MeetingNotes } from '@/lib/llm/notes-generator';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

/**
 * Formats meeting notes as Markdown
 */
export function formatNotesAsMarkdown(notes: MeetingNotes): string {
  let markdown = `# ${notes.title}\n`;
  markdown += `Date: ${notes.date}\n\n`;
  
  // Executive Summary
  markdown += `## Executive Summary\n\n${notes.summary}\n\n`;
  
  // Topics
  if (notes.topics && notes.topics.length > 0) {
    markdown += `## Topics\n\n`;
    notes.topics.forEach(topic => {
      markdown += `### ${topic.name}\n\n`;
      markdown += `${topic.content}\n\n`;
    });
  }
  
  // Action Items
  if (notes.actionItems && notes.actionItems.length > 0) {
    markdown += `## Action Items\n\n`;
    notes.actionItems.forEach((item, index) => {
      markdown += `${index + 1}. **${item.action}** - Assigned to: ${item.assignee}`;
      if (item.dueDate) {
        markdown += ` (Due: ${item.dueDate})`;
      }
      markdown += '\n';
    });
    markdown += '\n';
  }
  
  // Use the full content if it exists
  if (notes.fullContent && notes.fullContent.trim() !== '') {
    markdown += `## Full Meeting Notes\n\n${notes.fullContent}\n`;
  }
  
  return markdown;
}

/**
 * Formats meeting notes as plain text
 */
export function formatNotesAsText(notes: MeetingNotes): string {
  let text = `${notes.title}\n`;
  text += `Date: ${notes.date}\n\n`;
  
  // Executive Summary
  text += `EXECUTIVE SUMMARY\n\n${notes.summary}\n\n`;
  
  // Topics
  if (notes.topics && notes.topics.length > 0) {
    text += `TOPICS\n\n`;
    notes.topics.forEach(topic => {
      text += `${topic.name}\n\n`;
      text += `${topic.content}\n\n`;
    });
  }
  
  // Action Items
  if (notes.actionItems && notes.actionItems.length > 0) {
    text += `ACTION ITEMS\n\n`;
    notes.actionItems.forEach((item, index) => {
      text += `${index + 1}. ${item.action} - Assigned to: ${item.assignee}`;
      if (item.dueDate) {
        text += ` (Due: ${item.dueDate})`;
      }
      text += '\n';
    });
    text += '\n';
  }
  
  // Full content
  if (notes.fullContent && notes.fullContent.trim() !== '') {
    text += `FULL MEETING NOTES\n\n${notes.fullContent}\n`;
  }
  
  return text;
}

/**
 * Exports meeting notes as PDF
 */
export function exportNotesAsPDF(notes: MeetingNotes): void {
  const filename = `${notes.title.replace(/\s+/g, '_')}_${notes.date}.pdf`;
  
  // Create new jsPDF instance
  const doc = new jsPDF();
  
  // Set title
  doc.setFontSize(24);
  doc.text(notes.title, 20, 20);
  
  // Set date
  doc.setFontSize(12);
  doc.text(`Date: ${notes.date}`, 20, 30);
  
  // Executive Summary
  doc.setFontSize(16);
  doc.text('Executive Summary', 20, 40);
  
  doc.setFontSize(12);
  const summaryLines = doc.splitTextToSize(notes.summary, 170);
  doc.text(summaryLines, 20, 50);
  
  let yPosition = 50 + (summaryLines.length * 7);
  
  // Topics
  if (notes.topics && notes.topics.length > 0) {
    doc.setFontSize(16);
    doc.text('Topics', 20, yPosition += 10);
    
    doc.setFontSize(12);
    
    notes.topics.forEach(topic => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.text(topic.name, 20, yPosition += 10);
      
      doc.setFontSize(12);
      const topicLines = doc.splitTextToSize(topic.content, 170);
      doc.text(topicLines, 20, yPosition += 7);
      
      yPosition += (topicLines.length * 7) + 5;
    });
  }
  
  // Action Items
  if (notes.actionItems && notes.actionItems.length > 0) {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.text('Action Items', 20, yPosition += 10);
    
    doc.setFontSize(12);
    
    notes.actionItems.forEach((item, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      let actionText = `${index + 1}. ${item.action} - Assigned to: ${item.assignee}`;
      if (item.dueDate) {
        actionText += ` (Due: ${item.dueDate})`;
      }
      
      const actionLines = doc.splitTextToSize(actionText, 170);
      doc.text(actionLines, 20, yPosition += 7);
      
      yPosition += (actionLines.length * 7) + 2;
    });
  }
  
  // Save the PDF
  doc.save(filename);
}

/**
 * Exports meeting notes as Markdown
 */
export function exportNotesAsMarkdown(notes: MeetingNotes): void {
  const markdown = formatNotesAsMarkdown(notes);
  const filename = `${notes.title.replace(/\s+/g, '_')}_${notes.date}.md`;
  
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  saveAs(blob, filename);
}

/**
 * Exports meeting notes as plain text
 */
export function exportNotesAsText(notes: MeetingNotes): void {
  const text = formatNotesAsText(notes);
  const filename = `${notes.title.replace(/\s+/g, '_')}_${notes.date}.txt`;
  
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, filename);
}

/**
 * Email the meeting notes
 * Note: This is a client-side only implementation that opens email client
 */
export function emailNotes(notes: MeetingNotes): void {
  const subject = encodeURIComponent(`Meeting Notes: ${notes.title} (${notes.date})`);
  const body = encodeURIComponent(formatNotesAsText(notes));
  
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
} 