import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AgencyType, RocketStatus } from '../generated/prisma/enums.js';
import { ExternalApiService } from '../external-api/external-api.service.js';

@Injectable()
export class SpaceDataService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly externalApi: ExternalApiService,
  ) {}

  async importAgencies() {
    const data = await this.externalApi.getAgencies(1000, 0);
    Logger.log(JSON.stringify(data.results, null, 2), 'SpaceDataService');
    const agencies = data.results;

    for (const agency of agencies) {
      await this.prisma.agency.upsert({
        where: {
          externalId: agency.id.toString(),
        },
        update: {
          name: agency.name,
          country: agency.country[0].name,
          type: AgencyType.GOVERNMENT,
          description: agency.description,
          website: agency.info_url,
          logoUrl: agency.logo_url,
        },
        create: {
          externalId: agency.id.toString(),
          name: agency.name,
          country: agency.country[0].name,
          type: AgencyType.GOVERNMENT,
          description: agency.description,
          website: agency.info_url,
          logoUrl: agency.logo_url,
          foundedYear: null,
        },
      });
    }

    return {
      imported: agencies.length,
    };
  }


  async importRockets() {
    const data = await this.externalApi.getRockets(1000, 0);
    Logger.log(JSON.stringify(data.results, null, 2), 'SpaceDataService');
    const rockets = data.results;

    for (const rocket of rockets) {
      await this.prisma.rocket.upsert({
        where: {
          externalId: rocket.id.toString(),
        },
        update: {
          name: rocket.name,
         manufacturer:rocket.manufacturer ? rocket.manufacturer.name : null,
         reusable: false,
         status:RocketStatus.ACTIVE,
        },
        create: {
          externalId: rocket.id.toString(),
          name: rocket.name,
          manufacturer: rocket.manufacturer ? rocket.manufacturer.name : null,
          reusable: false,
        },
      });
    }

    return {
      imported: rockets.length,
    };
  }

  private mapAgencyType(type?: string): AgencyType {
    switch (type?.toLowerCase()) {
      case 'government':
        return AgencyType.GOVERNMENT;

      case 'commercial':
        return AgencyType.PRIVATE;

      case 'multinational':
        return AgencyType.INTERNATIONAL;

      case 'educational':
        return AgencyType.GOVERNMENT;

      case 'private':
        return AgencyType.PRIVATE;

      default:
        return AgencyType.GOVERNMENT;
    }
  }
}
