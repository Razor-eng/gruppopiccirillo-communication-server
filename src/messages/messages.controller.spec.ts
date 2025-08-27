import { Test, TestingModule } from '@nestjs/testing';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Direction, ActiveStatus } from '../types/enums';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

describe('MessagesController', () => {
  let controller: MessagesController;
  let mockMessagesService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    mockMessagesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(), // Import ConfigModule to provide ConfigService
      ],
      controllers: [MessagesController],
      providers: [
        {
          provide: MessagesService,
          useValue: mockMessagesService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'API_KEY') return 'test-api-key';
              return null;
            }),
          },
        },
        ApiKeyGuard, // Include ApiKeyGuard explicitly
      ],
    }).compile();

    controller = module.get<MessagesController>(MessagesController);
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
      expect(mockMessagesService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all messages', async () => {
      const expectedResult = [{ id: 'msg1' }, { id: 'msg2' }];
      mockMessagesService.findAll.mockResolvedValue(expectedResult);
      const result = await controller.findAll(undefined, 1, 10);
      expect(mockMessagesService.findAll).toHaveBeenCalledWith(undefined, {
        skip: 0,
        take: 10,
      });
      expect(result).toEqual(expectedResult);
    });

    it('should return messages filtered by conversation', async () => {
      const conversationId = '507f1f77bcf86cd799439015';
      const expectedResult = [{ id: 'msg1' }];
      mockMessagesService.findAll.mockResolvedValue(expectedResult);
      const result = await controller.findAll(conversationId, 1, 10);
      expect(mockMessagesService.findAll).toHaveBeenCalledWith(conversationId, {
        skip: 0,
        take: 10,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a message by ID', async () => {
      const id = '507f1f77bcf86cd799439016';
      const expectedResult = { id };
      mockMessagesService.findOne.mockResolvedValue(expectedResult);
      const result = await controller.findOne(id);
      expect(mockMessagesService.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a message', async () => {
      const id = '507f1f77bcf86cd799439016';
      const dto: UpdateMessageDto = { content: 'Updated' };
      const expectedResult = { id, content: 'Updated' };
      mockMessagesService.update.mockResolvedValue(expectedResult);
      const result = await controller.update(id, dto);
      expect(mockMessagesService.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should soft delete a message', async () => {
      const id = '507f1f77bcf86cd799439016';
      const expectedResult = { id, status: ActiveStatus.inactive };
      mockMessagesService.remove.mockResolvedValue(expectedResult);
      const result = await controller.remove(id);
      expect(mockMessagesService.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });
});
