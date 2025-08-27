import { Test, TestingModule } from '@nestjs/testing';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Direction } from '../types/enums';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

const mockMessagesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getMessagesByConversation: jest.fn(),
};

// Mock the ApiKeyGuard
const mockApiKeyGuard = {
  canActivate: jest.fn(() => true),
};

describe('MessagesController', () => {
  let controller: MessagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [{ provide: MessagesService, useValue: mockMessagesService }],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue(mockApiKeyGuard)
      .compile();

    controller = module.get<MessagesController>(MessagesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a message', async () => {
      const dto: CreateMessageDto = {
        conversation_id: '507f1f77bcf86cd799439015',
        content: 'Hello',
        direction: Direction.incoming,
      };
      const expectedResult = { id: 'msg123', ...dto };
      mockMessagesService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(dto);
      expect(result).toEqual(expectedResult);
      expect(mockMessagesService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all messages', async () => {
      const expectedResult = [{ id: 'msg1' }];
      mockMessagesService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();
      expect(result).toEqual(expectedResult);
      expect(mockMessagesService.findAll).toHaveBeenCalled();
    });

    it('should return messages filtered by conversation', async () => {
      const conversationId = '507f1f77bcf86cd799439015';
      const expectedResult = [{ id: 'msg1' }];
      mockMessagesService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(conversationId);
      expect(result).toEqual(expectedResult);
      expect(mockMessagesService.findAll).toHaveBeenCalledWith(conversationId);
    });
  });

  describe('findOne', () => {
    it('should return one message', async () => {
      const id = 'msg123';
      const expectedResult = { id };
      mockMessagesService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);
      expect(result).toEqual(expectedResult);
      expect(mockMessagesService.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a message', async () => {
      const id = 'msg123';
      const dto: UpdateMessageDto = { content: 'Updated' };
      const expectedResult = { id, ...dto };
      mockMessagesService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, dto);
      expect(result).toEqual(expectedResult);
      expect(mockMessagesService.update).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('remove', () => {
    it('should remove a message', async () => {
      const id = 'msg123';
      const expectedResult = { id };
      mockMessagesService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(id);
      expect(result).toEqual(expectedResult);
      expect(mockMessagesService.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('getMessagesByConversation', () => {
    it('should return messages by conversation ID', async () => {
      const conversationId = 'conv123';
      const expectedResult = [{ id: 'msg1' }];
      mockMessagesService.getMessagesByConversation.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.getMessagesByConversation(conversationId);
      expect(result).toEqual(expectedResult);
      expect(
        mockMessagesService.getMessagesByConversation,
      ).toHaveBeenCalledWith(conversationId);
    });
  });
});
