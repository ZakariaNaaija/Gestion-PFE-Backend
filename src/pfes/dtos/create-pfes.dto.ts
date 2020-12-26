import { IsAlpha, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
class CreatePfesDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  public entreprise: string;

  //@IsString()
  @ApiProperty()
  public filepath: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  public titre: string;


  @IsNotEmpty()
  @IsAlpha()
  @ApiProperty()
  public nomEncadrantEntreprise: string;
  @IsNotEmpty()
  @IsAlpha()
  @ApiProperty()
  public description: string;
}

export default CreatePfesDto;
