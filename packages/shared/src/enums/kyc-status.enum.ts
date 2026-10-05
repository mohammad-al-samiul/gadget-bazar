import { z } from 'zod';

export enum KycStatus {
  NOT_SUBMITTED = 'not_submitted',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export const KycStatusSchema = z.nativeEnum(KycStatus);
