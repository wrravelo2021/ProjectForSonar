import { SocioEntity } from '../socio/socio.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ClubEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  foundation_date: Date;

  @Column()
  image_url: string;

  @Column({
    length: 100,
  })
  description: string;

  @ManyToMany(() => SocioEntity, (socio) => socio.clubs)
  @JoinTable()
  socios: SocioEntity[];
}
