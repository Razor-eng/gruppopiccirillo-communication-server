import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ActiveStatus, AttachType } from '../../types/enums';

class AttachmentDto {
  @ApiProperty({
    enum: AttachType,
    description: 'Attachment type',
    required: false,
  })
  @IsEnum(AttachType)
  @IsOptional()
  type?: AttachType;

  @ApiProperty({ description: 'Attachment URL', required: false })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({ description: 'MIME type', required: false })
  @IsString()
  @IsOptional()
  mime_type?: string;
}

export class UpdateMessageDto {
  @ApiProperty({ description: 'Message content', required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    enum: ActiveStatus,
    description: 'Message status',
    required: false,
  })
  @IsEnum(ActiveStatus)
  @IsOptional()
  status?: ActiveStatus;

  @ApiProperty({
    type: AttachmentDto,
    description: 'Attachment',
    required: false,
  })
  @ValidateNested()
  @Type(() => AttachmentDto)
  @IsOptional()
  attachments?: AttachmentDto;
}
