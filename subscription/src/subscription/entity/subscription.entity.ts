import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Gender } from '../dto/subscription.dto';

@Entity()
// Create unique index formed by 'email' and 'newsletterCampaign'
@Index(['email', 'newsletterCampaign'], { unique: true })
export class Subscription extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column('varchar', { nullable: false })
  @Index()
  email: string;

  @ApiProperty()
  @Column('varchar', { nullable: true })
  firstName?: string;

  @ApiProperty()
  @Column('int', { nullable: true })
  gender?: Gender;

  @ApiProperty()
  @Column('date')
  birth: Date;

  // true if consent false otherwise
  @ApiProperty()
  @Column('bool', { nullable: false })
  consent: boolean;

  // ! TODO how to handle fk on pattner database per service ?
  @ApiProperty()
  @Column('int')
  @Index()
  newsletterCampaign: number;
}
