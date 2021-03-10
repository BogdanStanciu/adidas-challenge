import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import * as moment from 'moment';
import { IsDate, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/pagination.dto';
import { Gender } from './subscription.dto';
import { DATE_FORMAT } from 'src/common/constant';
import { BadRequestException } from '@nestjs/common';

@Expose()
export class FilterDto extends PaginationDto {
  @ApiProperty()
  @IsOptional()
  @IsEnum(Gender)
  @Transform(data => +data.value)
  gender?: Gender;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  @Transform(value => {
    const date: string = value.value;
    if (!moment(date, DATE_FORMAT, true).isValid() && !date) {
      throw new BadRequestException('Invalid date Format');
    }
    return moment(date, DATE_FORMAT, true).toDate();
  })
  birth?: Date;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  @Transform(data => +data.value)
  newsletterCampaign?: number;
}
