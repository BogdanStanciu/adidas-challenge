import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EmailRequestDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  to: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  text: string;

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
