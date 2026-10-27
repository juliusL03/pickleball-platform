import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

export interface CreateAuditLogInput {
  actorId?: string;
  actorRole?: 'customer' | 'staff' | 'owner';
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async log(input: CreateAuditLogInput): Promise<void> {
    try {
      const log = new this.auditLogModel({
        actorId: input.actorId ? new Types.ObjectId(input.actorId) : undefined,
        actorRole: input.actorRole,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        metadata: input.metadata || {},
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });
      await log.save();
    } catch (e) {
      // Never throw from audit logging
    }
  }

  async findAll(
    filter: any = {},
    limit = 50,
    offset = 0,
  ): Promise<{ items: AuditLogDocument[]; total: number }> {
    const query: any = {};
    if (filter.actorId && Types.ObjectId.isValid(filter.actorId)) {
      query.actorId = new Types.ObjectId(filter.actorId);
    }
    if (filter.action) {
      query.action = filter.action;
    }
    if (filter.resourceType) {
      query.resourceType = filter.resourceType;
    }
    if (filter.resourceId) {
      query.resourceId = filter.resourceId;
    }
    if (filter.from || filter.to) {
      query.createdAt = {};
      if (filter.from) {
        query.createdAt.$gte = new Date(filter.from);
      }
      if (filter.to) {
        query.createdAt.$lte = new Date(filter.to);
      }
    }
    const [items, total] = await Promise.all([
      this.auditLogModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .exec(),
      this.auditLogModel.countDocuments(query).exec(),
    ]);
    return { items, total };
  }
}
