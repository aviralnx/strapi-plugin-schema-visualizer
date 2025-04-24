import React, { useState, useEffect } from 'react';
import { Main, Box, Typography, Button, Flex, Loader, Alert, EmptyStateLayout, Table, Thead, Tr, Th, Tbody, Td } from '@strapi/design-system';
import { useIntl } from 'react-intl';
import { Cross, Cloud } from '@strapi/icons'; // Changed Refresh to ArrowRefresh which is available

import { getTranslation } from '../utils/getTranslation';
import { PLUGIN_ID } from '../pluginId';
import { useCloudinarySyncAPI } from '../utils/api';

// Define types for our data
interface CloudinaryResource {
  public_id: string;
  format: string;
  resource_type: string;
  secure_url: string;
  url: string;
}

interface SyncStats {
  processed: number;
  uploaded: number;
  skipped: number;
  errors: Array<{ public_id: string; error: string }>;
}

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  resourceType: string;
  folderPath: string;
  maxResults: number;
  overwrite: boolean;
  syncInterval: number;
}

const HomePage = () => {
  const { formatMessage } = useIntl();
  const { getConfig, getCloudinaryResources, syncMedia } = useCloudinarySyncAPI();
  const [config, setConfig] = useState<CloudinaryConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resources, setResources] = useState<CloudinaryResource[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getConfig();
      setConfig(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      setIsLoadingResources(true);
      setError(null);
      const data = await getCloudinaryResources();
      if (data && data.resources) {
        setResources(data.resources.slice(0, 10)); // Show just first 10 for preview
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load Cloudinary resources');
    } finally {
      setIsLoadingResources(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      setSyncResult(null);
      setError(null);
      const result = await syncMedia();
      setSyncResult(result);
    } catch (err: any) {
      setError(err.message || 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  if (isLoading) {
    return (
      <Main>
        <Flex justifyContent="center" padding={6}>
          <Loader>Loading configuration...</Loader>
        </Flex>
      </Main>
    );
  }

  return (
    <Main>
      <Box padding={8}>
        <Typography variant="alpha">
          {formatMessage({ id: getTranslation('plugin.name') })}
        </Typography>

        <Box paddingTop={4} paddingBottom={4}>
          <Typography variant="epsilon">
            Synchronize your Cloudinary media with Strapi's Media Library
          </Typography>
        </Box>

        {error && (
          <Box paddingBottom={4}>
            <Alert closeLabel="Close" title="Error" variant="danger">
              {error}
            </Alert>
          </Box>
        )}

        {syncResult && (
          <Box paddingBottom={4}>
            <Alert closeLabel="Close" title="Sync Results" variant="success" onClose={() => setSyncResult(null)}>
              <Typography>Processed: {syncResult.processed}</Typography>
              <Typography>Uploaded: {syncResult.uploaded}</Typography>
              <Typography>Skipped: {syncResult.skipped}</Typography>
              {syncResult.errors && syncResult.errors.length > 0 && (
                <Typography variant="pi">Errors: {syncResult.errors.length}</Typography>
              )}
            </Alert>
          </Box>
        )}

        {config && (
          <Box padding={4} background="neutral100" borderColor="neutral200" hasRadius>
            <Typography variant="delta">Cloudinary Configuration</Typography>
            <Box paddingTop={2}>
              <Typography>
                Cloud Name: <b>{config.cloudName || 'Not configured'}</b>
              </Typography>
              <Typography>
                Resource Type: <b>{config.resourceType || 'image'}</b>
              </Typography>
              <Typography>
                Folder: <b>{config.folderPath || 'Root folder'}</b>
              </Typography>
              <Typography>
                Max Results: <b>{config.maxResults || 50}</b>
              </Typography>
              <Typography>
                Overwrite Existing: <b>{config.overwrite ? 'Yes' : 'No'}</b>
              </Typography>
              <Typography>
                Auto Sync Interval: <b>{config.syncInterval ? `${config.syncInterval} minutes` : 'Manual only'}</b>
              </Typography>
            </Box>
          </Box>
        )}

        <Box paddingTop={4}>
          <Flex gap={2}>
            <Button
              onClick={handleSync}
              loading={isSyncing}
              disabled={!config || !config.cloudName}
              startIcon={<Cross />}
              size="L"
            >
              {isSyncing ? 'Syncing...' : 'Sync Media from Cloudinary'}
            </Button>
            <Button
              variant="secondary"
              onClick={fetchResources}
              loading={isLoadingResources}
              disabled={!config || !config.cloudName}
              startIcon={<Cloud />}
            >
              View Cloudinary Resources
            </Button>
          </Flex>
        </Box>

        {resources.length > 0 && (
          <Box paddingTop={6}>
            <Typography variant="delta" paddingBottom={2}>
              Cloudinary Resources Preview (First 10)
            </Typography>
            <Table colCount={4} rowCount={resources.length + 1}>
              <Thead>
                <Tr>
                  <Th>
                    <Typography variant="sigma">Public ID</Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma">Format</Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma">Type</Typography>
                  </Th>
                  <Th>
                    <Typography variant="sigma">Thumbnail</Typography>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {resources.map((resource) => (
                  <Tr key={resource.public_id}>
                    <Td>
                      <Typography>{resource.public_id}</Typography>
                    </Td>
                    <Td>
                      <Typography>{resource.format}</Typography>
                    </Td>
                    <Td>
                      <Typography>{resource.resource_type}</Typography>
                    </Td>
                    <Td>
                      {resource.secure_url && (
                        <img
                          src={resource.secure_url.replace(/upload\/(.*)/, 'upload/w_80,h_80,c_fill/$1')}
                          alt={resource.public_id}
                          width="40"
                          height="40"
                          style={{ objectFit: 'cover', borderRadius: '4px' }}
                        />
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}

        {resources.length === 0 && isLoadingResources === false && (
          <Box paddingTop={6}>
            <EmptyStateLayout
              icon={<Cloud />}
              content="No Cloudinary resources found or you haven't loaded resources yet."
            />
          </Box>
        )}
      </Box>
    </Main>
  );
};

export { HomePage };
