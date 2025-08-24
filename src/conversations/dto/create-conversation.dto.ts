import { Channel, Status } from '@prisma/client';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  customer_id: string;

  @IsOptional()
  @IsString()
  advisor_id?: string;

  @IsEnum(Channel)
  channel: Channel;

  @IsString()
  session_id: string;

  @IsEnum(Status)
  status: Status;
}
