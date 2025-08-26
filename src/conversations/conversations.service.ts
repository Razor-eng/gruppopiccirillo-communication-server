import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { Status } from 'src/types/enums';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateConversationDto) {
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
  }

  async findAll() {
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
  }

  async findOne(id: string) {
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
  }

  async update(id: string, data: UpdateConversationDto) {
    await this.findOne(id); // Verify it exists

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
  }

  async remove(id: string) {
    await this.findOne(id); // Verify it exists

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
  }

  async archive(id: string) {
    await this.findOne(id); // Verify it exists

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
  }

  // Additional useful methods
  async findByCustomer(customerId: string) {
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
  }

  async findByStatus(status: Status) {
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
  }
}
