import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClubEntity } from '../club/club.entity';
import { SocioEntity } from '../socio/socio.entity';
import { Repository } from 'typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { of } from 'rxjs';
@Injectable()
export class ClubSocioService {
  constructor(
    @InjectRepository(ClubEntity)
    private readonly clubRepository: Repository<ClubEntity>,
    @InjectRepository(SocioEntity)
    private readonly socioRepository: Repository<SocioEntity>,
  ) {}

  async addMemberToClub(clubId: string, socioId: string): Promise<ClubEntity> {
    const socio: SocioEntity = await this.socioRepository.findOne({
      where: { id: socioId },
    });
    if (!socio)
      throw new BusinessLogicException(
        'The socio with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['socios'],
    });
    if (!club)
      throw new BusinessLogicException(
        'The club with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    club.socios = [...club.socios, socio];
    return await this.clubRepository.save(club);
  }

  async findMembersFromClub(clubId: string): Promise<SocioEntity[]> {
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['socios'],
    });

    if (!club)
      throw new BusinessLogicException(
        'The club with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    return club.socios;
  }

  async findMemberFromClub(
    clubId: string,
    socioId: string,
  ): Promise<SocioEntity> {
    const socio: SocioEntity = await this.socioRepository.findOne({
      where: { id: socioId },
    });
    if (!socio)
      throw new BusinessLogicException(
        'The socio with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['socios'],
    });
    if (!club)
      throw new BusinessLogicException(
        'The club with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const socioClub: SocioEntity = club.socios.find((e) => e.id === socio.id);

    if (!socioClub)
      throw new BusinessLogicException(
        'The socio with the given id is not associated to the club',
        BusinessError.PRECONDITION_FAILED,
      );

    return socioClub;
  }

  async updateMembersFromClub(
    clubId: string,
    socios: SocioEntity[],
  ): Promise<ClubEntity> {
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['socios'],
    });

    if (!club) {
      const error = 'The club with the given \
      id was not found';
      throw new BusinessLogicException(error, BusinessError.NOT_FOUND);
    }
    for (let i = 0; i < socios.length; i++) {
      const storedSocio = await this.socioRepository.findOne({
        where: { id: socios[i].id },
      });
      if (!storedSocio) {
        const error = 'The socio with the given \
        id was not found';
        throw new BusinessLogicException(error, BusinessError.NOT_FOUND);
      }

      if (socios.length <= 0) {
        continue;
      }
    }

    void this.validateSocios(socios);
    club.socios = socios;
    return await this.clubRepository.save(club);
  }

  async deleteMemberFromClub(clubId: string, socioId: string) {
    const socio: SocioEntity = await this.socioRepository.findOne({
      where: { id: socioId },
    });
    if (!socio)
      throw new BusinessLogicException(
        'The socio with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['socios'],
    })
    if (!club)
      throw new BusinessLogicException(
        'The club with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const club_socio: SocioEntity = club.socios.find((e) => e.id === socio.id);

    if (!club_socio)
      throw new BusinessLogicException(
        'The socio with the given id is not associated to the club',
        BusinessError.PRECONDITION_FAILED,
      ); // Throw error if socio id not found

    club.socios = club.socios.filter((e) => e.id !== socioId);
    return await this.clubRepository.save(club);
  }

  validateSocios(socios) {
    if (!socios) {
      const error = 'The socios are \
        empty';
      throw new BusinessLogicException(error, BusinessError.NOT_FOUND);
    }
  }

  validateClub(club) {
    if (!club) {
      throw 'Invalid club';
    }
  }

  validateSocio(socio) {
    if (socio == null) {
      const error = 'The socio is \
        not valid';
      throw new BusinessLogicException(error, BusinessError.NOT_FOUND);
    }
  }
}
