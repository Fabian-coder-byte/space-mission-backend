import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';
import { ExternalApiService } from '../external-api/external-api.service.js';
import {
  AgencyType,
  MissionStatus,
  MissionType,
  RocketStatus,
} from '../generated/prisma/enums.js';

export interface ImportResult {
  entity: string;
  created: number;
  skipped: number;
  errors: number;
}

@Injectable()
export class SpaceDataService {
  private readonly logger = new Logger(SpaceDataService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly externalApi: ExternalApiService,
  ) {}

  // ─── Cron: ogni giorno alle 03:00 ───────────────────────────────────────────
  @Cron('0 3 * * *', { name: 'daily-import', timeZone: 'Europe/Rome' })
  async scheduledDailyImport() {
    this.logger.log('Avvio importazione giornaliera dati spaziali...');
    try {
      const results = await this.importAll();
      const total = results.reduce((s, r) => s + r.created, 0);
      this.logger.log(`Importazione completata: ${total} nuovi record creati.`);
    } catch (err) {
      this.logger.error('Errore durante importazione giornaliera:', err);
    }
  }

  // ─── importAll ───────────────────────────────────────────────────────────────
  async importAll(): Promise<ImportResult[]> {
    const [agencies, rockets, launchSites, missions] = await Promise.allSettled([
      this.importAgencies(),
      this.importRockets(),
      this.importLaunchSites(),
      this.importMissions(),
    ]);

    return [agencies, rockets, launchSites, missions].map((r, i) => {
      const names = ['Agenzie', 'Razzi', 'Launch Sites', 'Missioni'];
      if (r.status === 'fulfilled') return r.value;
      this.logger.error(`Errore importazione ${names[i]}:`, r.reason);
      return { entity: names[i], created: 0, skipped: 0, errors: 1 };
    });
  }

  // ─── importAgencies ──────────────────────────────────────────────────────────
  async importAgencies(): Promise<ImportResult> {
    const result: ImportResult = { entity: 'Agenzie', created: 0, skipped: 0, errors: 0 };

    try {
      const data = await this.externalApi.getAgencies(500, 0);
      const agencies: any[] = data.results ?? [];

      for (const a of agencies) {
        const extId = String(a.id);
        const existing = await this.prisma.agency.findUnique({ where: { externalId: extId } });

        if (existing) {
          result.skipped++;
          continue;
        }

        try {
          await this.prisma.agency.create({
            data: {
              externalId: extId,
              name: a.name,
              country: a.country?.[0]?.name ?? null,
              type: this.mapAgencyType(a.type?.name),
              description: a.description ?? null,
              website: a.info_url ?? null,
              logoUrl: a.logo_url ?? null,
              foundedYear: a.founding_year ? parseInt(a.founding_year) : null,
            },
          });
          result.created++;
        } catch {
          result.errors++;
        }
      }
    } catch (err) {
      this.logger.error('importAgencies error:', err);
      result.errors++;
    }

    this.logger.log(`Agenzie → creati: ${result.created}, saltati: ${result.skipped}`);
    return result;
  }

  // ─── importRockets ───────────────────────────────────────────────────────────
  async importRockets(): Promise<ImportResult> {
    const result: ImportResult = { entity: 'Razzi', created: 0, skipped: 0, errors: 0 };

    try {
      const data = await this.externalApi.getRockets(500, 0);
      const rockets: any[] = data.results ?? [];

      for (const r of rockets) {
        const extId = String(r.id);
        const existing = await this.prisma.rocket.findUnique({ where: { externalId: extId } });

        if (existing) {
          result.skipped++;
          continue;
        }

        const agencyExtId = r.manufacturer?.id ? String(r.manufacturer.id) : null;
        let agencyId: string | null = null;
        if (agencyExtId) {
          const agency = await this.prisma.agency.findUnique({ where: { externalId: agencyExtId } });
          agencyId = agency?.id ?? null;
        }

        try {
          await this.prisma.rocket.create({
            data: {
              externalId: extId,
              name: r.full_name ?? r.name,
              manufacturer: r.manufacturer?.name ?? null,
              description: r.description ?? null,
              reusable: r.reusable ?? false,
              status: this.mapRocketStatus(r.program?.[0]?.mission_type),
              heightMeters: r.length ? parseFloat(r.length) : null,
              diameterMeters: r.diameter ? parseFloat(r.diameter) : null,
              massKg: r.launch_mass ? parseInt(r.launch_mass) * 1000 : null,
              payloadToLeoKg: r.leo_capacity ? parseInt(r.leo_capacity) : null,
              payloadToGtoKg: r.gto_capacity ? parseInt(r.gto_capacity) : null,
              firstFlightDate: r.maiden_flight ? new Date(r.maiden_flight) : null,
              imageUrl: r.image_url ?? null,
              agencyId,
            },
          });
          result.created++;
        } catch {
          result.errors++;
        }
      }
    } catch (err) {
      this.logger.error('importRockets error:', err);
      result.errors++;
    }

    this.logger.log(`Razzi → creati: ${result.created}, saltati: ${result.skipped}`);
    return result;
  }

