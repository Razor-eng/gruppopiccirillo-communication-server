import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  Matches,
} from 'class-validator';
import { Channel } from '@prisma/client';

export class AttachmentDto {
  @ApiProperty({ description: 'Attachment type', example: 'image' })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Attachment URL',
    example: 'https://example.com/image.jpg',
  })
  @IsString()
  url: string;
}

export class CreateMessageDto {
  @ApiProperty({
    description: 'Conversation ID (24-character MongoDB ObjectID)',
    example: '66c9e1f2b3a4c5d6e7f89014',
  })
  @IsString()
  @Matches(/^[0-9a-fA-F]{24}$/, {
    message: 'conversation_id must be a valid 24-character MongoDB ObjectID',
  })
  conversation_id: string;

  @ApiProperty({
    description: 'Message ID (24-character MongoDB ObjectID)',
    example: '66c9e1f2b3a4c5d6e7f89015',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9a-fA-F]{24}$/, {
    message: 'message_id must be a valid 24-character MongoDB ObjectID',
  })
  message_id?: string;

  @ApiProperty({
    description: 'Communication channel',
    enum: Channel,
    example: Channel.watsonx,
  })
  @IsEnum(Channel)
  channel: Channel;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello, how can I assist you?',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ description: 'Message type', example: 'text' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Message direction', example: 'incoming' })
  @IsString()
  direction: string;

  @ApiProperty({
    description: 'Attachments',
    type: [AttachmentDto],
    required: false,
    example: [{ type: 'image', url: 'https://example.com/image.jpg' }],
  })
  @IsArray()
  @IsOptional()
  attachments?: AttachmentDto[];
}
