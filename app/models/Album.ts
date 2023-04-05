import { Model } from 'superflare';
import { Image } from './Image';
import { User } from './User';

export class Album extends Model {
  images!: Image[] | Promise<Image[]>;
  user!: User | Promise<User>;

  $images() {
    return this.hasMany(Image);
  }

  $user() {
    return this.belongsTo(User);
  }

  toJSON(): AlbumRow {
    return super.toJSON();
  }
}
Model.register(Album);

export interface Album extends AlbumRow {};
