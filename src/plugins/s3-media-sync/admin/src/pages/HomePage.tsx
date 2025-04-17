import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  Alert,
  Typography,
  Loader,
  Card,
  CardHeader,
  CardBody,
  EmptyStateLayout,
} from '@strapi/design-system';
import { Layouts } from "@strapi/admin/strapi-admin";
import { Cross, Information } from '@strapi/icons';
import { useIntl } from 'react-intl';
import { getTranslation } from '../utils/getTranslation';
import { useS3MediaSyncAPI } from '../utils/api';

// Define types for our state data
interface SyncStats {
  success: boolean;
  totalFiles: number;
  filesSynced: number;
  filesSkipped: number;
  filesErrored: number;
  lastSync: string | null;
}

interface ConfigStatus {
  isConfigured: boolean;
  missingConfig: string[];
}

interface ConfigData {
  isConfigured: boolean;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
  prefix: string;
  overwrite: boolean;
  maxConcurrentUploads: number;
}

const HomePage = () => {
  const { formatMessage } = useIntl();
  const { syncS3Media, getSyncStatus, getConfig } = useS3MediaSyncAPI();
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);
  const [configStatus, setConfigStatus] = useState<ConfigStatus>({
    isConfigured: false,
    missingConfig: [],
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch plugin configuration and status when the component mounts
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Use individual try/catch blocks to prevent one failure from blocking the other
        let configData = null;
        let statusData = null;

        try {
          const result = await getConfig() as ConfigData;
          if (isMounted) configData = result;
        } catch (err) {
          console.error('Error fetching config:', err);
        }

        try {
          const result = await getSyncStatus() as SyncStats;
          if (isMounted) statusData = result;
        } catch (err) {
          console.error('Error fetching sync status:', err);
        }

        if (isMounted) {
          // Check if the plugin is configured correctly
          const isConfigured = configData?.isConfigured || false;

          setConfigStatus({
            isConfigured,
            missingConfig: isConfigured ? [] : ['AWS configuration is incomplete'],
          });

          if (statusData) setSyncStats(statusData);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error('Error fetching initial data:', err);
          const errorMessage = err instanceof Error ? err.message : 'Failed to load plugin data';
          setError(errorMessage);
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Clean up to prevent state updates after unmounting
    };
  }, []); // Empty dependency array to run only once when component mounts

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      setError(null);

      const result = await syncS3Media() as SyncStats;
      setSyncStats(result);

      // After sync is complete, refresh status
      const updatedStatus = await getSyncStatus() as SyncStats;
      setSyncStats(updatedStatus);
    } catch (err: unknown) {
      console.error('Sync error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync media from S3';
      setError(errorMessage);
    } finally {
      setIsSyncing(false);
    }
  };

  // Display loading state
  if (isLoading) {
    return (
      <Box padding={8} background="neutral100">
        <Flex justifyContent="center">
          <Loader>Loading S3 Media Sync plugin...</Loader>
        </Flex>
      </Box>
    );
  }

  return (
    <>
      <Layouts.Header
        title={formatMessage({ id: getTranslation('plugin.name'), defaultMessage: 'S3 Media Sync' })}
        subtitle={formatMessage({
          id: getTranslation('plugin.description'),
          defaultMessage: 'Sync media files from your S3 bucket to the Strapi media library',
        })}
        primaryAction={
          <Button
            onClick={handleSync}
            disabled={isSyncing || !configStatus.isConfigured}
            startIcon={<Cross />}
            loading={isSyncing}
          >
            {formatMessage({
              id: getTranslation('sync.button'),
              defaultMessage: 'Sync S3 Files',
            })}
          </Button>
        }
      />

      <Layouts.Content>
        {error && (
          <Box paddingBottom={4}>
            <Alert
              closeLabel="Close alert"
              title="Error"
              variant="danger"
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          </Box>
        )}

        {!configStatus.isConfigured && (
          <Box paddingBottom={4}>
            <Alert
              closeLabel="Close alert"
              title="Configuration Required"
              variant="warning"
            >
              <Box paddingTop={2}>
                <Typography>
                  The S3 Media Sync plugin is not fully configured. Please add the following configuration to your Strapi config:
                </Typography>
                <Box as="ul" paddingLeft={4} paddingTop={2}>
                  {configStatus.missingConfig.map((item, index) => (
                    <li key={index}>
                      <Typography>{item}</Typography>
                    </li>
                  ))}
                </Box>
                <Box paddingTop={2}>
                  <Typography>
                    Add these configuration items to your <code>config/plugins.js</code> file.
                  </Typography>
                </Box>
              </Box>
            </Alert>
          </Box>
        )}

        <Grid.Root gap={6} gridCols={6} s={12}>
          <Grid.Item col={6} s={12}>
            <Card>
              <CardHeader>
                <Typography variant="beta">Sync Statistics</Typography>
              </CardHeader>
              <CardBody>
                {syncStats ? (
                  <Box>
                    <Grid.Root gap={4}>
                      <Grid.Item col={6}>
                        <Typography variant="sigma">Last Sync</Typography>
                        <Typography>
                          {syncStats.lastSync
                            ? new Date(syncStats.lastSync).toLocaleString()
                            : 'Never'}
                        </Typography>
                      </Grid.Item>
                      <Grid.Item col={6}>
                        <Typography variant="sigma">Total Files</Typography>
                        <Typography>{syncStats.totalFiles || 0}</Typography>
                      </Grid.Item>
                      <Grid.Item col={6}>
                        <Typography variant="sigma">Files Synced</Typography>
                        <Typography>{syncStats.filesSynced || 0}</Typography>
                      </Grid.Item>
                      <Grid.Item col={6}>
                        <Typography variant="sigma">Files Skipped</Typography>
                        <Typography>{syncStats.filesSkipped || 0}</Typography>
                      </Grid.Item>
                      {syncStats.filesErrored > 0 && (
                        <Grid.Item col={6}>
                          <Typography variant="sigma">Files with Errors</Typography>
                          <Typography>{syncStats.filesErrored || 0}</Typography>
                        </Grid.Item>
                      )}
                    </Grid.Root>
                  </Box>
                ) : (
                  <EmptyStateLayout
                    icon={<Information />}
                    content="No sync statistics available yet"
                  />
                )}
              </CardBody>
            </Card>
          </Grid.Item>
          <Grid.Item col={6} s={12}>
            <Card>
              <CardHeader>
                <Typography variant="beta">S3 Configuration</Typography>
              </CardHeader>
              <CardBody>
                <Typography>
                  This plugin allows you to sync files from your AWS S3 bucket directly into your Strapi
                  media library with a single click.
                </Typography>
                <Box paddingTop={4}>
                  <Typography variant="delta">Configuration Example</Typography>
                  <Typography as="pre" padding={2} background="neutral100">
{`// config/plugins.js
module.exports = {
  // ...
  's3-media-sync': {
    enabled: true,
    config: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_BUCKET,
      prefix: 'optional/path/prefix',  // Optional
      overwrite: false,  // Optional, defaults to false
    },
  },
  // ...
}`}
                  </Typography>
                </Box>
              </CardBody>
            </Card>
          </Grid.Item>
        </Grid.Root>
      </Layouts.Content>
    </>
  );
};

export { HomePage };
