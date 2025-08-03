import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssignmentService } from './assignment.service';
import { AssignmentController } from './assignment.controller';
import { Assignment, AssignmentSchema } from 'src/schemas/assignment.schema';
import { Site, SiteSchema } from 'src/schemas/sites.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Assignment.name, schema: AssignmentSchema },
      { name: User.name, schema: UserSchema },
      { name: Site.name, schema: SiteSchema },
    ]),
          forwardRef(() => UsersModule), 

  ],
  controllers: [AssignmentController],
  providers: [AssignmentService],
  exports: [AssignmentService, MongooseModule],
})
export class AssignmentModule {}
