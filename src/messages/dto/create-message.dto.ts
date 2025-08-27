import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Direction, AttachType } from '../../types/enums';

class AttachmentDto {
  @ApiProperty({ enum: AttachType, description: 'Attachment type' })
  @IsEnum(AttachType)
  type: AttachType;

  @ApiProperty({ description: 'Attachment URL' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'MIME type', required: false })
  @IsString()
  @IsOptional()
  mime_type?: string;
}

export class CreateMessageDto {
  @ApiProperty({ description: 'Conversation ID (MongoDB ObjectID)' })
  @IsString()
  conversation_id: string;

  @ApiProperty({ description: 'Message content', required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ enum: Direction, description: 'Message direction' })
  @IsEnum(Direction)
  direction: Direction;

  @ApiProperty({
    type: () => AttachmentDto,
    description: 'Attachment (only one per message)',
    required: false,
  })
  @ValidateNested()
  @Type(() => AttachmentDto)
  @IsOptional()
  attachment?: AttachmentDto;
}
