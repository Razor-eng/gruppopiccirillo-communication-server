import { Test, TestingModule } from '@nestjs/testing';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Channel } from '@prisma/client';

const mockMessagesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getMessagesByConversation: jest.fn(),
};

describe('MessagesController', () => {
  let controller: MessagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [
        { provide: MessagesService, useValue: mockMessagesService },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    controller = module.get<MessagesController>(MessagesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a message', async () => {
      const dto: CreateMessageDto = {
        conversation_id: 'conv123',
        channel: Channel.watsonx,
        type: 'text',
        direction: 'incoming',
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
    });
  });

  describe('findOne', () => {
    it('should return one message', async () => {
      const id = 'msg123';
      const expectedResult = { id };
      mockMessagesService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);
      expect(result).toEqual(expectedResult);
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
    });
  });

  describe('remove', () => {
    it('should remove a message', async () => {
      const id = 'msg123';
      const expectedResult = { id };
      mockMessagesService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(id);
      expect(result).toEqual(expectedResult);
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
