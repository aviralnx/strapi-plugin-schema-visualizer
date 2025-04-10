import { useFetchClient } from '@strapi/strapi/admin';
import { PLUGIN_ID } from '../pluginId';
const { get } = useFetchClient();

export async function getEntitiesRelationData() {
  return await get(`/${PLUGIN_ID}/er-data`);
}
export async function getTablesRelationData() {
  return await get(`/${PLUGIN_ID}/tr-data`);
}
