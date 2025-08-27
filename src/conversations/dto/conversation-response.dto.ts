import { ApiProperty } from '@nestjs/swagger';
import { Status, ChannelName, SessionStatus } from '../../types/enums';
import { MessageResponseDto } from '../../messages/dto/message-response.dto';

class CustomerResponseDto {
  @ApiProperty({ description: 'Customer ID' })
  id: string;

  @ApiProperty({ description: 'Customer name', required: false })
  name?: string;

  @ApiProperty({ description: 'Customer email', required: false })
  email?: string;

  @ApiProperty({ description: 'Customer phone', required: false })
  phone?: string;
}

class AdvisorResponseDto {
  @ApiProperty({ description: 'Advisor ID' })
  id: string;

  @ApiProperty({ description: 'Advisor name', required: false })
  name?: string;

  @ApiProperty({ description: 'Advisor email', required: false })
  email?: string;

  @ApiProperty({ description: 'Advisor phone', required: false })
  phone?: string;
}

class ChannelResponseDto {
  @ApiProperty({ description: 'Channel ID' })
  id: string;

  @ApiProperty({ enum: ChannelName, description: 'Channel name' })
  name: ChannelName;
}

class SessionResponseDto {
  @ApiProperty({ description: 'Session ID' })
  id: string;

  @ApiProperty({ enum: SessionStatus, description: 'Session status' })
  status: SessionStatus;
}

export class ConversationResponseDto {
  @ApiProperty({ description: 'Unique conversation ID' })
  id: string;

  @ApiProperty({
    type: CustomerResponseDto,
    description: 'Customer information',
  })
  customer: CustomerResponseDto;

  @ApiProperty({
    type: AdvisorResponseDto,
    description: 'Advisor information',
    required: false,
  })
  advisor?: AdvisorResponseDto;

  @ApiProperty({ type: ChannelResponseDto, description: 'Channel information' })
  channel: ChannelResponseDto;

  @ApiProperty({ type: SessionResponseDto, description: 'Session information' })
  session: SessionResponseDto;

  @ApiProperty({ description: 'Created by user ID', required: false })
  created_by?: string;

  @ApiProperty({ description: 'Updated by user ID', required: false })
  updated_by?: string;

  @ApiProperty({ description: 'Created by client', required: false })
  created_by_client?: string;

  @ApiProperty({ description: 'Updated by client', required: false })
  updated_by_client?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: Date;

  @ApiProperty({ enum: Status, description: 'Conversation status' })
  status: Status;

  @ApiProperty({
    type: [MessageResponseDto],
    description: 'Linked messages',
    required: false,
  })
  messages?: MessageResponseDto[];
}
