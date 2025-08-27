import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { Status } from '../types/enums';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  private isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  async create(data: CreateConversationDto) {
    // Validate ObjectIDs
    if (!this.isValidObjectId(data.customer.id)) {
      throw new BadRequestException('Invalid customer ID format');
    }

    if (data.advisor && !this.isValidObjectId(data.advisor.id)) {
      throw new BadRequestException('Invalid advisor ID format');
    }

    if (!this.isValidObjectId(data.channel.id)) {
      throw new BadRequestException('Invalid channel ID format');
    }

    if (!this.isValidObjectId(data.session.id)) {
      throw new BadRequestException('Invalid session ID format');
    }

    // Validate that customer has at least one identifier
    if (!data.customer.name && !data.customer.email && !data.customer.phone) {
      throw new BadRequestException(
        'Customer must have at least one identifier (name, email, or phone)',
      );
    }

    // Validate that advisor has at least one identifier if provided
    if (
      data.advisor &&
      !data.advisor.name &&
      !data.advisor.email &&
      !data.advisor.phone
    ) {
      throw new BadRequestException(
        'Advisor must have at least one identifier (name, email, or phone)',
      );
    }

    try {
      // Use upsert for related entities to handle existing records
      const customer = await this.prisma.customer.upsert({
        where: { id: data.customer.id },
        update: {
          name: data.customer.name,
          email: data.customer.email,
          phone: data.customer.phone,
        },
        create: data.customer,
      });

      // Explicitly type the advisor variable
      let advisor: { id: string } | null = null;

      if (data.advisor) {
        const advisorResult = await this.prisma.advisor.upsert({
          where: { id: data.advisor.id },
          update: {
            name: data.advisor.name,
            email: data.advisor.email,
            phone: data.advisor.phone,
          },
          create: data.advisor,
        });
        advisor = advisorResult;
      }

      const channel = await this.prisma.channel.upsert({
        where: { id: data.channel.id },
        update: {
          name: data.channel.name,
        },
        create: data.channel,
      });

      const session = await this.prisma.session.upsert({
        where: { id: data.session.id },
        update: {
          status: data.session.status,
        },
        create: data.session,
      });

      // Create the conversation with relations
      return this.prisma.conversation.create({
        data: {
          customer_id: customer.id,
          advisor_id: advisor?.id,
          channel_id: channel.id,
          session_id: session.id,
          created_by: data.created_by,
          created_by_client: data.created_by_client,
          status: data.status || Status.active,
        },
        include: {
          customer: true,
          advisor: true,
          channel: true,
          session: true,
          messages: {
            include: {
              attachment: true,
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Duplicate entry found');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Foreign key constraint failed');
      }
      throw error;
    }
  }

  async findAll() {
    try {
      return this.prisma.conversation.findMany({
        where: { status: { not: Status.archive } },
        include: {
          customer: true,
          advisor: true,
          channel: true,
          session: true,
          messages: {
            include: {
              attachment: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });
    } catch (error) {
      throw new BadRequestException('Failed to fetch conversations');
    }
  }

  async findOne(id: string) {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid conversation ID format');
    }

    try {
      const conversation = await this.prisma.conversation.findUnique({
        where: { id },
        include: {
          customer: true,
          advisor: true,
          channel: true,
          session: true,
          messages: {
            where: { status: 'active' },
            include: { attachment: true },
            orderBy: { timestamp: 'asc' },
          },
        },
      });

      if (!conversation || conversation.status === Status.archive) {
        throw new NotFoundException(`Conversation with ID "${id}" not found`);
      }

      return conversation;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch conversation');
    }
  }

  async update(id: string, data: UpdateConversationDto) {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid conversation ID format');
    }

    await this.findOne(id); // Verify it exists

    try {
      const updateData: any = {
        status: data.status,
        updated_by: data.updated_by,
        updated_by_client: data.updated_by_client,
        updated_at: new Date(),
      };

      // Handle session update if provided
      if (data.session) {
        // First get current conversation to get session_id
        const current = await this.prisma.conversation.findUnique({
          where: { id },
        });

        if (current) {
          // Update the existing session
          await this.prisma.session.update({
            where: { id: current.session_id },
            data: {
              status: data.session.status,
            },
          });
        }
      }

      return this.prisma.conversation.update({
        where: { id },
        data: updateData,
        include: {
          customer: true,
          advisor: true,
          channel: true,
          session: true,
          messages: {
            where: { status: 'active' },
            include: { attachment: true },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to update conversation');
    }
  }

  async remove(id: string) {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid conversation ID format');
    }

    await this.findOne(id); // Verify it exists

    try {
      return this.prisma.conversation.update({
        where: { id },
        data: {
          status: Status.inactive,
          updated_at: new Date(),
        },
        include: {
          customer: true,
          advisor: true,
          channel: true,
          session: true,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to delete conversation');
    }
  }

  async archive(id: string) {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException('Invalid conversation ID format');
    }

    await this.findOne(id); // Verify it exists

    try {
      return this.prisma.conversation.update({
        where: { id },
        data: {
          status: Status.archive,
          updated_at: new Date(),
        },
        include: {
          customer: true,
          advisor: true,
          channel: true,
          session: true,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to archive conversation');
    }
  }

  // Additional useful methods
  async findByCustomer(customerId: string) {
    if (!this.isValidObjectId(customerId)) {
      throw new BadRequestException('Invalid customer ID format');
    }

    try {
      return this.prisma.conversation.findMany({
        where: {
          customer_id: customerId,
          status: { not: Status.archive },
        },
        include: {
          customer: true,
          advisor: true,
          channel: true,
          session: true,
          messages: {
            include: {
              attachment: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to fetch conversations by customer',
      );
    }
  }

  async findByStatus(status: Status) {
    try {
      return this.prisma.conversation.findMany({
        where: { status },
        include: {
          customer: true,
          advisor: true,
          channel: true,
          session: true,
          messages: {
            include: {
              attachment: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });
    } catch (error) {
      throw new BadRequestException('Failed to fetch conversations by status');
    }
  }
}
