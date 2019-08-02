import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cat } from './cat.entity';
import { CatService } from './cat.service';

const catArray = [
  new Cat('Test Cat 1', 'Test Breed 1', 4, 1),
  new Cat('Test Cat 2', 'Test Breed 2', 3, 2),
  new Cat('Test Cat 3', 'Test Breed 3', 2, 3),
];

const oneCat = new Cat('Test Cat 1', 'Test Breed 1', 4, 1);

describe('CatService', () => {
  let service: CatService;
  let repo: Repository<Cat>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatService,
        {
          provide: getRepositoryToken(Cat),
          // define all the methods that you use from the catRepo
          // give proper return values as expected or mock implementations, your choice
          useValue: {
            find: jest.fn().mockResolvedValue(catArray),
            findOneOrFail: jest.fn().mockResolvedValue(oneCat),
            create: jest.fn().mockReturnValue(oneCat),
            save: jest.fn(),
            // as these do not actually use their return values in our sample
            // we just make sure that their resolee is true to not crash
            update: jest.fn().mockResolvedValue(true),
            // as these do not actually use their return values in our sample
            // we just make sure that their resolee is true to not crash
            delete: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<CatService>(CatService);
    repo = module.get<Repository<Cat>>(getRepositoryToken(Cat));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('getAll', () => {
    it('should return an array of cats', () => {
      expect(service.getAll()).resolves.toEqual(catArray);
    });
  });
  describe('getOne', () => {
    it('should get a single cat', () => {
      const repoSpy = jest.spyOn(repo, 'findOneOrFail');
      expect(service.getOne(1)).resolves.toEqual(oneCat);
      expect(repoSpy).toBeCalledWith({ id: 1 });
    });
  });
  describe('getOneByName', () => {
    it('should get one cat', () => {
      const repoSpy = jest.spyOn(repo, 'findOneOrFail');
      expect(service.getOneByName('Test Cat 1')).resolves.toEqual(oneCat);
      expect(repoSpy).toBeCalledWith({ name: 'Test Cat 1' });
    });
  });
  describe('insertOne', () => {
    it('should successfully insert a cat', () => {
      expect(
        service.insertOne({
          name: 'Test Cat 1',
          breed: 'Test Breed 1',
          age: 4,
        }),
      ).resolves.toEqual(oneCat);
      expect(repo.create).toBeCalledTimes(1);
      expect(repo.create).toBeCalledWith({
        name: 'Test Cat 1',
        breed: 'Test Breed 1',
        age: 4,
      });
      expect(repo.save).toBeCalledTimes(1);
    });
  });
  describe('updateOne', () => {
    it('should call the update method', () => {
      expect(
        service.updateOne({
          name: 'Test Cat 1',
          breed: 'Test Breed 1',
          age: 4,
          id: 1,
        }),
      ).resolves.toEqual(oneCat);
      expect(repo.update).toBeCalledTimes(1);
      expect(repo.update).toBeCalledWith(
        { id: 1 },
        { name: 'Test Cat 1', breed: 'Test Breed 1', age: 4, id: 1 },
      );
    });
  });
  describe('deleteOne', () => {
    it('should return {deleted: true}', () => {
      expect(service.deleteOne(1)).resolves.toEqual({ deleted: true });
    });
    it('should return {deleted: false, message: err.message}', () => {
      const repoSpy = jest
        .spyOn(repo, 'delete')
        .mockRejectedValueOnce(new Error('Bad Delete Method.'));
      expect(service.deleteOne(-45871)).resolves.toEqual({
        deleted: false,
        message: 'Bad Delete Method.',
      });
      expect(repoSpy).toBeCalledWith({ id: -45871 });
      expect(repoSpy).toBeCalledTimes(1);
    });
  });
});
