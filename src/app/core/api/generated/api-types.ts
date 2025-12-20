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

export interface HandlersTaskDTO {
  body?: string;
  created_at?: string;
  deleted_at?: string;
  id?: number;
  status_code?: string;
  tags?: string[];
  title?: string;
  updated_at?: string;
}

export interface HandlersTaskStatusDTO {
  code?: string;
  label?: string;
}

export interface HandlersTaskTransitionDTO {
  changed_at?: string;
  id?: number;
  reason?: string;
  status_code?: string;
  task_id?: number;
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

export interface HandlersCreatePlaylistRequest {
  name?: string;
}

export interface HandlersCreateTaskRequest {
  body?: string;
  reason?: string;
  status_code?: string;
  tags?: string[];
  title?: string;
}

export interface HandlersCreateTaskTransitionRequest {
  reason?: string;
  status_code?: string;
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

export interface HandlersUpdatePlaylistTrackRequest {
  position?: number;
}

export interface HandlersUpdateTaskRequest {
  body?: string;
  tags?: string[];
  title?: string;
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
