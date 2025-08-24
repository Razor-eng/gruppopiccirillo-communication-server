import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, Matches } from 'class-validator';
import { Channel, Status } from '@prisma/client';

export class CreateConversationDto {
  @ApiProperty({
    description: 'Customer ID (24-character MongoDB ObjectID)',
    example: '66c9e1f2b3a4c5d6e7f89012',
  })
  @IsString()
  @Matches(/^[0-9a-fA-F]{24}$/, {
    message: 'customer_id must be a valid 24-character MongoDB ObjectID',
  })
  customer_id: string;

  @ApiProperty({
    description: 'Advisor ID (24-character MongoDB ObjectID)',
    example: '66c9e1f2b3a4c5d6e7f89013',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9a-fA-F]{24}$/, {
    message: 'advisor_id must be a valid 24-character MongoDB ObjectID',
  })
  advisor_id?: string;

  @ApiProperty({
    description: 'Communication channel',
    enum: Channel,
    example: Channel.watsonx,
  })
  @IsEnum(Channel)
  channel: Channel;

  @ApiProperty({ description: 'Session ID', example: 'sess_789012' })
  @IsString()
  session_id: string;

  @ApiProperty({
    description: 'Conversation status',
    enum: Status,
    example: Status.active,
  })
  @IsEnum(Status)
  status: Status;
}
