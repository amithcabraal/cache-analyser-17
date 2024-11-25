import { TextField, Autocomplete } from '@mui/material';

interface FilterAutocompleteProps {
  value: string | null;
  onChange: (value: string | null) => void;
  options: (string | null)[];
  label: string;
  placeholder?: string;
  freeSolo?: boolean;
}

export function FilterAutocomplete({
  value,
  onChange,
  options,
  label,
  placeholder,
  freeSolo = false
}: FilterAutocompleteProps) {
  const filteredOptions = options.filter((option): option is string => option !== null);

  return (
    <Autocomplete
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      options={filteredOptions}
      freeSolo={freeSolo}
      renderInput={(params) => (
        <TextField 
          {...params} 
          label={label}
          placeholder={placeholder}
          size="small"
          fullWidth
        />
      )}
      size="small"
      fullWidth
      isOptionEqualToValue={(option, value) => option === value}
      getOptionLabel={(option) => option || ''}
    />
  );
}
