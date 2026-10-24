import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import configuration from './config/configuration';
import paymentsConfig from './config/payments.config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { VenueModule } from './venue/venue.module';
import { CourtsModule } from './courts/courts.module';
import { ContentModule } from './content/content.module';
import { BookingsModule } from './bookings/bookings.module';
import { AppResolver } from './app.resolver';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration, paymentsConfig],
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    GraphQLModule.forRoot<YogaDriverConfig>({
      driver: YogaDriver,
      graphiql: true,
      context: ({ req }) => ({ req }),
    }),
    UsersModule,
    AuthModule,
    HealthModule,
    VenueModule,
    CourtsModule,
    ContentModule,
    BookingsModule,
    PaymentsModule,
  ],
  providers: [AppResolver],
})
export class AppModule {}
