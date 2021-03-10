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
import { BadRequestException } from '@nestjs/common';
import { DATE_FORMAT } from 'src/common/constant';
import { Gender } from '../entity/subscription.interface';

export class CreateSubscriptionDto {
  // TODO capire se ritornare tutto il json o solo l'id

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  firstName?: string;

  @ApiProperty({ required: false })
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
