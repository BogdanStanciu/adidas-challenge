import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Confirmation email dto
 */
export class EmailConfirmDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  to: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  text: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  html: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  subject: string;

  @IsEmail()
  @IsOptional()
  @ApiProperty()
  from: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  token: string;
}
