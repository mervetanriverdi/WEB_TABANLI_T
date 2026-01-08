import { Request } from 'express';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { RegistrationsService } from './registrations.service';
export declare class RegistrationsController {
    private readonly registrationsService;
    constructor(registrationsService: RegistrationsService);
    create(dto: CreateRegistrationDto, req: Request): Promise<import("../entities/registration.entity").Registration>;
    remove(id: number, req: Request): Promise<{
        message: string;
    }>;
    findMine(req: Request): Promise<import("../entities/registration.entity").Registration[]>;
    findAll(): Promise<import("../entities/registration.entity").Registration[]>;
}
