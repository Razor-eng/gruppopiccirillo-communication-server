import { ApiProperty } from '@nestjs/swagger';
import { Direction, ActiveStatus, AttachType } from '../../types/enums';

class AttachmentResponseDto {
  @ApiProperty({ enum: AttachType, description: 'Attachment type' })
  type: AttachType;

  @ApiProperty({ description: 'Attachment URL' })
  url: string;

  @ApiProperty({ description: 'MIME type', required: false })
  mime_type?: string;

  @ApiProperty({ enum: ActiveStatus, description: 'Attachment status' })
  status: ActiveStatus;
}

export class MessageResponseDto {
  @ApiProperty({ description: 'Unique message ID' })
  id: string;

  @ApiProperty({ description: 'Conversation ID' })
  conversation_id: string;

  @ApiProperty({ description: 'Message content', required: false })
  content?: string;

  @ApiProperty({ enum: Direction, description: 'Message direction' })
  direction: Direction;

  @ApiProperty({ description: 'Timestamp' })
  timestamp: Date;

  @ApiProperty({ enum: ActiveStatus, description: 'Message status' })
  status: ActiveStatus;

  @ApiProperty({ description: 'Attachment ID', required: false })
  attachment_id?: string;

  @ApiProperty({
    type: () => AttachmentResponseDto,
    description: 'Attachment',
    required: false,
  })
  attachment?: AttachmentResponseDto;
}
