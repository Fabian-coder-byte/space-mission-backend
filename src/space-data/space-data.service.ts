import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AgencyType } from '../generated/prisma/enums.js';
import { ExternalApiService } from '../external-api/external-api.service.js';

@Injectable()
export class SpaceDataService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly externalApi: ExternalApiService,
    ) { }

    async importAgencies() {
        const data = await this.externalApi.getAgencies(100, 0);

        const agencies = data.results;

        for (const agency of agencies) {
            await this.prisma.agency.upsert({
                where: {
                    externalId: agency.id.toString(),
                },
                update: {
                    name: agency.name,
                    country: agency.country_code,
                    type: this.mapAgencyType(agency.type?.name),
                    description: agency.description,
                    website: agency.info_url,
                    logoUrl: agency.logo_url,
                },
                create: {
                    externalId: agency.id.toString(),
                    name: agency.name,
                    country: agency.country_code,
                    type: this.mapAgencyType(agency.type?.name),
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

    private mapAgencyType(type?: string): AgencyType {
        switch (type?.toLowerCase()) {
            case 'government':
                return AgencyType.GOVERNMENT;

            case 'commercial':
                return AgencyType.COMMERCIAL;

            case 'multinational':
                return AgencyType.MULTINATIONAL;

            case 'educational':
                return AgencyType.EDUCATIONAL;

            case 'private':
                return AgencyType.PRIVATE;

            default:
                return AgencyType.OTHER;
        }
    }
}