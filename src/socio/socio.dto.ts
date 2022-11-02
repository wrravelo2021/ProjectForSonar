import { IsNotEmpty, IsString } from 'class-validator';

export class SocioDto {
  readonly id: string;

  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly email: Date;

  @IsNotEmpty()
  readonly birthday: Date;
}
