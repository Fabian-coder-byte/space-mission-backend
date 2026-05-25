import { HttpService } from '@nestjs/axios/dist/index.js';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

@Injectable()
export class ExternalApiService {
    private readonly launchLibraryBaseUrl = 'https://ll.thespacedevs.com/2.3.0';

    constructor(private readonly httpService: HttpService) { }

    async getData() {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${this.launchLibraryBaseUrl}/launches/`, {
                    params: {
                        limit: 10,
                        ordering: '-net',
                    },
                }),
            );

            return response.data;
        } catch (error) {
            throw new InternalServerErrorException(
                'Errore durante la chiamata alla API esterna',
            );
        }
    }

    async getLaunches(limit = 100, offset = 0) {
        const response = await firstValueFrom(
            this.httpService.get(`${this.launchLibraryBaseUrl}/launches/`, {
                params: {
                    limit,
                    offset,
                    ordering: '-net',
                },
            }),
        );

        return response.data;
    }

    async getAgencies(limit = 100, offset = 0) {
        const response = await firstValueFrom(
            this.httpService.get(`${this.launchLibraryBaseUrl}/agencies/`, {
                params: {
                    limit,
                    offset,
                },
            }),
        );

        return response.data;
    }

    async getRockets(limit = 100, offset = 0) {
        const response = await firstValueFrom(
            this.httpService.get(`${this.launchLibraryBaseUrl}/launcher_configurations/`, {
                params: {
                    limit,
                    offset,
                },
            }),
        );

        return response.data;
    }

    async getLaunchSites(limit = 100, offset = 0) {
        const response = await firstValueFrom(
            this.httpService.get(`${this.launchLibraryBaseUrl}/locations/`, {
                params: {
                    limit,
                    offset,
                },
            }),
        );

        return response.data;
    }

    async getPads(limit = 100, offset = 0) {
        const response = await firstValueFrom(
            this.httpService.get(`${this.launchLibraryBaseUrl}/pads/`, {
                params: {
                    limit,
                    offset,
                },
            }),
        );

        return response.data;
    }
}
