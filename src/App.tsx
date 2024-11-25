import { useState, useEffect } from 'react';
import { Container, Box, Paper, AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, TextField, Button, Stack } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { FilterPanel } from './components/FilterPanel/index';
import { DashboardGrid } from './components/DashboardGrid';
import { DataTable } from './components/DataTable';
import { DataImport } from './components/DataImport';
import { HelpDialog } from './components/HelpDialog';
import { NetworkRequest, Filter, PanelConfig } from './types';
import { filterData } from './utils/filters';
import { useUrlState } from './hooks/useUrlState';

const defaultPanels: PanelConfig[] = [
  { i: 'size-by-cache', x: 0, y: 0, w: 6, h: 2, type: 'size-by-cache' },
  { i: 'requests-by-cache', x: 6, y: 0, w: 6, h: 2, type: 'requests-by-cache' },
  { i: 'size-by-pop', x: 0, y: 2, w: 6, h: 2, type: 'size-by-pop' },
  { i: 'requests-by-pop', x: 6, y: 2, w: 6, h: 2, type: 'requests-by-pop' },
  { i: 'size-by-type', x: 0, y: 4, w: 6, h: 2, type: 'size-by-type' },
  { i: 'requests-by-type', x: 6, y: 4, w: 6, h: 2, type: 'requests-by-type' },
  { i: 'domain-cache', x: 0, y: 6, w: 12, h: 3, type: 'domain-cache' },
  { i: 'domain-requests', x: 0, y: 9, w: 12, h: 3, type: 'domain-requests' },
  { i: 'data-table', x: 0, y: 12, w: 12, h: 4, type: 'data-table' }
];

export function App() {
  const [data, setData] = useState<NetworkRequest[]>([]);
  const [filters, setFilters] = useUrlState<Filter>('filters', {});
  const [panels, setPanels] = useState<PanelConfig[]>(() => {
    const saved = localStorage.getItem('dashboardLayout');
    return saved ? JSON.parse(saved) : defaultPanels;
  });
  const [filteredData, setFilteredData] = useState<NetworkRequest[]>([]);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [showImport, setShowImport] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filename, setFilename] = useState('network-analysis');
  const [originalFilename, setOriginalFilename] = useState<string | null>(null);

  useEffect(() => {
    setFilteredData(filterData(data, filters));
  }, [data, filters]);

  useEffect(() => {
    localStorage.setItem('dashboardLayout', JSON.stringify(panels));
  }, [panels]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    handleMenuClose();
  };

  const handleNew = () => {
    setShowImport(true);
    handleMenuClose();
  };

  const handleHelp = () => {
    setShowHelp(true);
    handleMenuClose();
  };

  const handleSaveDialogOpen = () => {
    setFilename(originalFilename || 'network-analysis');
    setShowSaveDialog(true);
    handleMenuClose();
  };

  const handleSaveJson = () => {
    if (!data.length) return;
    
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    element.href = URL.createObjectURL(file);
    element.download = `${filename}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setShowSaveDialog(false);
  };

  const handleFileNameUpdate = (name: string | null) => {
    if (name) {
      const cleanName = name.replace(/\.har$|\.json$/, '');
      setOriginalFilename(cleanName);
      setFilename(cleanName);
    }
  };

  const handleFilterChange = (newFilters: Partial<Filter>) => {
    setFilters({ ...filters, ...newFilters });
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenuClick}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Cache Analyzer
          </Typography>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleNew}>New</MenuItem>
        <MenuItem onClick={handleSaveDialogOpen} disabled={!data.length}>Save as JSON</MenuItem>
        <MenuItem onClick={handleShare}>Share</MenuItem>
        <MenuItem onClick={handleHelp}>How to use</MenuItem>
      </Menu>

      <Container maxWidth={false}>
        <Box sx={{ my: 4 }}>
          {showImport ? (
            <Paper sx={{ p: 2, mb: 2 }}>
              <DataImport
                onDataImport={setData}
                onClose={() => setShowImport(false)}
                onFileNameUpdate={handleFileNameUpdate}
              />
            </Paper>
          ) : (
            <>
              <Paper sx={{ p: 2, mb: 2 }}>
                <FilterPanel
                  filters={filters}
                  onFilterChange={setFilters}
                  data={data}
                />
              </Paper>
              
              <Paper sx={{ p: 2, mb: 2 }}>
                <DashboardGrid 
                  data={filteredData}
                  panels={panels}
                  onLayoutChange={setPanels}
                  onFilterChange={handleFilterChange}
                />
              </Paper>

              <Paper sx={{ p: 2, height: '600px' }}>
                <DataTable data={filteredData} />
              </Paper>
            </>
          )}
        </Box>
      </Container>

      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)}>
        <DialogTitle>Save Analysis</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1, minWidth: '300px' }}>
            <TextField
              label="Filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              fullWidth
              helperText=".json will be automatically appended"
            />
            <Button variant="contained" onClick={handleSaveJson}>
              Save
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <HelpDialog
        open={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </>
  );
}