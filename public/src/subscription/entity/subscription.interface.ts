import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

// TODO move to another file
export enum Gender {
  MALE = 1,
  FEMALE = 2,
  NONE = 3,
}

export class Subscription {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  gender?: Gender;

  @ApiProperty()
  birth: Date;

  @ApiProperty()
  consent: boolean;

  @ApiProperty()
  newsletterCampaign: number;
}
