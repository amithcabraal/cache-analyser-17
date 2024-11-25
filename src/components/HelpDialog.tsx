import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText } from '@mui/material';

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
}

export function HelpDialog({ open, onClose }: HelpDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>How to Use Cache Analyzer</DialogTitle>
      <DialogContent>
        <List>
          <ListItem>
            <ListItemText
              primary="Data Import"
              secondary="Import network traffic data from a JSON file or URL. The data should contain HTTP request details including cache status and size information."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Filtering"
              secondary="Use the filter panel to narrow down requests by method, URL pattern, cache control headers, and CloudFront POP location. Filters are automatically saved in the URL for sharing."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Dashboard"
              secondary="View interactive charts showing cache performance metrics. Charts can be resized and rearranged to customize your view."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Sharing"
              secondary="Share your analysis by copying the URL, which includes your current filters and data source."
            />
          </ListItem>
        </List>
      </DialogContent>
    </Dialog>
  );
}