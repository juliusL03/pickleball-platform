import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

export const ALLOWED_PERMISSIONS = [
  'bookings.read',
  'bookings.manage',
  'schedule.manage',
  'requests.manage',
  'payments.read',
  'payments.verify',
  'payments.refund',
  'customers.read',
  'courts.manage',
  'content.manage',
  'venue.manage',
  'messages.read',
  'messages.reply',
  'staff.manage',
  'audit.read',
  'settings.manage',
];

export const OWNER_ONLY_PERMISSIONS = [
  'payments.refund',
  'staff.manage',
  'audit.read',
  'settings.manage',
];

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async create(userData: Partial<User>): Promise<UserDocument> {
    const user = new this.userModel(userData);
    return user.save();
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { lastLoginAt: new Date() }).exec();
  }

  async findStaff(): Promise<UserDocument[]> {
    return this.userModel
      .find({ role: { $in: ['staff', 'owner'] } })
      .sort({ createdAt: 1 })
      .exec();
  }

  async findCustomers(
    filter: { search?: string; status?: string } = {},
    limit = 50,
    offset = 0,
  ): Promise<{ items: UserDocument[]; total: number }> {
    const query: any = { role: 'customer' };
    if (filter.status) {
      query.status = filter.status;
    }
    if (filter.search) {
      const search = filter.search.trim();
      if (search) {
        query.$or = [
          { email: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
        ];
      }
    }
    const [items, total] = await Promise.all([
      this.userModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(query).exec(),
    ]);
    return { items, total };
  }

  async findCustomerById(id: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ _id: id, role: 'customer' }).exec();
  }

  async createStaff(
    input: {
      email: string;
      firstName: string;
      lastName: string;
      phone?: string;
      permissions?: string[];
      password?: string;
      passwordHash?: string;
    },
    defaultPasswordHash?: string,
  ): Promise<UserDocument> {
    const permissions = (input.permissions || []).filter((p) =>
      ALLOWED_PERMISSIONS.includes(p),
    );
    const filtered = permissions.filter((p) => !OWNER_ONLY_PERMISSIONS.includes(p));
    let passwordHash = defaultPasswordHash || '!';
    if (input.passwordHash) {
      passwordHash = input.passwordHash;
    }
    const user = new this.userModel({
      email: input.email.toLowerCase(),
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      role: 'staff',
      status: 'active',
      permissions: filtered,
      passwordHash,
      emailVerified: false,
    });
    return user.save();
  }

  async updateStaff(
    id: string,
    input: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      status?: string;
      permissions?: string[];
      password?: string;
      passwordHash?: string;
    },
    actorId: string,
  ): Promise<UserDocument | null> {
    const user = await this.userModel.findById(id);
    if (!user) {
      return null;
    }
    if (user.role === 'owner') {
      throw new Error('Cannot modify owner account');
    }
    if (user.role !== 'staff') {
      throw new Error('Can only update staff accounts');
    }

    const updates: any = {};
    if (input.firstName !== undefined) updates.firstName = input.firstName;
    if (input.lastName !== undefined) updates.lastName = input.lastName;
    if (input.phone !== undefined) updates.phone = input.phone;
    if (input.status !== undefined) updates.status = input.status;
    if (input.passwordHash !== undefined) updates.passwordHash = input.passwordHash;
    if (input.permissions !== undefined) {
      const filtered = (input.permissions || [])
        .filter((p) => ALLOWED_PERMISSIONS.includes(p))
        .filter((p) => !OWNER_ONLY_PERMISSIONS.includes(p));
      updates.permissions = filtered;
    }
    return this.userModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  }

  async countActiveOwners(): Promise<number> {
    return this.userModel.countDocuments({ role: 'owner', status: 'active' }).exec();
  }
}

