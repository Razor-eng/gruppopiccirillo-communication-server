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
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';

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
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiBody({ type: CreateConversationDto })
  create(@Body() body: CreateConversationDto) {
    return this.conversationsService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all conversations' })
  @ApiResponse({ status: 200, description: 'List of conversations' })
  findAll() {
    return this.conversationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a conversation by ID' })
  @ApiResponse({ status: 200, description: 'Conversation found' })
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
  })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  @ApiBadRequestResponse({ description: 'Invalid ID format or input data' })
  @ApiParam({ name: 'id', description: 'Conversation ID', type: String })
  @ApiBody({ type: UpdateConversationDto })
  update(@Param('id') id: string, @Body() body: UpdateConversationDto) {
    return this.conversationsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a conversation' })
  @ApiResponse({
    status: 200,
    description: 'Conversation deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  @ApiBadRequestResponse({ description: 'Invalid ID format' })
  @ApiParam({ name: 'id', description: 'Conversation ID', type: String })
  remove(@Param('id') id: string) {
    return this.conversationsService.remove(id);
  }
}
