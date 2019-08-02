import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Cat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  breed: string;

  @Column({ type: 'int' })
  age: number;

  constructor(name: string, breed?: string, age?: number, id?: number);
  constructor(name: string, breed: string, age?: number, id?: number);
  constructor(name: string, breed: string, age: number, id?: number);
  constructor(name: string, breed: string, age: number, id: number);
  constructor(name?: string, breed?: string, age?: number, id?: number);
  constructor(name?: string, breed?: string, age?: number, id?: number) {
    this.id = id || -1;
    this.name = name || '';
    this.breed = breed || '';
    this.age = age || NaN;
  }
}
