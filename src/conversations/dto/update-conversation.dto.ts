import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Channel, Status } from '@prisma/client';

export class UpdateConversationDto {
  @ApiProperty({
    description: 'Conversation status',
    enum: Status,
    example: Status.closed,
    required: false,
  })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiProperty({
    description: 'Communication channel',
    enum: Channel,
    example: Channel.watsonx,
    required: false,
  })
  @IsEnum(Channel)
  @IsOptional()
  channel?: Channel;
}
