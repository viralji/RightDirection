import { students } from '@/lib/api';

export async function uploadStudentDocument(
  category: string,
  file: File,
  parentDocId?: string,
): Promise<{ id: string }> {
  const { uploadUrl, s3Key } = await students.meDocumentsPresign({
    category,
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    fileSize: file.size,
  });

  const isDevMock = uploadUrl.includes('/documents/dev-upload');
  if (!isDevMock) {
    const putRes = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
    });
    if (!putRes.ok) {
      throw new Error(`Upload to storage failed (${putRes.status})`);
    }
  } else {
    await fetch(uploadUrl, { method: 'PUT', body: new Blob() });
  }

  const doc = await students.meDocumentsCreate({
    category,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || 'application/octet-stream',
    s3Key,
    parentDocId,
  });

  return { id: doc.id };
}
