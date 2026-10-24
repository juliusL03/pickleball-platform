import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Court, CourtDocument } from './schemas/court.schema';

@Injectable()
export class CourtsService {
  constructor(@InjectModel(Court.name) private courtModel: Model<CourtDocument>) {}

  async findAll(): Promise<CourtDocument[]> {
    return this.courtModel.find({ isActive: true }).sort({ sortOrder: 1 }).exec();
  }

  async findAllIncludingInactive(): Promise<CourtDocument[]> {
    return this.courtModel.find().sort({ sortOrder: 1 }).exec();
  }

  async findById(id: string): Promise<CourtDocument | null> {
    return this.courtModel.findById(id).exec();
  }

  async findBySlug(slug: string): Promise<CourtDocument | null> {
    return this.courtModel.findOne({ slug, isActive: true }).exec();
  }

  async create(data: Partial<Court>): Promise<CourtDocument> {
    const court = new this.courtModel(data);
    return court.save();
  }

  async update(id: string, data: Partial<Court>): Promise<CourtDocument | null> {
    return this.courtModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }
}