  // ─── importLaunchSites ───────────────────────────────────────────────────────
  async importLaunchSites(): Promise<ImportResult> {
    const result: ImportResult = { entity: 'Launch Sites', created: 0, skipped: 0, errors: 0 };

    try {
      const data = await this.externalApi.getLaunchSites(500, 0);
      const locations: any[] = data.results ?? [];

      for (const loc of locations) {
        const extId = String(loc.id);
        const existing = await this.prisma.launchSite.findUnique({ where: { externalId: extId } });

        if (existing) {
          result.skipped++;
          continue;
        }

        try {
          await this.prisma.launchSite.create({
            data: {
              externalId: extId,
              name: loc.name,
              locationName: loc.name,
              country: loc.country_code ?? null,
              region: null,
              latitude: loc.pads?.[0]?.latitude ? parseFloat(loc.pads[0].latitude) : null,
              longitude: loc.pads?.[0]?.longitude ? parseFloat(loc.pads[0].longitude) : null,
              description: loc.description ?? null,
              imageUrl: loc.map_image ?? null,
            },
          });
          result.created++;
        } catch {
          result.errors++;
        }
      }
    } catch (err) {
      this.logger.error('importLaunchSites error:', err);
      result.errors++;
    }

    this.logger.log(`Launch Sites → creati: ${result.created}, saltati: ${result.skipped}`);
    return result;
  }

  // ─── importMissions ──────────────────────────────────────────────────────────
  async importMissions(): Promise<ImportResult> {
    const result: ImportResult = { entity: 'Missioni', created: 0, skipped: 0, errors: 0 };

    try {
      const data = await this.externalApi.getLaunches(100, 0);
      const launches: any[] = data.results ?? [];

      for (const launch of launches) {
        const extId = String(launch.id);
        const existing = await this.prisma.mission.findFirst({ where: { externalId: extId } });

        if (existing) {
          result.skipped++;
          continue;
        }

        // Resolve agency
        let agencyId: string | null = null;
        if (launch.launch_service_provider?.id) {
          const agency = await this.prisma.agency.findUnique({
            where: { externalId: String(launch.launch_service_provider.id) },
          });
          agencyId = agency?.id ?? null;
        }

        // Resolve rocket
        let rocketId: string | null = null;
        if (launch.rocket?.configuration?.id) {
          const rocket = await this.prisma.rocket.findUnique({
            where: { externalId: String(launch.rocket.configuration.id) },
          });
          rocketId = rocket?.id ?? null;
        }

        // Resolve launch site
        let launchSiteId: string | null = null;
        if (launch.pad?.location?.id) {
          const site = await this.prisma.launchSite.findUnique({
            where: { externalId: String(launch.pad.location.id) },
          });
          launchSiteId = site?.id ?? null;
        }

        try {
          await this.prisma.mission.create({
            data: {
              externalId: extId,
              name: launch.name,
              description: launch.mission?.description ?? null,
              missionType: this.mapMissionType(launch.mission?.type?.name),
              status: this.mapMissionStatus(launch.status?.abbrev),
              launchDate: launch.net ? new Date(launch.net) : null,
              windowStart: launch.window_start ? new Date(launch.window_start) : null,
              windowEnd: launch.window_end ? new Date(launch.window_end) : null,
              destination: launch.mission?.orbit?.name ?? null,
              orbit: launch.mission?.orbit?.abbrev ?? null,
              isCrewed: launch.mission?.type?.name?.toLowerCase().includes('crewed') ?? false,
              imageUrl: launch.image?.thumbnail_url ?? launch.image?.image_url ?? null,
              detailsUrl: launch.url ?? null,
              agencyId,
              rocketId,
              launchSiteId,
            },
          });
          result.created++;
        } catch {
          result.errors++;
        }
      }
    } catch (err) {
      this.logger.error('importMissions error:', err);
      result.errors++;
    }

    this.logger.log(`Missioni → create: ${result.created}, saltate: ${result.skipped}`);
    return result;
  }

  // ─── Mappers ────────────────────────────────────────────────────────────────
  private mapAgencyType(type?: string): AgencyType {
    switch (type?.toLowerCase()) {
      case 'government': return AgencyType.GOVERNMENT;
      case 'commercial':
      case 'private': return AgencyType.PRIVATE;
      case 'multinational':
      case 'educational': return AgencyType.INTERNATIONAL;
      default: return AgencyType.GOVERNMENT;
    }
  }

  private mapRocketStatus(type?: string): RocketStatus {
    if (!type) return RocketStatus.ACTIVE;
    if (type.toLowerCase().includes('retired')) return RocketStatus.RETIRED;
    if (type.toLowerCase().includes('development')) return RocketStatus.IN_DEVELOPMENT;
    return RocketStatus.ACTIVE;
  }

  private mapMissionStatus(abbrev?: string): MissionStatus {
    switch (abbrev?.toUpperCase()) {
      case 'GO':
      case 'TBC': return MissionStatus.CONFIRMED;
      case 'TBD': return MissionStatus.SCHEDULED;
      case 'HOLD': return MissionStatus.DELAYED;
      case 'SCRUB': return MissionStatus.SCRUBBED;
      case 'SUCCESS':
      case 'PARTIAL_FAILURE':
      case 'FAILURE': return MissionStatus.COMPLETED;
      default: return MissionStatus.SCHEDULED;
    }
  }

  private mapMissionType(type?: string): MissionType | null {
    switch (type?.toLowerCase()) {
      case 'earth science':
      case 'planetary science': return MissionType.SCIENTIFIC;
      case 'astrophysics':
      case 'heliophysics': return MissionType.EXPLORATION;
      case 'human exploration': return MissionType.CREWED;
      case 'communications': return MissionType.SATELLITE;
      case 'cargo': return MissionType.CARGO;
      case 'resupply': return MissionType.RESUPPLY;
      case 'military/intelligence': return MissionType.MILITARY;
      case 'test flight': return MissionType.TEST_FLIGHT;
      default: return null;
    }
  }
}
