import { useState, useEffect } from 'react';
import {
  Main,
  Box,
  Typography,
  Button,
  Flex,
  Loader,
  Alert,
  EmptyStateLayout,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardSubtitle,
  Grid,
  Badge,
  Divider,
} from '@strapi/design-system';
import { useIntl } from 'react-intl';
import {
  Cloud,
  Upload,
  Information,
  Cross as Refresh
} from '@strapi/icons';

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
        <Flex justifyContent="center" alignItems="center" padding={8} style={{ height: '70vh' }}>
          <Loader>Loading configuration...</Loader>
        </Flex>
      </Main>
    );
  }

  return (
    <Main>
      <Box paddingBottom={4}>
        <Box background="neutral100" padding={4} hasRadius shadow="filterShadow">
          <Box paddingBottom={2}>
            <Typography variant="alpha" fontWeight="bold">
              {'Sync Cloudinary Media Library'}
            </Typography>
          </Box>
          <Typography variant="epsilon" textColor="neutral600">
            Synchronize your Cloudinary media with Strapi's Media Library
          </Typography>
        </Box>
      </Box>

      {error && (
        <Box paddingBottom={4}>
          <Alert closeLabel="Close" title="Error" variant="danger" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      {syncResult && (
        <Box paddingBottom={4}>
          <Alert closeLabel="Close" title="Sync Completed Successfully" variant="success" onClose={() => setSyncResult(null)}>
            <Box padding={2}>
              <Grid.Root gap={{
                large: 4,
                medium: 2,
                initial: 1
              }}>
                <Grid.Item col={3} xs={6}>
                  <Box background="neutral0" padding={2} hasRadius shadow="tableShadow" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Typography variant="sigma" textColor="neutral600">Processed</Typography>
                    <Typography variant="beta">{syncResult?.processed}</Typography>
                  </Box>
                </Grid.Item>
                <Grid.Item col={3} xs={6}>
                  <Box background="neutral0" padding={2} hasRadius shadow="tableShadow"style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Typography variant="sigma" textColor="neutral600">Uploaded</Typography>
                    <Typography variant="beta">{syncResult?.uploaded}</Typography>
                  </Box>
                </Grid.Item>
                <Grid.Item col={3} xs={6}>
                  <Box background="neutral0" padding={2} hasRadius shadow="tableShadow" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Typography variant="sigma" textColor="neutral600">Skipped</Typography>
                    <Typography variant="beta">{syncResult?.skipped}</Typography>
                  </Box>
                </Grid.Item>
                <Grid.Item col={3} xs={6}>
                  <Box background="neutral0" padding={2} hasRadius shadow="tableShadow" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Typography variant="sigma" textColor="neutral600">Errors</Typography>
                    <Typography variant="beta">{syncResult?.errors?.length || 0}</Typography>
                  </Box>
                </Grid.Item>
              </Grid.Root>
            </Box>
            {syncResult?.errors && syncResult?.errors.length > 0 && (
              <Box paddingTop={2}>
                <Typography variant="pi">Errors: Click to view details</Typography>
                <Box background="neutral0" padding={2} marginTop={2} hasRadius>
                  {syncResult?.errors.slice(0, 3).map((err, index) => (
                    <Typography key={index} variant="pi">
                      • {err.public_id}: {err.error}
                    </Typography>
                  ))}
                  {syncResult?.errors.length > 3 && (
                    <Typography variant="pi">...and {syncResult?.errors.length - 3} more errors</Typography>
                  )}
                </Box>
              </Box>
            )}
          </Alert>
        </Box>
      )}

      <Grid.Root gap={{
        large: 5,
        medium: 4,
        initial: 2
      }} style={{ margin: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        <Grid.Item>
          <Card>
            <CardHeader style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CardTitle style={{ fontSize: '1.7rem' }}>Configuration</CardTitle>
              <CardSubtitle>Your Cloudinary integration settings</CardSubtitle>
            </CardHeader>
            <CardBody>
              {config ? (
                <Box padding={2}>
                  <Grid.Root gap={{
                    large: 4,
                    medium: 2,
                    initial: 1
                  }}>
                    <Grid.Item col={6} s={12}>
                      <Box padding={2}>
                        <Typography variant="sigma" textColor="neutral600" style={{ marginRight: '8px' }}>Cloud Name</Typography>
                        <Typography variant="omega" fontWeight="semiBold">{config.cloudName || 'Not configured'}</Typography>
                      </Box>
                    </Grid.Item>
                    <Grid.Item col={6} s={12}>
                      <Box padding={2}>
                        <Typography variant="sigma" textColor="neutral600"style={{ marginRight: '8px' }}>Resource Type</Typography>
                        <Typography variant="omega" fontWeight="semiBold">{config.resourceType || 'image'}</Typography>
                      </Box>
                    </Grid.Item>
                    <Grid.Item col={6} s={12}>
                      <Box padding={2}>
                        <Typography variant="sigma" textColor="neutral600"style={{ marginRight: '8px' }}>Folder Path</Typography>
                        <Typography variant="omega" fontWeight="semiBold">{config.folderPath || 'Root folder'}</Typography>
                      </Box>
                    </Grid.Item>
                    <Grid.Item col={6} s={12}>
                      <Box padding={2}>
                        <Typography variant="sigma" textColor="neutral600"style={{ marginRight: '8px' }}>Max Results</Typography>
                        <Typography variant="omega" fontWeight="semiBold">{config.maxResults || 50}</Typography>
                      </Box>
                    </Grid.Item>
                    <Grid.Item col={6} s={12}>
                      <Box padding={2}>
                        <Typography variant="sigma" textColor="neutral600"style={{ marginRight: '8px' }}>Overwrite Existing</Typography>
                        <Badge size="M" active={config.overwrite}>{config.overwrite ? 'Yes' : 'No'}</Badge>
                      </Box>
                    </Grid.Item>
                    <Grid.Item col={6} s={12}>
                      <Box padding={2}>
                        <Typography variant="sigma" textColor="neutral600"style={{ marginRight: '8px' }}>Auto Sync Interval</Typography>
                        <Typography variant="omega" fontWeight="semiBold">
                          {config.syncInterval ? `${config.syncInterval} minutes` : 'Manual only'}
                        </Typography>
                      </Box>
                    </Grid.Item>
                  </Grid.Root>
                </Box>
              ) : (
                <EmptyStateLayout
                  icon={<Information />}
                  content="Configuration not available. Please check your plugin settings."
                />
              )}
            </CardBody>
          </Card>
        </Grid.Item>

        <Grid.Item>
          <Card>
            <CardHeader style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CardTitle style={{ fontSize: '1.7rem' }}>Actions</CardTitle>
              <CardSubtitle>Manage your media synchronization</CardSubtitle>
            </CardHeader>
            <CardBody>
              <Box padding={2}>
                <Flex gap={4} direction="column">
                  <Box>
                    <div style={{ display: 'flex', flexDirection: 'column',}}>
                    <Typography variant="delta">Sync Cloudinary Media</Typography>
                    <Typography variant="pi" textColor="neutral600">
                      Import media assets from your Cloudinary account to Strapi's Media Library
                    </Typography>
                    </div>
                    <Box paddingTop={2}>
                      <Button
                        fullWidth
                        size="L"
                        onClick={handleSync}
                        loading={isSyncing}
                        disabled={!config || !config.cloudName}
                        startIcon={<Upload />}
                        variant="success"
                      >
                        {isSyncing ? 'Syncing...' : 'Synchronize Media'}
                      </Button>
                    </Box>
                  </Box>

                  <Divider />

                  <Box style={{ width: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="delta">Preview Resources</Typography>
                    <Typography variant="pi" textColor="neutral600">
                      View a sample of media assets available in your Cloudinary account
                    </Typography>
                    </div>
                    <Box paddingTop={2}>
                      <Button
                        fullWidth
                        size="L"
                        variant="tertiary"
                        onClick={fetchResources}
                        loading={isLoadingResources}
                        disabled={!config || !config.cloudName}
                        startIcon={<Cloud />}
                      >
                        View Cloudinary Resources
                      </Button>
                    </Box>
                  </Box>
                </Flex>
              </Box>
            </CardBody>
          </Card>
        </Grid.Item>
      </Grid.Root>

      {resources.length > 0 && (
        <Box paddingTop={6}>
          <Card>
            <CardHeader>
              <Box style={{ padding: '16px' }}>
                <CardTitle style={{ fontSize: '2.0rem' }}>Cloudinary Resources Preview</CardTitle>
                <CardSubtitle style={{ fontSize: '1.2rem' }}>Showing {resources.length} resources from your Cloudinary account</CardSubtitle>
              </Box>
            </CardHeader>
            <div style={{ width: '100%'}}>
              <Table colCount={4} rowCount={resources.length + 1} width="100%">
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
                      <Typography variant="sigma">Preview</Typography>
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {resources.map((resource) => (
                    <Tr key={resource.public_id}>
                      <Td>
                        <Typography variant="omega" fontWeight="semiBold">{resource.public_id}</Typography>
                      </Td>
                      <Td>
                        <Badge>{resource.format}</Badge>
                      </Td>
                      <Td>
                        <Typography>{resource.resource_type}</Typography>
                      </Td>
                      <Td>
                        {resource.secure_url && (
                          <img
                            src={resource.secure_url.replace(/upload\/(.*)/, 'upload/w_80,h_80,c_fill/$1')}
                            alt={resource.public_id}
                            style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '4px' }}
                          />
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </div>
          </Card>
        </Box>
      )}

      {resources.length === 0 && isLoadingResources === false && (
        <Box paddingTop={6}>
          <EmptyStateLayout
            icon={<Cloud />}
            content="No Cloudinary resources found or you haven't loaded resources yet."
            action={
              <Button
                variant="secondary"
                startIcon={<Refresh />}
                onClick={fetchResources}
              >
                Load Resources
              </Button>
            }
          />
        </Box>
      )}
    </Main>
  );
};

export { HomePage };
