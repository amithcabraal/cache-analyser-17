import { Box, Button, TextField, Typography, Stack, LinearProgress } from '@mui/material';
import { NetworkRequest } from '../types';
import { useState } from 'react';
import { parseCacheControl, determineCacheUsed } from '../utils/cacheParser';

interface DataImportProps {
  onDataImport: (data: NetworkRequest[]) => void;
  onClose: () => void;
  onFileNameUpdate: (name: string | null) => void;
}

export function DataImport({ onDataImport, onClose, onFileNameUpdate }: DataImportProps) {
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const processHarFile = async (harData: any): Promise<NetworkRequest[]> => {
    setIsProcessing(true);
    
    try {
      const entries = harData.log.entries;
      const processedData = entries.map((entry: any) => {
        const cacheControl = entry.response.headers.find((h: any) => h.name.toLowerCase() === "cache-control")?.value || null;
        const xCache = entry.response.headers.find((h: any) => h.name.toLowerCase() === "x-cache")?.value || null;
        const parsedCacheControl = parseCacheControl(cacheControl);
        const fulfilledBy = entry.response._fulfilledBy || null;
        const status = entry.response.status;

        return {
          "1.method": entry.request.method,
          "2.url": entry.request.url,
          "3.cache-control": cacheControl,
          "4.x-cache": xCache,
          "5.x-amz-cf-pop": entry.response.headers.find((h: any) => h.name.toLowerCase() === "x-amz-cf-pop")?.value || null,
          "5.time": entry.time,
          "6.size": entry.response.content.size,
          "7.status": status,
          "8.fulfilledBy": fulfilledBy,
          "parsed.cache-control": parsedCacheControl,
          "parsed.cache-used": determineCacheUsed(fulfilledBy, parsedCacheControl, xCache, status)
        };
      });
      
      return processedData;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const text = await file.text();
      const data = JSON.parse(text);
      
      onFileNameUpdate(file.name);
      
      if (data.log && data.log.entries) {
        const processedData = await processHarFile(data);
        onDataImport(processedData);
        onClose();
      } else if (Array.isArray(data)) {
        // Process existing JSON data to add parsed fields
        const processedData = data.map(entry => {
          const parsedCacheControl = parseCacheControl(entry["3.cache-control"]);
          return {
            ...entry,
            "parsed.cache-control": parsedCacheControl,
            "parsed.cache-used": determineCacheUsed(
              entry["8.fulfilledBy"], 
              parsedCacheControl, 
              entry["4.x-cache"],
              entry["7.status"]
            )
          };
        });
        onDataImport(processedData);
        onClose();
      } else {
        alert('Invalid data format. Please upload a HAR file or JSON array.');
      }
    } catch (error) {
      alert('Error parsing file. Please check the format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUrlImport = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch(urlInput);
      const data = await response.json();
      if (Array.isArray(data)) {
        const urlParts = urlInput.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        onFileNameUpdate(lastPart || null);
        
        const processedData = data.map(entry => {
          const parsedCacheControl = parseCacheControl(entry["3.cache-control"]);
          return {
            ...entry,
            "parsed.cache-control": parsedCacheControl,
            "parsed.cache-used": determineCacheUsed(
              entry["8.fulfilledBy"], 
              parsedCacheControl, 
              entry["4.x-cache"],
              entry["7.status"]
            )
          };
        });
        onDataImport(processedData);
        onClose();
      } else {
        alert('Invalid data format. URL must return a JSON array.');
      }
    } catch (error) {
      alert('Error fetching data from URL. Please check the URL and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Import Data</Typography>
      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle1" gutterBottom>Upload File:</Typography>
          <Stack direction="row" spacing={2}>
            <input
              accept=".har,.json,application/json"
              style={{ display: 'none' }}
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
            />
            <label htmlFor="file-upload">
              <Button variant="contained" component="span" disabled={isProcessing}>
                Upload HAR/JSON File
              </Button>
            </label>
          </Stack>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Supported formats: HAR files (.har) or JSON array
          </Typography>
        </Box>
        
        {isProcessing && (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
            <Typography variant="caption" sx={{ mt: 1 }}>
              Processing file...
            </Typography>
          </Box>
        )}
        
        <Typography variant="h6">Or import from URL:</Typography>
        <TextField
          fullWidth
          label="Data URL"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="https://example.com/data.json"
          disabled={isProcessing}
        />
        <Button
          variant="contained"
          onClick={handleUrlImport}
          disabled={!urlInput || isProcessing}
        >
          Import from URL
        </Button>
      </Stack>
    </Box>
  );
}