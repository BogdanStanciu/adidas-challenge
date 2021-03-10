import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsNumberString, IsOptional } from 'class-validator';

@Expose()
export class PaginationDto {
  @IsOptional()
  @IsNotEmpty()
  @Expose()
  @IsNumberString()
  @ApiProperty({ required: false, description: 'How many elements to skip' })
  skip: number;

  @IsOptional()
  @IsNotEmpty()
  @Expose()
  @IsNumberString()
  @ApiProperty({ required: false, description: 'How many elements to take' })
  take: number;
}
