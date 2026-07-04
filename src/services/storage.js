import { get, set, del } from 'idb-keyval';

/**
 * Storage Service
 * Handles persistence for custom game metadata and assets (images/videos)
 * using IndexedDB for binary support.
 */

const CUSTOM_GAMES_KEY = 'mnova_custom_games';
const DELETED_GAMES_KEY = 'mnova_deleted_games';

export const storage = {
  // Save an asset (image/video file) and return a local blob URL
  async saveAsset(id, file) {
    await set(`asset_${id}`, file);
    return URL.createObjectURL(file);
  },

  // Retrieve an asset by ID and return a blob URL
  async getAssetUrl(id) {
    const file = await get(`asset_${id}`);
    if (file) {
      return URL.createObjectURL(file);
    }
    return null;
  },

  // Save the list of custom games
  async saveCustomGames(games) {
    await set(CUSTOM_GAMES_KEY, games);
  },

  // Get the list of custom games
  async getCustomGames() {
    return (await get(CUSTOM_GAMES_KEY)) || [];
  },

  // Delete an asset
  async deleteAsset(id) {
    await del(`asset_${id}`);
  },

  // Save the list of deleted game IDs
  async saveDeletedGames(ids) {
    await set(DELETED_GAMES_KEY, ids);
  },

  // Get the list of deleted game IDs
  async getDeletedGames() {
    return (await get(DELETED_GAMES_KEY)) || [];
  },

  getTheme: () => {
    return localStorage.getItem('gs_theme') || 'ps5';
  },

  saveTheme: (theme) => {
    localStorage.setItem('gs_theme', theme);
  },
};
