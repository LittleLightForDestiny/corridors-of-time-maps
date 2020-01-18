import { IsNotEmpty, Length } from 'class-validator';
export class CreateMapPieceDto {
    @IsNotEmpty()
    @Length(1)
    center:string;

    @IsNotEmpty()
    @Length(6)
    walls:string;

    @IsNotEmpty()
    @Length(6)
    sides:string[];

    evidenceUrl:string;
    
    membershipId?:string;
}