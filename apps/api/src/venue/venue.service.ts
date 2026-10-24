import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Venue, VenueDocument } from './schemas/venue.schema';

@Injectable()
export class VenueService {
  constructor(@InjectModel(Venue.name) private venueModel: Model<VenueDocument>) {}

  async findOne(): Promise<VenueDocument | null> {
    return this.venueModel.findOne().exec();
  }

  async findById(id: string | Types.ObjectId): Promise<VenueDocument | null> {
    return this.venueModel.findById(id).exec();
  }

  async createOrUpdate(data: Partial<Venue>): Promise<VenueDocument> {
    const existing = await this.venueModel.findOne().exec();
    if (existing) {
      return this.venueModel.findByIdAndUpdate(existing._id, data, { new: true }).exec() as Promise<VenueDocument>;
    }
    const venue = new this.venueModel(data);
    return venue.save();
  }
}
