import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@ApiTags('messages')
@ApiSecurity('apiKey')
@Controller('messages')
@UseGuards(ApiKeyGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new message' })
  @ApiResponse({
    status: 201,
    description: 'Message created successfully',
    type: MessageResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiBody({ type: CreateMessageDto })
  create(@Body() body: CreateMessageDto) {
    return this.messagesService.create(body);
  }

  @Get()
  @ApiOperation({
    summary: 'Get messages (optionally filtered by conversation)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of messages',
    type: [MessageResponseDto],
  })
  @ApiQuery({
    name: 'conversation_id',
    required: false,
    description: 'Optional conversation ID to filter messages',
    type: String,
  })
  findAll(@Query('conversation_id') conversationId?: string) {
    return this.messagesService.findAll(conversationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a message by ID' })
  @ApiResponse({
    status: 200,
    description: 'Message found',
    type: MessageResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Message not found' })
  @ApiBadRequestResponse({ description: 'Invalid ID format' })
  @ApiParam({ name: 'id', description: 'Message ID', type: String })
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a message' })
  @ApiResponse({
    status: 200,
    description: 'Message updated successfully',
    type: MessageResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Message not found' })
  @ApiBadRequestResponse({ description: 'Invalid ID format or input data' })
  @ApiParam({ name: 'id', description: 'Message ID', type: String })
  @ApiBody({ type: UpdateMessageDto })
  update(@Param('id') id: string, @Body() body: UpdateMessageDto) {
    return this.messagesService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a message (set to inactive)' })
  @ApiResponse({
    status: 200,
    description: 'Message soft deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Message not found' })
  @ApiBadRequestResponse({ description: 'Invalid ID format' })
  @ApiParam({ name: 'id', description: 'Message ID', type: String })
  remove(@Param('id') id: string) {
    return this.messagesService.remove(id);
  }

  @Get('conversation/:conversationId')
  @ApiOperation({ summary: 'Get messages by conversation ID' })
  @ApiResponse({
    status: 200,
    description: 'List of messages for conversation',
    type: [MessageResponseDto],
  })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  @ApiBadRequestResponse({ description: 'Invalid ID format' })
  @ApiParam({
    name: 'conversationId',
    description: 'Conversation ID',
    type: String,
  })
  getMessagesByConversation(@Param('conversationId') conversationId: string) {
    return this.messagesService.getMessagesByConversation(conversationId);
  }
}
