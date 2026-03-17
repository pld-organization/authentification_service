import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '../../common/role.enum';
import { Gender } from '../../users/dto/patient-profile.dto';
import { BloodType } from '../../common/BloodGroup.enum';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role!: Role;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  bloodType?: BloodType;

  @IsString()
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  speciality?: string;

  @IsString()
  @IsOptional()
  establishment?: string;
}