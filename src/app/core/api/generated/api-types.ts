/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface HandlersAlbumDTO {
  artist?: HandlersArtistSummaryDTO;
  artist_id?: number;
  created_at?: string;
  deleted_at?: string;
  id?: number;
  image_path?: string;
  title?: string;
  updated_at?: string;
}

export interface HandlersAlbumSummaryDTO {
  artist_id?: number;
  id?: number;
  image_path?: string;
  title?: string;
}

export interface HandlersArtistDTO {
  created_at?: string;
  deleted_at?: string;
  id?: number;
  name?: string;
  updated_at?: string;
}

export interface HandlersArtistSummaryDTO {
  id?: number;
  name?: string;
}

export interface HandlersDayViewDTO {
  day?: number;
  entries?: HandlersJournalEntryDTO[];
  month?: number;
  year?: number;
}

export interface HandlersFolderDTO {
  available?: boolean;
  created_at?: string;
  deleted_at?: string;
  id?: number;
  last_scan_at?: string;
  last_scan_error?: string;
  last_scan_status?: string;
  last_seen_at?: string;
  path?: string;
  updated_at?: string;
}

export interface HandlersHealth {
  status?: string;
  time?: string;
}

export interface HandlersJournalAssetDTO {
  filename?: string;
  path?: string;
  size_bytes?: number;
}

export interface HandlersJournalDTO {
  created_at?: string;
  day?: number;
  hash?: string;
  last_checked_at?: string;
  month?: number;
  size_bytes?: number;
  tags?: string[];
  updated_at?: string;
  year?: number;
}

export interface HandlersJournalDayDTO {
  day?: number;
  month?: number;
  raw?: string;
  year?: number;
}

export interface HandlersJournalEntryDTO {
  body?: string;
  created_at?: string;
  day?: number;
  deadline_at?: string;
  hash?: string;
  id?: number;
  month?: number;
  position?: number;
  property_keys?: string[];
  raw_line?: string;
  scheduled_at?: string;
  status?: string;
  tags?: string[];
  title?: string;
  type?: string;
  updated_at?: string;
  year?: number;
}

export interface HandlersJournalGitSyncDTO {
  commit_output?: string;
  commit_skipped?: boolean;
  pull_output?: string;
  push_output?: string;
  status?: string;
}

export interface HandlersMetalPriceDTO {
  gbp?: number;
  name?: string;
  symbol?: string;
  updatedAt?: string;
  updatedAtReadable?: string;
  usd?: number;
}

export interface HandlersMetalsPricesDTO {
  gold?: HandlersMetalPriceDTO;
  silver?: HandlersMetalPriceDTO;
}

export interface HandlersPlaylistDTO {
  created_at?: string;
  deleted_at?: string;
  id?: number;
  name?: string;
  updated_at?: string;
}

export interface HandlersPlaylistTrackDTO {
  created_at?: string;
  deleted_at?: string;
  id?: number;
  playlist_id?: number;
  position?: number;
  track?: HandlersTrackDTO;
  track_id?: number;
  updated_at?: string;
}

export interface HandlersScanDTO {
  error?: string;
  finished_at?: string;
  folder_id?: number;
  started_at?: string;
  /** "running" | "ok" | "error" | "skipped_unavailable" */
  status?: string;
}

export interface HandlersSettingDTO {
  created_at?: string;
  key?: string;
  updated_at?: string;
  value?: string;
}

export interface HandlersSettingKeyDTO {
  description?: string;
  key?: string;
}

export interface HandlersTagEdgeDTO {
  count?: number;
  tag?: string;
}

export interface HandlersTagGraphDTO {
  related?: HandlersTagEdgeDTO[];
  tag?: string;
}

export interface HandlersTrackDTO {
  album?: HandlersAlbumSummaryDTO;
  album_id?: number;
  artist?: HandlersArtistSummaryDTO;
  artist_id?: number;
  created_at?: string;
  deleted_at?: string;
  duration_seconds?: number;
  ext?: string;
  filename?: string;
  folder_id?: number;
  genre?: string;
  id?: number;
  image_path?: string;
  last_modified?: number;
  last_seen_at?: string;
  rating?: number;
  rel_path?: string;
  size_bytes?: number;
  title?: string;
  updated_at?: string;
  year?: number;
}

export interface HandlersAddPlaylistTrackRequest {
  position?: number;
  track_id?: number;
}

export interface HandlersCreateFolderRequest {
  path?: string;
}

export interface HandlersCreateJournalEntryRawRequest {
  raw?: string;
}

export interface HandlersCreateJournalEntryRequest {
  body?: string;
  deadline?: string;
  description?: string;
  scheduled?: string;
  status?: string;
  tags?: string[];
}

export interface HandlersCreatePlaylistRequest {
  name?: string;
}

export interface HandlersCreateSettingRequest {
  key?: string;
  value?: string;
}

export interface HandlersEnqueuePlaylistTrackRequest {
  track_id?: number;
}

export interface HandlersUpdateAlbumRequest {
  artist_id?: number;
  title?: string;
}

export interface HandlersUpdateArtistRequest {
  name?: string;
}

export interface HandlersUpdateJournalEntryRequest {
  raw?: string;
}

export interface HandlersUpdatePlaylistTrackRequest {
  position?: number;
}

export interface HandlersUpdateSettingRequest {
  value?: string;
}

export interface HandlersUpdateTrackImageRequest {
  url?: string;
}

export interface HandlersUpdateTrackRatingRequest {
  rating?: number;
}

export interface HandlersUpdateTrackRequest {
  rating?: number;
}
