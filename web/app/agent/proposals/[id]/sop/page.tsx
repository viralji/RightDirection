'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { proposals } from '@/lib/api';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useRef } from 'react';
import { ArrowLeft, Sparkles, Download } from 'lucide-react';
import Link from 'next/link';

export default function SopEditorPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [sopForm, setSopForm] = useState({ universityName: '', courseName: '', motivation: '', careerGoals: '', tone: 'FORMAL' });

  const { data: proposal } = useQuery({
    queryKey: ['proposal', id],
    queryFn: () => proposals.findOne(id),
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      CharacterCount.configure({ limit: 10000 }),
      Placeholder.configure({ placeholder: 'Your SOP will appear here. Click "Generate with AI" to get started...' }),
    ],
    content: (proposal as any)?.sopContent ?? '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[400px] focus:outline-none text-text-primary text-sm leading-7 p-6',
      },
    },
  });

  const saveMutation = useMutation({
    mutationFn: (content: string) => proposals.updateSop(id, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['proposal', id] }),
  });

  const generateSop = async () => {
    if (!sopForm.universityName || !sopForm.motivation) return;
    setGenerating(true);
    editor?.commands.setContent('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/sop/stream`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          university_name: sopForm.universityName,
          course_name: sopForm.courseName,
          motivation: sopForm.motivation,
          career_goals: sopForm.careerGoals,
          academic_background: (proposal as any)?.student?.educationLevel ?? 'Graduate',
          tone: sopForm.tone,
          stream: true,
        }),
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let content = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const text = line.slice(6);
            if (text === '[DONE]') break;
            content += text;
            editor?.commands.setContent(content);
          }
        }
      }

      saveMutation.mutate(content);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const wordCount = editor?.storage.characterCount.words() ?? 0;

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center gap-3">
        <Link href="/agent/proposals" className="text-text-muted hover:text-text-primary"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-xl font-bold text-text-primary">SOP Editor</h1>
        {proposal && <span className="text-text-muted text-sm">— {(proposal as any).student?.user?.name}</span>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Config Panel */}
        <div className="space-y-3">
          <div className="bg-surface-card border border-surface-border rounded-xl p-4 space-y-3">
            <h2 className="font-semibold text-text-primary text-sm">Generate with AI</h2>
            <input value={sopForm.universityName} onChange={e => setSopForm(p => ({ ...p, universityName: e.target.value }))}
              placeholder="University name *"
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg text-text-primary text-xs focus:outline-none focus:border-brand-500" />
            <input value={sopForm.courseName} onChange={e => setSopForm(p => ({ ...p, courseName: e.target.value }))}
              placeholder="Course name"
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg text-text-primary text-xs focus:outline-none focus:border-brand-500" />
            <textarea value={sopForm.motivation} onChange={e => setSopForm(p => ({ ...p, motivation: e.target.value }))}
              placeholder="Why this university / course? *" rows={3}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg text-text-primary text-xs focus:outline-none focus:border-brand-500 resize-none" />
            <textarea value={sopForm.careerGoals} onChange={e => setSopForm(p => ({ ...p, careerGoals: e.target.value }))}
              placeholder="Career goals after graduation" rows={2}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg text-text-primary text-xs focus:outline-none focus:border-brand-500 resize-none" />
            <select value={sopForm.tone} onChange={e => setSopForm(p => ({ ...p, tone: e.target.value }))}
              className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg text-text-primary text-xs focus:outline-none focus:border-brand-500">
              <option value="FORMAL">Formal</option>
              <option value="SEMI_FORMAL">Semi-Formal</option>
              <option value="NARRATIVE">Narrative</option>
            </select>
            <button onClick={generateSop} disabled={generating || !sopForm.universityName}
              className="w-full flex items-center justify-center gap-2 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium disabled:opacity-60">
              <Sparkles className="w-4 h-4" />
              {generating ? 'Generating...' : 'Generate SOP'}
            </button>
          </div>

          <div className="bg-surface-card border border-surface-border rounded-xl p-4 text-xs text-text-muted space-y-1">
            <div className="flex justify-between"><span>Words</span><span className={wordCount > 1000 ? 'text-status-error' : wordCount > 700 ? 'text-status-success' : 'text-text-muted'}>{wordCount}</span></div>
            <div className="flex justify-between"><span>Target</span><span>800–1000</span></div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => editor && saveMutation.mutate(editor.getText())}
              disabled={saveMutation.isPending}
              className="flex-1 py-2 bg-surface-card border border-surface-border text-text-secondary rounded-lg text-xs hover:bg-surface-card2">
              {saveMutation.isPending ? 'Saving...' : 'Save Draft'}
            </button>
            <button className="flex-1 flex items-center justify-center gap-1 py-2 bg-surface-card border border-surface-border text-text-secondary rounded-lg text-xs hover:bg-surface-card2">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="col-span-2 bg-surface-card border border-surface-border rounded-xl overflow-hidden">
          <div className="flex gap-1 p-2 border-b border-surface-border">
            {['Bold', 'Italic', 'Bullet'].map(cmd => (
              <button key={cmd} onClick={() => {
                if (cmd === 'Bold') editor?.chain().focus().toggleBold().run();
                if (cmd === 'Italic') editor?.chain().focus().toggleItalic().run();
                if (cmd === 'Bullet') editor?.chain().focus().toggleBulletList().run();
              }} className="px-2.5 py-1 text-xs text-text-muted hover:text-text-primary hover:bg-surface-card2 rounded">{cmd}</button>
            ))}
          </div>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
