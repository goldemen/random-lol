export interface Champion {
  name: string;
  roles: string[];
}

export interface ChampionsByRole {
  role: string;
  count: number;
  champions: Champion[];
}

export interface ChampionRow {
  name: string;
  roles: string[];
}
