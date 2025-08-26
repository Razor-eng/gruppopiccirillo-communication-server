import { ApiProperty } from '@nestjs/swagger';
import {
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Status, SessionStatus } from 'src/types/enums';

// ===== Session DTO =====
class SessionDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439014',
    description: 'Session ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({
    enum: SessionStatus,
    example: SessionStatus.closed,
    description: 'Session status',
    required: false,
  })
  @IsEnum(SessionStatus)
  @IsOptional()
  status?: SessionStatus;
}

// ===== Update Conversation DTO =====
export class UpdateConversationDto {
  @ApiProperty({
    enum: Status,
    example: Status.active,
    description: 'Conversation status',
    required: false,
  })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiProperty({
    type: SessionDto,
    description: 'Session information',
    required: false,
    example: {
      id: '507f1f77bcf86cd799439014',
      status: SessionStatus.closed,
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => SessionDto)
  @IsOptional()
  session?: SessionDto;

  @ApiProperty({
    example: 'user_456',
    description: 'Updated by user ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  updated_by?: string;

  @ApiProperty({
    example: 'external_system',
    description: 'Updated by client',
    required: false,
  })
  @IsString()
  @IsOptional()
  updated_by_client?: string;
}

// ===== Example Request =====
export class UpdateConversationExample {
  @ApiProperty({
    example: {
      status: Status.active,
      session: {
        id: '507f1f77bcf86cd799439014',
        status: SessionStatus.closed,
      },
      updated_by: 'user_456',
      updated_by_client: 'external_system',
    },
  })
  body: UpdateConversationDto;
}
