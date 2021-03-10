import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Gender } from '../entity/subscription.interface';
import { PaginationDto } from './pagination.dto';

/**
 * applicable filters for fetching subscriptions
 */
@Expose()
export class FilterDto extends PaginationDto {
  @ApiProperty()
  @IsOptional()
  @IsEnum(Gender)
  @Transform(data => +data.value)
  gender?: Gender;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  @Transform(data => !!data.value)
  consent?: boolean;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  @Transform(data => +data.value)
  newsletterCampaign?: number;
}
