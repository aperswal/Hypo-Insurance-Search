import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Paper, Typography, Box } from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';

const InsuranceSortComponent = ({ onSortChange }) => {
  const handleSortChange = (event) => {
    onSortChange(event.target.value);
  };

  return (
    <Paper elevation={3} sx={{ mb: 3, mt: 4, p: 2, borderRadius: 2 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <SortIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">Sort Insurance Plans</Typography>
      </Box>
      <FormControl fullWidth>
        <InputLabel>Sort by</InputLabel>
        <Select defaultValue="" onChange={handleSortChange}>
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value="premium_asc">Premium (Low to High)</MenuItem>
          <MenuItem value="premium_desc">Premium (High to Low)</MenuItem>
          <MenuItem value="deductible_asc">Deductible (Low to High)</MenuItem>
          <MenuItem value="deductible_desc">Deductible (High to Low)</MenuItem>
          <MenuItem value="rating_desc">Quality Rating (High to Low)</MenuItem>
        </Select>
      </FormControl>
    </Paper>
  );
};

export default InsuranceSortComponent;