import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import * as moment from 'moment';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { DATE_FORMAT } from 'src/common/constant';
import { BadRequestException } from '@nestjs/common';

// TODO move to another file
export enum Gender {
  MALE = 1,
  FEMALE = 2,
  NONE = 3,
}

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  firstName?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsNotEmpty()
  @ApiProperty()
  @IsDate()
  @Transform(value => {
    const date: string = value.value;
    if (!moment(date, DATE_FORMAT, true).isValid()) {
      throw new BadRequestException('Invalid date Format');
    }
    return moment(date, DATE_FORMAT, true).toDate();
  })
  birth: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  @Transform(data => !!data.value)
  consent: boolean;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  @Transform(data => +data.value)
  newsletterCampaign: number;
}
