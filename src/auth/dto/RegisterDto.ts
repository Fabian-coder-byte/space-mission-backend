import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  // constructor(private _email:string) {
  //   this.email=_email;
  // }
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  username?: string;
}
