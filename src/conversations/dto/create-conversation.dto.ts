import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  IsEnum,
  IsEmail,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Status, ChannelName, SessionStatus } from '../../types/enums';

// ===== Customer DTO =====
class CustomerDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Customer ID (MongoDB ObjectID)',
  })
  @IsString()
  id: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Customer name',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'john@example.com',
    description: 'Customer email',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: '919999888877',
    description: 'Customer phone number',
  })
  @Matches(/^[0-9]{10,15}$/, {
    message: 'Phone number must be between 10 and 15 digits',
  })
  @IsOptional()
  phone?: string;
}

// ===== Advisor DTO =====
class AdvisorDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439012',
    description: 'Advisor ID (MongoDB ObjectID)',
  })
  @IsString()
  id: string;

  @ApiPropertyOptional({
    example: 'Jane Smith',
    description: 'Advisor name',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'jane@example.com',
    description: 'Advisor email',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: '12025550123',
    description: 'Advisor phone number',
  })
  @Matches(/^[0-9]{10,15}$/, {
    message: 'Phone number must be between 10 and 15 digits',
  })
  @IsOptional()
  phone?: string;
}

// ===== Channel DTO =====
class ChannelDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439013',
    description: 'Channel ID (MongoDB ObjectID)',
  })
  @IsString()
  id: string;

  @ApiProperty({
    enum: ChannelName,
    example: ChannelName.waba,
    description: 'Channel name',
  })
  @IsEnum(ChannelName)
  name: ChannelName;
}

// ===== Session DTO =====
class SessionDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439014',
    description: 'Session ID',
  })
  @IsString()
  id: string;

  @ApiProperty({
    enum: SessionStatus,
    example: SessionStatus.open,
    description: 'Session status',
  })
  @IsEnum(SessionStatus)
  status: SessionStatus;
}

// ===== Main Create DTO =====
export class CreateConversationDto {
  @ApiProperty({
    type: CustomerDto,
    description: 'Customer information',
    example: {
      id: '507f1f77bcf86cd799439011',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '919999888877',
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => CustomerDto)
  customer: CustomerDto;

  @ApiPropertyOptional({
    type: AdvisorDto,
    description: 'Advisor information',
    example: {
      id: '507f1f77bcf86cd799439012',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '12025550123',
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => AdvisorDto)
  @IsOptional()
  advisor?: AdvisorDto;

  @ApiProperty({
    type: ChannelDto,
    description: 'Channel information',
    example: {
      id: '507f1f77bcf86cd799439013',
      name: ChannelName.waba,
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => ChannelDto)
  channel: ChannelDto;

  @ApiProperty({
    type: SessionDto,
    description: 'Session information',
    example: {
      id: '507f1f77bcf86cd799439014',
      status: SessionStatus.open,
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => SessionDto)
  session: SessionDto;

  @ApiPropertyOptional({
    example: 'user_123',
    description: 'Created by user ID',
  })
  @IsString()
  @IsOptional()
  created_by?: string;

  @ApiPropertyOptional({
    example: 'automation_system',
    description: 'Created by client',
  })
  @IsString()
  @IsOptional()
  created_by_client?: string;

  @ApiPropertyOptional({
    enum: Status,
    example: Status.active,
    description: 'Conversation status',
  })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}

// ===== Example Request =====
export class CreateConversationExample {
  @ApiProperty({
    example: {
      customer: {
        id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
      },
      advisor: {
        id: '507f1f77bcf86cd799439012',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1987654321',
      },
      channel: {
        id: '507f1f77bcf86cd799439013',
        name: ChannelName.waba,
      },
      session: {
        id: '507f1f77bcf86cd799439014',
        status: SessionStatus.open,
      },
      created_by: 'user_123',
      created_by_client: 'automation_system',
      status: Status.active,
    },
  })
  body: CreateConversationDto;
}
