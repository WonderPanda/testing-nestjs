import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cat } from './cat.entity';
import { CatService } from './cat.service';

const catToken = getRepositoryToken(Cat);

const catArray = [
  new Cat('Test Cat 1', 'Test Breed 1', 4, 'uuid1'),
  new Cat('Test Cat 2', 'Test Breed 2', 3, 'uuid2'),
  new Cat('Test Cat 3', 'Test Breed 3', 2, 'uuid3'),
];

const oneCat = new Cat('Test Cat 1', 'Test Breed 1', 4, 'a uuid');

// if it turns out you don't care for the example using `useValue`
// here is an example with useClass instead

// note that with this method you either need to spyOn all repository calls
// or you can instead define a mock class that implements Repository
// and returns your expected mocks

describe('CatService (useClass)', () => {
  let service: CatService;
  let repo: Repository<Cat>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CatService,
        {
          provide: catToken,
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<CatService>(CatService);
    repo = module.get<Repository<Cat>>(catToken);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('getAll', () => {
    it('should return an array of cats', () => {
      jest.spyOn(repo, 'find').mockResolvedValueOnce(catArray);
      expect(service.getAll()).resolves.toEqual(catArray);
    });
  });
  describe('getOne', () => {
    it('should get a single cat', () => {
      const repoSpy = jest
        .spyOn(repo, 'findOneOrFail')
        .mockResolvedValueOnce(oneCat);
      expect(service.getOne('a uuid')).resolves.toEqual(oneCat);
      expect(repoSpy).toBeCalledWith({ id: 'a uuid' });
    });
  });
  describe('getOneByName', () => {
    it('should get one cat', () => {
      const repoSpy = jest
        .spyOn(repo, 'findOneOrFail')
        .mockResolvedValueOnce(oneCat);
      expect(service.getOneByName('Test Cat 1')).resolves.toEqual(oneCat);
      expect(repoSpy).toBeCalledWith({ name: 'Test Cat 1' });
    });
  });
  describe('insertOne', () => {
    it('should successfully insert a cat', () => {
      jest.spyOn(repo, 'create').mockReturnValueOnce(oneCat);
      jest.spyOn(repo, 'save').mockResolvedValue(oneCat);
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
      jest.spyOn(repo, 'update').mockResolvedValueOnce({} as any);
      expect(
        service.updateOne({
          name: 'Test Cat 1',
          breed: 'Test Breed 1',
          age: 4,
          id: 'a uuid',
        }),
      ).resolves.toEqual(oneCat);
      expect(repo.update).toBeCalledTimes(1);
      expect(repo.update).toBeCalledWith(
        { id: 'a uuid' },
        { name: 'Test Cat 1', breed: 'Test Breed 1', age: 4, id: 'a uuid' },
      );
    });
  });
  describe('deleteOne', () => {
    it('should return {deleted: true}', () => {
      jest.spyOn(repo, 'delete').mockResolvedValue({} as any);
      expect(service.deleteOne('a uuid')).resolves.toEqual({ deleted: true });
    });
    it('should return {deleted: false, message: err.message}', () => {
      const repoSpy = jest
        .spyOn(repo, 'delete')
        .mockRejectedValueOnce(new Error('Bad Delete Method.'));
      expect(service.deleteOne('a bad uuid')).resolves.toEqual({
        deleted: false,
        message: 'Bad Delete Method.',
      });
      expect(repoSpy).toBeCalledWith({ id: 'a bad uuid' });
      expect(repoSpy).toBeCalledTimes(1);
    });
  });
});
