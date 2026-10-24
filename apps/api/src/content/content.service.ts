import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content, ContentDocument } from './schemas/content.schema';

@Injectable()
export class ContentService {
  constructor(@InjectModel(Content.name) private contentModel: Model<ContentDocument>) {}

  async findByKey(key: string): Promise<ContentDocument | null> {
    return this.contentModel.findOne({ key, isPublished: true }).exec();
  }

  async findByType(type: string): Promise<ContentDocument[]> {
    return this.contentModel.find({ type, isPublished: true }).exec();
  }

  async findAll(): Promise<ContentDocument[]> {
    return this.contentModel.find().exec();
  }

  async upsert(key: string, data: Partial<Content>, userId?: string): Promise<ContentDocument> {
    return this.contentModel
      .findOneAndUpdate(
        { key },
        { ...data, key, updatedBy: userId, publishedAt: data.isPublished ? new Date() : undefined },
        { new: true, upsert: true }
      )
      .exec();
  }
}
