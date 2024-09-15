import React, { FC, useState } from 'react';
import { ActionProps, ApiClient, useNotice } from 'adminjs';
import { saveAs } from 'file-saver';
import format from 'date-fns/format';
import {
  DropZoneItem,
  Loader,
  Box,
  Button,
  DropZone,
} from '@adminjs/design-system';

export const getExportedFileName = (extension: string) =>
  `export-${format(Date.now(), 'yyyy-MM-dd_HH-mm')}.${extension}`;

const ConnectivityPlanner: FC<ActionProps> = ({ resource }) => {
  const [file, setFile] = useState<null | File>(null);
  const sendNotice = useNotice();
  const [isFetching, setFetching] = useState<boolean>(false);

  const onUpload = (uploadedFile: File[]) => {
    setFile(uploadedFile?.[0] ?? null);
  };

  const onSubmit = async () => {
    if (!file) {
      return;
    }
    setFetching(true);
    try {
      const importData = new FormData();
      importData.append('file', file, file?.name);
      const response = await new ApiClient().resourceAction({
        method: 'post',
        resourceId: resource.id,
        actionName: 'ImportConnectivityPlanner',
        data: importData,
        params: {
          type: 'text/csv'
        }
      });

      if (response.data.succeeded) {
        const blob = new Blob([response.data.exportedData], { type: 'text/csv' });
        saveAs(blob, response.data.filename || getExportedFileName('csv'));
        sendNotice({ message: response.data.notice.message, type: 'success' });
      } else {
        sendNotice({ message: response.data.notice.message, type: 'error' });
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        sendNotice({ message: e.message, type: 'error' });
      } else {
        sendNotice({ message: 'An unknown error occurred', type: 'error' });
      }
    }
    setFetching(false);
  };

  if (isFetching) {
    return <Loader />;
  }

  return (
    <Box
      margin="auto"
      maxWidth={600}
      display="flex"
      justifyContent="center"
      flexDirection="column"
    >
      <DropZone files={[]} onChange={onUpload} multiple={false} />
      {file && (
        <DropZoneItem
          file={file}
          filename={file.name}
          onRemove={() => setFile(null)}
        />
      )}
      <Box display="flex" justifyContent="center" m={10}>
        <Button onClick={onSubmit} disabled={!file || isFetching}>
          Upload
        </Button>
      </Box>
    </Box>
  );
};

export default ConnectivityPlanner;