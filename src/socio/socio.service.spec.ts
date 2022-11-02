import { Test, TestingModule } from '@nestjs/testing';
import { SocioService } from './socio.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocioEntity } from './socio.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { faker } from '@faker-js/faker';

describe('SocioService', () => {
  let service: SocioService;
  let repository: Repository<SocioEntity>;
  let sociosList = [];

  const seedDatabase = async () => {
    repository.clear();
    sociosList = [];
    for (let i = 0; i < 5; i++) {
      const socio: SocioEntity = await repository.save({
        name: faker.company.name(),
        email: faker.internet.email(),
        birthday: new Date(),
        clubs: [],
      });
      sociosList.push(socio);
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [SocioService],
    }).compile();

    service = module.get<SocioService>(SocioService);
    repository = module.get<Repository<SocioEntity>>(
      getRepositoryToken(SocioEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all socios', async () => {
    const socios: SocioEntity[] = await service.findAll();
    expect(socios).not.toBeNull();
    expect(socios).toHaveLength(sociosList.length);
  });

  it('findOne should return a socio by id', async () => {
    const storedSocio: SocioEntity = sociosList[0];
    const socio: SocioEntity = await service.findOne(storedSocio.id);
    expect(socio).not.toBeNull();
    expect(socio.name).toEqual(storedSocio.name);
    expect(socio.email).toEqual(storedSocio.email);
    expect(socio.birthday).toEqual(storedSocio.birthday);
  });

  it('findOne should throw an exception for an invalid socio', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'The socio with the given id was not found',
    );
  });

  it('create should return a new socio', async () => {
    const socio: SocioEntity = {
      id: '1',
      name: faker.company.name(),
      email: faker.internet.email(),
      birthday: new Date(),
      clubs: [],
    };

    const newSocio: SocioEntity = await service.create(socio);
    expect(newSocio).not.toBeNull();

    const storedSocio: SocioEntity = await repository.findOne({
      where: { id: newSocio.id },
    });
    expect(storedSocio).not.toBeNull();
    expect(storedSocio.name).toEqual(newSocio.name);
  });

  it('update should modify a socio', async () => {
    const socio: SocioEntity = sociosList[0];
    socio.name = 'New name';
    const updatedSocio: SocioEntity = await service.update(socio.id, socio);
    expect(updatedSocio).not.toBeNull();
    const storedSocio: SocioEntity = await repository.findOne({
      where: { id: socio.id },
    });
    expect(storedSocio).not.toBeNull();
    expect(storedSocio.name).toEqual(socio.name);
  });

  it('update should throw an exception for an invalid socio', async () => {
    let socio: SocioEntity = sociosList[0];
    socio = {
      ...socio,
      name: 'New name',
    };
    await expect(() => service.update('0', socio)).rejects.toHaveProperty(
      'message',
      'The socio with the given id was not found',
    );
  });

  it('delete should remove a socio', async () => {
    const socio: SocioEntity = sociosList[0];
    await service.delete(socio.id);
    const deletedSocio: SocioEntity = await repository.findOne({
      where: { id: socio.id },
    });
    expect(deletedSocio).toBeNull();
  });

  it('delete should throw an exception for an invalid socio', async () => {
    const socio: SocioEntity = sociosList[0];
    await service.delete(socio.id);
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'The socio with the given id was not found',
    );
  });

  it('should validate socio email when creating a new socio', async () => {
    const socio: SocioEntity = {
      id: '1',
      name: faker.company.name(),
      email: 'bademail',
      birthday: new Date(),
      clubs: [],
    };

    await expect(() => service.create(socio)).rejects.toHaveProperty(
      'message',
      'Invalid email for socio should contain @',
    );
  });

  it('should validate socio email when updating a socio', async () => {
    let socio: SocioEntity = sociosList[0];
    socio = {
      ...socio,
      email: 'bademail',
    };

    await expect(() => service.update(socio.id, socio)).rejects.toHaveProperty(
      'message',
      'Invalid email for socio should contain @',
    );
  });
});
