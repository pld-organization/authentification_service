import { IsOptional, IsString,IsEnum } from 'class-validator';
import { BloodType } from '../../common/BloodGroup.enum';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export class PatientProfileDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsEnum(BloodType)
  @IsOptional()
  bloodType?: BloodType;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

}