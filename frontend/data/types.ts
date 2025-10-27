// data/types.ts
import { Game } from "./mockGames";

export interface OwnedLicense {
  license_id: number;
  game_id: string;
  owner: string;
  expiry: number; // timestamp in seconds
  transferable: boolean;
  metadata_uri: string;
  purchase_date: number; // timestamp
  game?: Game; // populated from mockGames
}