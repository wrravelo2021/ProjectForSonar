import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClubEntity } from '../club/club.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { SocioEntity } from '../socio/socio.entity';
import { Repository } from 'typeorm';
import { ClubSocioService } from './club-socio.service';
import { faker } from '@faker-js/faker';

describe('ClubSocioService', () => {
  let service: ClubSocioService;
  let clubRepository: Repository<ClubEntity>;
  let socioRepository: Repository<SocioEntity>;
  let club: ClubEntity;
  let sociosList: SocioEntity[];

  const seedDatabase = async () => {
    clubRepository.clear();
    socioRepository.clear();

    sociosList = [];
    for (let i = 0; i < 5; i++) {
      const socio: SocioEntity = await socioRepository.save({
        name: faker.company.name(),
        email: faker.internet.email(),
        birthday: new Date(),
        clubs: [],
      });
      sociosList.push(socio);
    }

    club = await clubRepository.save({
      name: faker.company.name(),
      foundation_date: new Date(),
      image_url: faker.image.imageUrl(),
      description: faker.lorem.word(),
      socios: sociosList,
    });
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ClubSocioService],
    }).compile();

    service = module.get<ClubSocioService>(ClubSocioService);
    clubRepository = module.get<Repository<ClubEntity>>(
      getRepositoryToken(ClubEntity),
    );
    socioRepository = module.get<Repository<SocioEntity>>(
      getRepositoryToken(SocioEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addMemberToClub should add an member to a club', async () => {
    const newSocio: SocioEntity = await socioRepository.save({
      name: faker.company.name(),
      email: faker.internet.email(),
      birthday: new Date(),
      clubs: [],
    });

    const newClub = await clubRepository.save({
      name: faker.company.name(),
      foundation_date: new Date(),
      image_url: faker.image.imageUrl(),
      description: faker.lorem.word(),
      socios: [],
    });

    const result: ClubEntity = await service.addMemberToClub(
      newClub.id,
      newSocio.id,
    );
    expect(result.socios.length).toBe(1);
    expect(result.socios[0]).not.toBeNull();
    expect(result.socios[0].name).toEqual(newSocio.name);
    expect(result.socios[0].email).toEqual(newSocio.email);
    expect(result.socios[0].birthday).toEqual(newSocio.birthday);
  });

  it('findMembersFromClub should return socios from a club', async () => {
    const socio: SocioEntity = sociosList[0];
    const storedSocios: SocioEntity[] = await service.findMembersFromClub(
      club.id,
    );
    expect(storedSocios).not.toBeNull();
    expect(storedSocios.length).toBe(sociosList.length);

    const storedSocio = storedSocios.filter((e) => {
      return e.id == socio.id;
    })[0];
    expect(storedSocio).not.toBeNull();
    expect(storedSocio.name).toEqual(socio.name);
    expect(storedSocio.email).toEqual(socio.email);
    expect(storedSocio.birthday).toEqual(socio.birthday);
  });

  it('findMemberFromClub should return socio from a club', async () => {
    const socio: SocioEntity = sociosList[0];
    const storedSocio: SocioEntity = await service.findMemberFromClub(
      club.id,
      socio.id,
    );
    expect(storedSocio).not.toBeNull();
    expect(storedSocio).not.toBeNull();
    expect(storedSocio.name).toEqual(socio.name);
    expect(storedSocio.email).toEqual(socio.email);
    expect(storedSocio.birthday).toEqual(socio.birthday);
  });

  it('updateMembersFromClub should update socios from a club', async () => {
    let storedSocios: SocioEntity[] = await service.findMembersFromClub(
      club.id,
    );
    expect(storedSocios).not.toBeNull();
    expect(storedSocios.length).toBe(sociosList.length);

    const updatedClub: ClubEntity = await service.updateMembersFromClub(
      club.id,
      [sociosList[0]],
    );
    expect(updatedClub).not.toBeNull();
    expect(updatedClub.socios.length).toEqual(1);
    expect(updatedClub.socios.length).not.toBe(sociosList.length);

    storedSocios = await service.findMembersFromClub(club.id);
    expect(storedSocios).not.toBeNull();
    expect(storedSocios.length).toBe(1);
    expect(storedSocios.length).not.toBe(sociosList.length);
  });

  it('deleteMemberFromClub should delete socio from a club', async () => {
    const socio = sociosList[0];
    let storedSocios: SocioEntity[] = await service.findMembersFromClub(
      club.id,
    );
    let foundStoredSocios: SocioEntity[] = storedSocios.filter((e) => {
      return e.id == socio.id;
    });
    expect(foundStoredSocios.length).toBe(1);
    expect(storedSocios.length).toBe(sociosList.length);

    await service.deleteMemberFromClub(club.id, socio.id);

    storedSocios = await service.findMembersFromClub(club.id);
    foundStoredSocios = storedSocios.filter((e) => {
      return e.id == socio.id;
    });
    expect(foundStoredSocios.length).toBe(0);
    expect(storedSocios.length).toBe(sociosList.length - 1);
  });
});
