import { DataGrid, GridColDef, GridValueGetterParams, GridToolbar } from '@mui/x-data-grid';
import { NetworkRequest } from '../types';
import { getCacheRank } from '../types/cacheRanking';
import { Box, Link } from '@mui/material';

interface DataTableProps {
  data: NetworkRequest[];
}

export function DataTable({ data }: DataTableProps) {
  const columns: GridColDef[] = [
    { field: '1.method', headerName: 'Method', width: 100 },
    { 
      field: '2.url', 
      headerName: 'URL', 
      width: 400,
      renderCell: (params) => (
        <Link 
          href={params.value as string} 
          target="_blank"
          rel="noopener noreferrer"
          sx={{ 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          {params.value}
        </Link>
      )
    },
    { field: '3.cache-control', headerName: 'Cache Control', width: 200 },
    { field: '4.x-cache', headerName: 'X-Cache', width: 200 },
    { field: '5.x-amz-cf-pop', headerName: 'CF-POP', width: 150 },
    { field: '5.time', headerName: 'Time (ms)', width: 130, type: 'number' },
    { field: '6.size', headerName: 'Size (bytes)', width: 130, type: 'number' },
    { field: '7.status', headerName: 'Status', width: 100, type: 'number' },
    { field: '8.fulfilledBy', headerName: 'Fulfilled By', width: 150 },
    { field: 'parsed.cache-used', headerName: 'Cache Used', width: 150 },
    { 
      field: 'cache-rank',
      headerName: 'Cache Rank',
      width: 150,
      valueGetter: (params: GridValueGetterParams<NetworkRequest>) => {
        const rank = getCacheRank(params.row);
        return rank.rank;
      },
      renderCell: (params) => {
        const rank = getCacheRank(params.row);
        return (
          <Box sx={{ 
            color: rank.color,
            fontWeight: 'bold'
          }}>
            {rank.rank}
          </Box>
        );
      }
    },
    { 
      field: 'cache-type',
      headerName: 'Cache Type',
      width: 120,
      valueGetter: (params) => {
        const cc = params.row['parsed.cache-control'];
        if (cc.public) return 'public';
        if (cc.private) return 'private';
        return 'unspecified';
      }
    },
    {
      field: 'cacheable',
      headerName: 'Cacheable',
      width: 120,
      valueGetter: (params) => {
        const cc = params.row['parsed.cache-control'];
        if (cc['no-cache']) return 'no-cache';
        if (cc['no-store']) return 'no-store';
        return 'cache';
      }
    },
    {
      field: 'max-age',
      headerName: 'Max Age',
      width: 120,
      type: 'number',
      valueGetter: (params) => params.row['parsed.cache-control']['max-age']
    },
    {
      field: 's-max-age',
      headerName: 'S-Max Age',
      width: 120,
      type: 'number',
      valueGetter: (params) => params.row['parsed.cache-control']['s-max-age']
    }
  ];

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <h2>Data Table</h2>
      <DataGrid
        rows={data.map((row, index) => ({ id: index, ...row }))}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 25 },
          },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        checkboxSelection
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-row': {
            minHeight: '52px !important',
            maxHeight: '52px !important',
          },
        }}
      />
    </div>
  );
}
