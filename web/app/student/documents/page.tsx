'use client';

import { PageBody, PageHeader } from '@/components/ui/portal-ui';
import { StudentDocumentsPanel } from '@/components/student/student-documents-panel';

export default function StudentDocumentsPage() {
  return (
    <PageBody>
      <PageHeader
        title="My documents"
        subtitle="Upload each document under the correct category. Your counselor will review and verify them."
      />
      <StudentDocumentsPanel />
    </PageBody>
  );
}
