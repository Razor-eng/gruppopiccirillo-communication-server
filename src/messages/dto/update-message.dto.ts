import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';
import { AttachmentDto } from './create-message.dto';

export class UpdateMessageDto {
  @ApiProperty({
    description: 'Message content',
    example: 'Updated content',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'Attachments',
    type: [AttachmentDto],
    required: false,
  })
  @IsArray()
  @IsOptional()
  attachments?: AttachmentDto[];
}
