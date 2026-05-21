'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { proposals as proposalsApi, students } from '@/lib/api';
import { Plus, Sparkles, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ProposalsPage() {
  const qc = useQueryClient();
  const [showGenerate, setShowGenerate] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');

  const { data: proposalList, isLoading } = useQuery({
    queryKey: ['proposals'],
    queryFn: () => proposalsApi.list(),
  });

  const { data: studentList } = useQuery({
    queryKey: ['students-for-proposal'],
    queryFn: () => students.list({ pageSize: '100' }),
    enabled: showGenerate,
  });

  const generateMutation = useMutation({
    mutationFn: (studentId: string) => proposalsApi.generate(studentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposals'] });
      setShowGenerate(false);
      setSelectedStudent('');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Proposals</h1>
          <p className="text-text-muted text-sm mt-1">AI-generated university matching proposals</p>
        </div>
        <button onClick={() => setShowGenerate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium">
          <Sparkles className="w-4 h-4" /> Generate Proposal
        </button>
      </div>

      {/* Generate Modal */}
      {showGenerate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-surface-card border border-surface-border rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-text-primary font-semibold text-lg mb-4">Generate AI Proposal</h2>
            <p className="text-text-muted text-sm mb-4">Select a student to generate a university matching proposal using AI.</p>
            <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
              className="w-full px-3 py-2.5 bg-surface border border-surface-border rounded-lg text-text-primary text-sm mb-4 focus:outline-none focus:border-brand-500">
              <option value="">Select student...</option>
              {studentList?.data.map(s => (
                <option key={s.id} value={s.id}>{s.user.name}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setShowGenerate(false)}
                className="flex-1 py-2 border border-surface-border text-text-secondary rounded-lg text-sm hover:bg-surface-card2">Cancel</button>
              <button onClick={() => selectedStudent && generateMutation.mutate(selectedStudent)}
                disabled={!selectedStudent || generateMutation.isPending}
                className="flex-1 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium disabled:opacity-60">
                {generateMutation.isPending ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proposals List */}
      {isLoading ? <div className="text-text-muted">Loading...</div> : (
        <div className="grid gap-4">
          {(proposalList as any[])?.map((proposal: any) => (
            <div key={proposal.id} className="bg-surface-card border border-surface-border rounded-xl p-5 hover:border-brand-500/30 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-400" />
                    <span className="font-medium text-text-primary">{proposal.student?.user?.name ?? 'Unknown Student'}</span>
                  </div>
                  <p className="text-text-muted text-xs mt-1">
                    {(proposal.matchedUniversities as any[])?.length ?? 0} universities matched ·{' '}
                    {proposal.targetCountries?.join(', ')} · {proposal.targetIntake ?? 'Any intake'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-text-muted text-xs">{formatDate(proposal.createdAt)}</p>
                  {proposal.pdfS3Key && (
                    <span className="text-xs text-status-success mt-1 block">PDF ready</span>
                  )}
                </div>
              </div>
              {proposal.sopContent && (
                <div className="mt-3 pt-3 border-t border-surface-border">
                  <span className="text-xs text-brand-400">SOP draft available · v{proposal.sopVersion}</span>
                </div>
              )}
            </div>
          ))}
          {!proposalList?.length && (
            <div className="text-center py-16 text-text-muted">
              <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p>No proposals yet. Generate your first AI proposal.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
