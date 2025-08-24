import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Channel } from '@prisma/client';

class AttachmentDto {
  @IsString()
  type: string;

  @IsString()
  url: string;
}

export class CreateMessageDto {
  @IsString()
  conversation_id: string;

  @IsString()
  @IsOptional()
  message_id?: string;

  @IsEnum(Channel)
  channel: Channel;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  type: string;

  @IsString()
  @IsEnum(['incoming', 'outgoing'])
  direction: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}
