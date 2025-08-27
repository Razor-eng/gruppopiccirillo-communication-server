import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiBody,
  ApiSecurity,
} from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@ApiTags('conversations')
@ApiSecurity('apiKey')
@Controller('conversations')
@UseGuards(ApiKeyGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiResponse({
    status: 201,
    description: 'Conversation created successfully',
    type: ConversationResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiBody({ type: CreateConversationDto })
  create(@Body() body: CreateConversationDto) {
    return this.conversationsService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active conversations' })
  @ApiResponse({
    status: 200,
    description: 'List of conversations',
    type: [ConversationResponseDto],
  })
  findAll() {
    return this.conversationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a conversation by ID' })
  @ApiResponse({
    status: 200,
    description: 'Conversation found',
    type: ConversationResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  @ApiBadRequestResponse({ description: 'Invalid ID format' })
  @ApiParam({ name: 'id', description: 'Conversation ID', type: String })
  findOne(@Param('id') id: string) {
    return this.conversationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a conversation' })
  @ApiResponse({
    status: 200,
    description: 'Conversation updated successfully',
    type: ConversationResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  @ApiBadRequestResponse({ description: 'Invalid ID format or input data' })
  @ApiParam({ name: 'id', description: 'Conversation ID', type: String })
  @ApiBody({ type: UpdateConversationDto })
  update(@Param('id') id: string, @Body() body: UpdateConversationDto) {
    return this.conversationsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a conversation (set to inactive)' })
  @ApiResponse({
    status: 200,
    description: 'Conversation soft deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  @ApiBadRequestResponse({ description: 'Invalid ID format' })
  @ApiParam({ name: 'id', description: 'Conversation ID', type: String })
  remove(@Param('id') id: string) {
    return this.conversationsService.remove(id);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive a conversation' })
  @ApiResponse({
    status: 200,
    description: 'Conversation archived successfully',
  })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  @ApiBadRequestResponse({ description: 'Invalid ID format' })
  @ApiParam({ name: 'id', description: 'Conversation ID', type: String })
  archive(@Param('id') id: string) {
    return this.conversationsService.archive(id);
  }
}
