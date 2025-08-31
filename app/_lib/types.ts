// app/_lib/types.ts

export interface Cast {
  date: string;
  week: string;
  dayweather: string;
  nightweather: string;
  daytemp: string;
  nighttemp: string;
  daywind: string;
  nightwind: string;
  daypower: string;
  nightpower: string;
}

export interface WeatherData {
  status: string;
  count: string;
  info: string;
  infocode: string;
  forecasts: {
    city: string;
    adcode: string;
    province: string;
    reporttime: string;
    casts: Cast[];
  }[];
}

export interface SavedWay {
  sid: number;
  name: string;
}

export interface RouteDetail {
  name: string;
  sid: string[];
  way: string[];
}
