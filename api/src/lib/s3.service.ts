import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from './config/env.config';

@Injectable()
export class S3Service {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.bucket = env.AWS_S3_BUCKET!;
  }

  async getPresignedUploadUrl(key: string, contentType: string, expiresIn = 300) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    const url = await getSignedUrl(this.client, command, { expiresIn });
    return { url, key };
  }

  async getPresignedDownloadUrl(key: string, expiresIn = 3600) {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  async deleteObject(key: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  getPublicUrl(key: string) {
    if (env.AWS_CLOUDFRONT_URL) return `${env.AWS_CLOUDFRONT_URL}/${key}`;
    return `https://${this.bucket}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
  }

  buildDocumentKey(tenantId: string, studentId: string, category: string, filename: string, version = 1) {
    return `documents/${tenantId}/${studentId}/${category}/${filename}-v${version}`;
  }

  buildKycKey(tenantId: string, docType: string, uuid: string) {
    return `kyc/${tenantId}/${docType}/${uuid}.pdf`;
  }

  buildProposalKey(tenantId: string, studentId: string, uuid: string) {
    return `proposals/${tenantId}/${studentId}/${uuid}.pdf`;
  }
}
