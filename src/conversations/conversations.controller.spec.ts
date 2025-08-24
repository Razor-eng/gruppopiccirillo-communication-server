import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { Channel, Status } from '@prisma/client';

const mockConversationsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ConversationsController', () => {
  let controller: ConversationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationsController],
      providers: [
        { provide: ConversationsService, useValue: mockConversationsService },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    controller = module.get<ConversationsController>(ConversationsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a conversation', async () => {
      const dto: CreateConversationDto = {
        customer_id: 'cust123',
        channel: Channel.watsonx,
        session_id: 'sess123',
        status: Status.active,
      };
      const expectedResult = { id: 'conv123', ...dto };
      mockConversationsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(dto);
      expect(result).toEqual(expectedResult);
      expect(mockConversationsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all conversations', async () => {
      const expectedResult = [{ id: 'conv1' }];
      mockConversationsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();
      expect(result).toEqual(expectedResult);
      expect(mockConversationsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return one conversation', async () => {
      const id = 'conv123';
      const expectedResult = { id };
      mockConversationsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);
      expect(result).toEqual(expectedResult);
      expect(mockConversationsService.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a conversation', async () => {
      const id = 'conv123';
      const dto: UpdateConversationDto = { status: Status.closed };
      const expectedResult = { id, ...dto };
      mockConversationsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, dto);
      expect(result).toEqual(expectedResult);
      expect(mockConversationsService.update).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('remove', () => {
    it('should remove a conversation', async () => {
      const id = 'conv123';
      const expectedResult = { id };
      mockConversationsService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(id);
      expect(result).toEqual(expectedResult);
      expect(mockConversationsService.remove).toHaveBeenCalledWith(id);
    });
  });
});
