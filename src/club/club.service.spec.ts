import { Test, TestingModule } from '@nestjs/testing';
import { ClubService } from './club.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClubEntity } from './club.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { faker } from '@faker-js/faker';

describe('ClubService', () => {
  let service: ClubService;
  let repository: Repository<ClubEntity>;
  let clubsList = [];

  const seedDatabase = async () => {
    repository.clear();
    clubsList = [];
    for (let i = 0; i < 5; i++) {
      const club: ClubEntity = await repository.save({
        name: faker.company.name(),
        foundation_date: new Date(),
        image_url: faker.image.imageUrl(),
        description: faker.lorem.word(),
        socios: [],
      });
      clubsList.push(club);
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ClubService],
    }).compile();

    service = module.get<ClubService>(ClubService);
    repository = module.get<Repository<ClubEntity>>(
      getRepositoryToken(ClubEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all clubs', async () => {
    const clubs: ClubEntity[] = await service.findAll();
    expect(clubs).not.toBeNull();
    expect(clubs).toHaveLength(clubsList.length);
  });

  it('findOne should return a club by id', async () => {
    const storedClub: ClubEntity = clubsList[0];
    const club: ClubEntity = await service.findOne(storedClub.id);
    expect(club).not.toBeNull();
    expect(club.name).toEqual(storedClub.name);
    expect(club.foundation_date).toEqual(storedClub.foundation_date);
    expect(club.image_url).toEqual(storedClub.image_url);
    expect(club.description).toEqual(storedClub.description);
  });

  it('findOne should throw an exception for an invalid club', async () => {
    await expect(() => service.findOne('0')).rejects.toHaveProperty(
      'message',
      'The club with the given id was not found',
    );
  });

  it('create should return a new club', async () => {
    const club: ClubEntity = {
      id: '1',
      name: faker.company.name(),
      foundation_date: new Date(),
      image_url: faker.image.imageUrl(),
      description: faker.lorem.word(),
      socios: [],
    };

    const newClub: ClubEntity = await service.create(club);
    expect(newClub).not.toBeNull();

    const storedClub: ClubEntity = await repository.findOne({
      where: { id: newClub.id },
    });
    expect(storedClub).not.toBeNull();
    expect(storedClub.name).toEqual(newClub.name);
  });

  it('update should modify a club', async () => {
    const club: ClubEntity = clubsList[0];
    club.name = 'New name';
    const updatedClub: ClubEntity = await service.update(club.id, club);
    expect(updatedClub).not.toBeNull();
    const storedClub: ClubEntity = await repository.findOne({
      where: { id: club.id },
    });
    expect(storedClub).not.toBeNull();
    expect(storedClub.name).toEqual(club.name);
  });

  it('update should throw an exception for an invalid club', async () => {
    let club: ClubEntity = clubsList[0];
    club = {
      ...club,
      name: 'New name',
    };
    await expect(() => service.update('0', club)).rejects.toHaveProperty(
      'message',
      'The club with the given id was not found',
    );
  });

  it('delete should remove a club', async () => {
    const club: ClubEntity = clubsList[0];
    await service.delete(club.id);
    const deletedClub: ClubEntity = await repository.findOne({
      where: { id: club.id },
    });
    expect(deletedClub).toBeNull();
  });

  it('delete should throw an exception for an invalid club', async () => {
    const club: ClubEntity = clubsList[0];
    await service.delete(club.id);
    await expect(() => service.delete('0')).rejects.toHaveProperty(
      'message',
      'The club with the given id was not found',
    );
  });

  it('should throw an exception if description is longer than 100 characters when creating club', async () => {
    const club: ClubEntity = {
      id: '1',
      name: faker.company.name(),
      foundation_date: new Date(),
      image_url: faker.image.imageUrl(),
      description: 'W'.repeat(101),
      socios: [],
    };

    await expect(() => service.create(club)).rejects.toHaveProperty(
      'message',
      'The club description cant be longer than 100 character',
    );
  });

  it('should throw an exception if description is longer than 100 characters when updating club', async () => {
    let club: ClubEntity = clubsList[0];
    club = {
      ...club,
      description: 'W'.repeat(101),
    };

    await expect(() => service.update(club.id, club)).rejects.toHaveProperty(
      'message',
      'The club description cant be longer than 100 character',
    );
  });
});
