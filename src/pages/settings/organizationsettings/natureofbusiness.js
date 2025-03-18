import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

function NatureOfBusiness() {
  const [goodsServicesBoth, setGoodsServicesBoth] = useState("");
  const [natureOfBusiness, setNatureOfBusiness] = useState("");
  const [industry, setIndustry] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [organizationCode, setOrganizationCode] = useState("");
  const [showCustomNatureOfBusiness, setShowCustomNatureOfBusiness] = useState(false);
  const [showCustomIndustry, setShowCustomIndustry] = useState(false);
  const [customNatureOfBusiness, setCustomNatureOfBusiness] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");

  const handleGoodsServicesBothChange = (event) => {
    setGoodsServicesBoth(event.target.value);
  };

  const handleNatureOfBusinessChange = (event) => {
    setNatureOfBusiness(event.target.value);
    if (event.target.value === "Others") {
      setShowCustomNatureOfBusiness(true);
    } else {
      setShowCustomNatureOfBusiness(false);
    }
  };

  const handleIndustryChange = (event) => {
    setIndustry(event.target.value);
    if (event.target.value === "Others") {
      setShowCustomIndustry(true);
    } else {
      setShowCustomIndustry(false);
    }
  };

  const handleOrganizationTypeChange = (event) => {
    setOrganizationType(event.target.value);
  };

  const handleSave = () => {
    console.log({
      goodsServicesBoth,
      natureOfBusiness: natureOfBusiness === "Others" ? customNatureOfBusiness : natureOfBusiness,
      industry: industry === "Others" ? customIndustry : industry,
      organizationType,
      organizationCode,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Nature of Business
      </Typography>

      {/* Goods/Services/Both */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="goods-services-both-label">Goods/Services/Both *</InputLabel>
        <Select
          labelId="goods-services-both-label"
          id="goodsServicesBoth"
          value={goodsServicesBoth}
          label="Goods/Services/Both *"
          onChange={handleGoodsServicesBothChange}
        >
          <MenuItem value="Goods">Goods</MenuItem>
          <MenuItem value="Services">Services</MenuItem>
          <MenuItem value="Both">Both</MenuItem>
        </Select>
      </FormControl>

      {/* Nature of Business */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="nature-of-business-label">Nature of Business *</InputLabel>
        <Select
          labelId="nature-of-business-label"
          id="natureOfBusiness"
          value={natureOfBusiness}
          label="Nature of Business *"
          onChange={handleNatureOfBusinessChange}
        >
          <MenuItem value="Manufacturing">Manufacturing</MenuItem>
          <MenuItem value="Trading">Trading</MenuItem>
          <MenuItem value="Service">Service</MenuItem>
          <MenuItem value="Others">Others</MenuItem>
        </Select>
      </FormControl>

      {showCustomNatureOfBusiness && (
        <TextField
          fullWidth
          margin="normal"
          label="Specify Nature of Business"
          value={customNatureOfBusiness}
          onChange={(e) => setCustomNatureOfBusiness(e.target.value)}
        />
      )}

      {/* Industry */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="industry-label">Industry *</InputLabel>
        <Select
          labelId="industry-label"
          id="industry"
          value={industry}
          label="Industry *"
          onChange={handleIndustryChange}
        >
          <MenuItem value="Automobile">Automobile</MenuItem>
          <MenuItem value="IT">IT</MenuItem>
          <MenuItem value="Healthcare">Healthcare</MenuItem>
          <MenuItem value="Others">Others</MenuItem>
        </Select>
      </FormControl>

      {showCustomIndustry && (
        <TextField
          fullWidth
          margin="normal"
          label="Specify Industry"
          value={customIndustry}
          onChange={(e) => setCustomIndustry(e.target.value)}
        />
      )}

      {/* Organization Type */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="organization-type-label">Organization Type *</InputLabel>
        <Select
          labelId="organization-type-label"
          id="organizationType"
          value={organizationType}
          label="Organization Type *"
          onChange={handleOrganizationTypeChange}
        >
          <MenuItem value="HUF">HUF</MenuItem>
          <MenuItem value="Partnership">Partnership</MenuItem>
          <MenuItem value="LLP">LLP</MenuItem>
          <MenuItem value="Private Limited">Private Limited</MenuItem>
          <MenuItem value="Public Limited">Public Limited</MenuItem>
          <MenuItem value="Non-Profit Organisation">Non-Profit Organisation</MenuItem>
          <MenuItem value="Trust">Trust</MenuItem>
        </Select>
      </FormControl>

      {/* Organization Code */}
      <TextField
        fullWidth
        margin="normal"
        label="Organization Code"
        value={organizationCode}
        onChange={(e) => setOrganizationCode(e.target.value)}
      />

      {/* Save Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        sx={{ mt: 2 }}
      >
        Save
      </Button>
    </Box>
  );
}

export default NatureOfBusiness;