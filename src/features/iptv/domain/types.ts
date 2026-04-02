export type Credentials = {
  serverUrl: string;
  username: string;
  password: string;
};

export type SavedProfile = Credentials & {
  id: string;
  name: string;
  createdAt: string;
};

export type ContentMode = "live" | "movie" | "series";

export type SidebarView = "categories" | "channels" | "episodes";

export type XtreamCategory = {
  category_id: string | number;
  category_name: string;
};

export type XtreamChannel = {
  name: string;
  stream_id: number;
  stream_icon?: string;
  category_id?: string | number | null;
  epg_channel_id?: string;
  container_extension?: string;
};

export type XtreamSeries = {
  name: string;
  series_id: number;
  cover?: string;
  category_id?: string | number | null;
};

export type XtreamSeriesEpisode = {
  id: string | number;
  title?: string;
  episode_num?: number;
  container_extension?: string;
  info?: {
    movie_image?: string;
  };
};

export type XtreamSeriesInfo = {
  info?: {
    cover?: string;
  };
  episodes?: Record<string, XtreamSeriesEpisode[]>;
};

export type XtreamShortEpgItem = {
  id?: string | number;
  title?: string;
  description?: string;
  start?: string;
  end?: string;
  start_timestamp?: string | number;
  stop_timestamp?: string | number;
  now_playing?: 0 | 1;
};

export type XtreamShortEpgResponse =
  | XtreamShortEpgItem[]
  | {
      epg_listings?: XtreamShortEpgItem[];
      listings?: XtreamShortEpgItem[];
    };

export type NormalizedCategory = {
  id: string;
  name: string;
};

export type NormalizedChannel = {
  key: string;
  mode: ContentMode;
  id: number;
  name: string;
  categoryId: string;
  icon: string;
  epgId: string;
  extension?: string;
  seasonId?: string;
  seriesId?: number;
};

export type PlayerApiResponse = {
  user_info?: {
    auth: number;
  };
};

export type ContinueWatchingEntry = {
  currentTime: number;
  duration: number;
  updatedAt: string;
};

export type CategoryEntry = {
  id: string;
  title: string;
  subtitle: string;
};

export type EpgEntry = {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  startDate: Date | null;
  endDate: Date | null;
  isCurrent: boolean;
};
