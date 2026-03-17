import{IsString,IsOptional}from 'class-validator';

export class DoctorProfileDto{
    @IsString()
    @IsOptional()
    firstName?:string;

    @IsString()
    @IsOptional()
    lastName?:string;   

    @IsString()
    @IsOptional()
    speciality?:string;

    @IsString()
    @IsOptional()
    establishment?:string;
}