import { IsNotEmpty, IsString } from 'class-validator';

export class ClubDto {
  readonly id: string;

  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsNotEmpty()
  readonly foundation_date: Date;

  @IsString()
  @IsNotEmpty()
  readonly image_url: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;
}
