import { ApiProperty } from '@nestjs/swagger';

// ===== Status Enums =====
export enum Status {
  active = 'active',
  inactive = 'inactive',
  archive = 'archive',
}

export class StatusEnum {
  @ApiProperty({
    enum: Status,
    example: Status.active,
    description: 'Conversation status',
  })
  status: Status;
}

// ===== Channel Name Enums =====
export enum ChannelName {
  waba = 'waba',
  threecx = 'threecx',
  watsonx = 'watsonx',
}

export class ChannelNameEnum {
  @ApiProperty({
    enum: ChannelName,
    example: ChannelName.waba,
    description: 'Channel platform name',
  })
  name: ChannelName;
}

// ===== Session Status Enums =====
export enum SessionStatus {
  open = 'open',
  closed = 'closed',
}

export class SessionStatusEnum {
  @ApiProperty({
    enum: SessionStatus,
    example: SessionStatus.open,
    description: 'Session status',
  })
  status: SessionStatus;
}

// ===== Direction Enums =====
export enum Direction {
  incoming = 'incoming',
  outgoing = 'outgoing',
}

export class DirectionEnum {
  @ApiProperty({
    enum: Direction,
    example: Direction.incoming,
    description: 'Message direction',
  })
  direction: Direction;
}

// ===== Active Status Enums =====
export enum ActiveStatus {
  active = 'active',
  inactive = 'inactive',
}

export class ActiveStatusEnum {
  @ApiProperty({
    enum: ActiveStatus,
    example: ActiveStatus.active,
    description: 'Active/inactive status',
  })
  status: ActiveStatus;
}

// ===== Attachment Type Enums =====
export enum AttachType {
  image = 'image',
  audio = 'audio',
  video = 'video',
  file = 'file',
}

export class AttachTypeEnum {
  @ApiProperty({
    enum: AttachType,
    example: AttachType.image,
    description: 'Attachment type',
  })
  type: AttachType;
}

// ===== Attachment Interface =====
export interface Attachment {
  id: string;
  status: ActiveStatus;
  type: AttachType;
  url: string;
  mime_type: string | null;
}

export class AttachmentExample {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Attachment ID',
  })
  id: string;

  @ApiProperty({
    enum: ActiveStatus,
    example: ActiveStatus.active,
    description: 'Attachment status',
  })
  status: ActiveStatus;

  @ApiProperty({
    enum: AttachType,
    example: AttachType.image,
    description: 'Attachment type',
  })
  type: AttachType;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'Attachment URL',
  })
  url: string;

  @ApiProperty({
    example: 'image/jpeg',
    description: 'MIME type',
    required: false,
  })
  mime_type?: string;
}
