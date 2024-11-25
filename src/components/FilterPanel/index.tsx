import { Grid } from '@mui/material';
import { NetworkRequest, Filter } from '../../types';
import { uniq } from 'lodash';
import { FilterAutocomplete } from './FilterAutocomplete';
import { cacheRankings } from '../../types/cacheRanking';

interface FilterPanelProps {
  filters: Filter;
  onFilterChange: (filters: Filter) => void;
  data: NetworkRequest[];
}

export function FilterPanel({ filters, onFilterChange, data }: FilterPanelProps) {
  const methods = uniq(data.map(item => item['1.method']));
  const cacheControls = uniq(data.map(item => item['3.cache-control']));
  const xCaches = uniq(data.map(item => item['4.x-cache']));
  const fulfilledBy = uniq(data.map(item => item['8.fulfilledBy']).filter(Boolean));
  const domains = uniq(data.map(item => {
    try {
      return new URL(item['2.url']).hostname;
    } catch {
      return '';
    }
  }).filter(Boolean));

  const handleFilterChange = (key: keyof Filter) => (value: string | string[] | null) => {
    onFilterChange({
      ...filters,
      [key]: value || undefined
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={2}>
        <FilterAutocomplete
          value={filters.method || null}
          onChange={handleFilterChange('method')}
          options={methods}
          label="Method"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <FilterAutocomplete
          value={filters.domains || []}
          onChange={handleFilterChange('domains')}
          options={domains}
          label="Domains"
          multiple
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <FilterAutocomplete
          value={filters.urlPattern || null}
          onChange={handleFilterChange('urlPattern')}
          options={domains}
          label="URL Pattern"
          placeholder="Pattern with *"
          freeSolo
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <FilterAutocomplete
          value={filters.cacheControl || null}
          onChange={handleFilterChange('cacheControl')}
          options={cacheControls}
          label="Cache Control"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <FilterAutocomplete
          value={filters.xCache || null}
          onChange={handleFilterChange('xCache')}
          options={xCaches}
          label="X-Cache"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <FilterAutocomplete
          value={filters.fulfilledBy || null}
          onChange={handleFilterChange('fulfilledBy')}
          options={fulfilledBy}
          label="Fulfilled By"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <FilterAutocomplete
          value={filters.cacheRank || null}
          onChange={handleFilterChange('cacheRank')}
          options={cacheRankings.map(rank => rank.rank)}
          label="Cache Rank"
        />
      </Grid>
    </Grid>
  );
}