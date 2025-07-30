import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import FormHelperText from '@mui/material/FormHelperText';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Upload as UploadIcon, ExpandMore as ExpandMoreIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";

// Import the stylesheets
import '../../../assets/styles/global.css';
import '../../../assets/styles/settings.css';

// --- Axios Instance with Auth ---
const getAuthToken = () => localStorage.getItem('token');

const axiosInstance = axios.create({
    baseURL: '/api'
});

axiosInstance.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


const initialCompanyFormData = {
  legalName: "", tradeName: "", companyRegistrationNumber: "", panNumber: "",
  countryCode: "", mobileNumber: "", email: "", website: "", gstType: "",
  gstIsdNumber: "", billingAddressLine1: "", billingAddressLine2: "",
  billingAddressLine3: "", deliveryAddressLine1: "", deliveryAddressLine2: "",
  deliveryAddressLine3: "", state: "", country: "", pinCode: "",
  gstRegistered: false, gstNumber: "", pfEnabled: false, pfNumber: "",
  esicEnabled: false, esicNumber: "", iecRegistered: false, iecNumber: "",
  tdsTcsEnabled: false, tanNumber: "", tdsTcsFinancialYear: "",
  advanceTaxEnabled: false, logo: null, logoPreview: null, msmeEnabled: false,
  msmeNumber: "", vatEnabled: false, vatNumber: "",
  professionTaxEnabled: false, ptrcNumber: "", ptecNumber: "", // Added Profession Tax fields
  organizationType: "",
  businesses: [], // Replaces single nature of business fields
};

const initialNewBusinessState = {
    id: '',
    goodsServicesBoth: '',
    industry: '',
    natureOfBusiness: '',
    organizationCode: ''
};

function CompanyInformation() {
  const [formData, setFormData] = useState(initialCompanyFormData);
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [countryCodes, setCountryCodes] = useState([]);
  const [organizationTypes, setOrganizationTypes] = useState([]);
  const [industryClassifications, setIndustryClassifications] = useState([]);
  const [gstTypes, setGstTypes] = useState([]); // State for dynamic GST types

  // State for the new "add business" row
  const [newBusinessEntry, setNewBusinessEntry] = useState(initialNewBusinessState);


  const [financialYears] = useState(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -4; i <= 4; i++) {
        const startYear = currentYear + i;
        const endYear = startYear + 1;
        years.push(`${startYear}-${endYear.toString().slice(-2)}`);
    }
    return years.reverse();
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setFormErrors({});
      setError(null);

      // Fetch all data concurrently, including the new GST types dropdown
      const [companyResponse, countriesResponse, industriesResponse, rulesResponse, gstTypesResponse] = await axios.all([
        axiosInstance.get('/company-information'),
        axiosInstance.get('/global/countries'),
        axiosInstance.get('/global/industries'),
        axiosInstance.get('/global/docrules'),
        axiosInstance.get('/global/dropdowns/gst_type') // Fetch GST types from global dropdown
      ]);

      if (companyResponse.data && Object.keys(companyResponse.data).length > 0) {
        const companyData = companyResponse.data;
        const businesses = Array.isArray(companyData.businesses) ? companyData.businesses : [];
        setFormData(prev => ({
            ...initialCompanyFormData,
            ...prev,
            ...companyData,
            businesses: businesses,
            logoPreview: companyData.logoUrl || null,
        }));
      }

      if (gstTypesResponse.data && Array.isArray(gstTypesResponse.data)) {
        setGstTypes(gstTypesResponse.data);
      }

      if (countriesResponse.data) {
        const settings = countriesResponse.data.map(s => ({ ...s, states: s.states || [] }));
        const countryOptions = settings.map(s => ({ value: s._id, label: s.regionName, flag: s.flag, states: s.states, countryCode: s.countryCode }));
        setCountries(countryOptions);

        const codeOptions = settings.map(s => ({ value: s.countryCode, flag: s.flag }));
        const uniqueCodeOptions = Array.from(new Set(codeOptions.map(c => c.value)))
          .map(value => codeOptions.find(c => c.value === value)).filter(Boolean);
        setCountryCodes(uniqueCodeOptions);

        if (!companyResponse.data || !companyResponse.data.country) {
            const defaultRegion = settings.find(s => s.isDefaultBase);
            if (defaultRegion) {
                setFormData(prev => ({ ...prev, country: defaultRegion._id, countryCode: defaultRegion.countryCode }));
            }
        }
      }

      if (industriesResponse.data) {
          const industriesData = Array.isArray(industriesResponse.data) && industriesResponse.data.length > 0
              ? industriesResponse.data[0]?.classifications || []
              : [];
          const sanitizedData = industriesData.map(item => ({
              industry: item.industry || item.Industry,
              natureOfBusiness: item.natureOfBusiness || item.NatureOfBusiness,
              code: item.code || item.Code
          })).filter(item => item.industry);
          setIndustryClassifications(sanitizedData);
      }

      if (rulesResponse.data && rulesResponse.data.business_rules) {
          setOrganizationTypes(rulesResponse.data.business_rules);
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch initial page data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (formData.country && countries.length > 0) {
      const selectedRegion = countries.find(c => c.value === formData.country);
      if (selectedRegion && selectedRegion.states) {
        const stateOptions = selectedRegion.states.map(s => ({ value: s.name, label: s.name }));
        setStates(stateOptions);
        if (!stateOptions.some(s => s.value === formData.state)) {
            setFormData(prev => ({ ...prev, state: '' }));
        }
      } else {
         setStates([]);
      }
    } else {
      setStates([]);
    }
  }, [formData.country, countries, formData.state]);

  const industryOptions = useMemo(() => {
    if (!industryClassifications || industryClassifications.length === 0) return [];
    return [...new Set(industryClassifications.map(item => item.industry))];
  }, [industryClassifications]);

  const natureOfBusinessOptions = useMemo(() => {
      if (!industryClassifications || !newBusinessEntry.industry) return [];
      return industryClassifications
          .filter(item => item.industry === newBusinessEntry.industry)
          .map(item => item.natureOfBusiness);
  }, [industryClassifications, newBusinessEntry.industry]);

  useEffect(() => {
      if (newBusinessEntry.industry && newBusinessEntry.natureOfBusiness) {
          const selected = industryClassifications.find(
              item => item.industry === newBusinessEntry.industry && item.natureOfBusiness === newBusinessEntry.natureOfBusiness
          );
          if (selected) {
              setNewBusinessEntry(prev => ({ ...prev, organizationCode: selected.code }));
          }
      }
  }, [newBusinessEntry.industry, newBusinessEntry.natureOfBusiness, industryClassifications]);

  const handleNewBusinessChange = (event) => {
    const { name, value } = event.target;
    setNewBusinessEntry(prev => {
        const newData = { ...prev, [name]: value };
        if (name === 'industry') {
            newData.natureOfBusiness = '';
            newData.organizationCode = '';
        }
        return newData;
    });
  };

  const handleAddBusiness = () => {
    if (!newBusinessEntry.goodsServicesBoth || !newBusinessEntry.industry || !newBusinessEntry.natureOfBusiness) {
        setError("Please select Business Type, Industry, and Nature of Business to add.");
        return;
    }
    setError(null);
    setFormData(prev => ({
        ...prev,
        businesses: [...prev.businesses, { ...newBusinessEntry, id: Date.now() }]
    }));
    setNewBusinessEntry(initialNewBusinessState);
  };

  const handleDeleteBusiness = (idToDelete) => {
    setFormData(prev => ({
        ...prev,
        businesses: prev.businesses.filter(b => b.id !== idToDelete)
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({...prev, [name]: value}));
    if (formErrors[name]) {
        setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSwitchChange = (event) => {
    const { name, checked } = event.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSameAsBillingChange = (event) => {
    const isChecked = event.target.checked;
    setSameAsBilling(isChecked);
    setFormData(prev => ({
      ...prev,
      deliveryAddressLine1: isChecked ? prev.billingAddressLine1 : '',
      deliveryAddressLine2: isChecked ? prev.billingAddressLine2 : '',
      deliveryAddressLine3: isChecked ? prev.billingAddressLine3 : '',
    }));
  };

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { setError("Logo file size should not exceed 2MB."); return; }
      setFormData(prev => ({ ...prev, logo: file, logoPreview: URL.createObjectURL(file) }));
      setError(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true); setError(null); setSuccess(null); setFormErrors({});

    const submissionData = new FormData();
    for (const key in formData) {
      if (formData[key] !== null && key !== 'logoPreview') {
        if (key === 'businesses') {
            submissionData.append(key, JSON.stringify(formData[key]));
        } else {
            submissionData.append(key, formData[key]);
        }
      }
    }

    try {
      const response = await axiosInstance.post('/company-information', submissionData);
      setSuccess(response.data.message || "Company information saved successfully!");
      if (response.data.data) {
          const businesses = Array.isArray(response.data.data.businesses) ? response.data.data.businesses : [];
          setFormData(prev => ({...prev, ...response.data.data, businesses: businesses, logoPreview: response.data.data.logoUrl || prev.logoPreview, logo: null }));
      }
    } catch(err) {
      const resError = err.response?.data;
      if (resError && resError.errors) {
          const newErrors = {};
          resError.errors.forEach(e => {
              newErrors[e.field] = `${e.message} ${e.rule || ''}`;
          });
          setFormErrors(newErrors);
          setError(resError.message || "Please check the highlighted fields.");
      } else {
          setError(resError?.message || "Failed to save company information.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getErrorProps = (fieldName) => ({
      error: !!formErrors[fieldName],
      helperText: formErrors[fieldName] || ''
  });

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  }

  return (
    <div className="main-container">
        <div className="content-wrapper">
          <h4 className="h4-title">Company Information</h4>
          {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

          <Paper component="form" onSubmit={handleSubmit} noValidate className="form-paper">
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                 <h6 className="h6-title">Basic Details</h6>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, mt: 2 }}>
                    <Avatar src={formData.logoPreview || undefined} alt="Company Logo" sx={{ width: 64, height: 64 }}>
                        {!formData.logoPreview && <UploadIcon color="action" />}
                    </Avatar>
                    <Button variant="outlined" component="label">
                        {formData.logo ? "Change Logo" : "Upload Logo"}
                        <input type="file" hidden onChange={handleLogoChange} accept="image/*" />
                    </Button>
                 </Box>
                <TextField margin="normal" required fullWidth label="Legal name" name="legalName" value={formData.legalName} onChange={handleChange} {...getErrorProps('legalName')}/>
                <TextField margin="normal" required fullWidth label="Trade name" name="tradeName" value={formData.tradeName} onChange={handleChange} {...getErrorProps('tradeName')}/>
                <FormControl fullWidth margin="normal" {...getErrorProps('organizationType')}>
                    <InputLabel id="org-type-label">Organization Type *</InputLabel>
                    <Select labelId="org-type-label" name="organizationType" value={formData.organizationType} label="Organization Type *" onChange={handleChange}>
                        {organizationTypes.map(org => (<MenuItem key={org._id} value={org.name}>{org.name}</MenuItem>))}
                    </Select>
                    {formErrors.organizationType && <FormHelperText>{formErrors.organizationType}</FormHelperText>}
                </FormControl>
                <TextField margin="normal" fullWidth label="Company Registration Number" name="companyRegistrationNumber" value={formData.companyRegistrationNumber} onChange={handleChange} {...getErrorProps('companyRegistrationNumber')}/>
                <TextField margin="normal" required fullWidth label="PAN Number" name="panNumber" value={formData.panNumber} onChange={handleChange} {...getErrorProps('panNumber')}/>
                 <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mt: 2 }}>
                    <FormControl sx={{ minWidth: 120 }} {...getErrorProps('countryCode')}>
                        <InputLabel>Code</InputLabel>
                        <Select label="Code" name="countryCode" value={formData.countryCode} onChange={handleChange}>
                            {countryCodes.map((c) => (
                                <MenuItem key={c.value} value={c.value}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}><Box component="span" sx={{ mr: 1.5 }}>{c.flag}</Box>{c.value}</Box>
                                </MenuItem>
                            ))}
                        </Select>
                         {formErrors.countryCode && <FormHelperText>{formErrors.countryCode}</FormHelperText>}
                    </FormControl>
                    <TextField required fullWidth label="Mobile Number" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} {...getErrorProps('mobileNumber')}/>
                 </Box>
                <TextField margin="normal" required fullWidth label="E-mail" name="email" type="email" value={formData.email} onChange={handleChange} {...getErrorProps('email')}/>
                <TextField margin="normal" fullWidth label="Website" name="website" value={formData.website} onChange={handleChange} {...getErrorProps('website')}/>
              </Grid>

              <Grid item xs={12} md={6}>
                <h6 className="h6-title">Address Details</h6>
                <TextField margin="normal" required fullWidth label="Billing Address Line 1" name="billingAddressLine1" value={formData.billingAddressLine1} onChange={handleChange} {...getErrorProps('billingAddressLine1')}/>
                <TextField margin="normal" fullWidth label="Billing Address Line 2" name="billingAddressLine2" value={formData.billingAddressLine2} onChange={handleChange}/>
                <TextField margin="normal" fullWidth label="Billing Address Line 3" name="billingAddressLine3" value={formData.billingAddressLine3} onChange={handleChange}/>
                <Typography variant="h6" gutterBottom sx={{ mt: 2, fontSize: '1.1rem', fontWeight: 600 }}>Delivery Address</Typography>
                <FormControlLabel control={<Switch checked={sameAsBilling} onChange={handleSameAsBillingChange} />} label="Same as billing address" />
                {!sameAsBilling && (
                  <>
                    <TextField margin="normal" required fullWidth label="Delivery Address Line 1" name="deliveryAddressLine1" value={formData.deliveryAddressLine1} onChange={handleChange} {...getErrorProps('deliveryAddressLine1')}/>
                    <TextField margin="normal" fullWidth label="Delivery Address Line 2" name="deliveryAddressLine2" value={formData.deliveryAddressLine2} onChange={handleChange}/>
                    <TextField margin="normal" fullWidth label="Delivery Address Line 3" name="deliveryAddressLine3" value={formData.deliveryAddressLine3} onChange={handleChange}/>
                  </>
                )}
                 <Grid container spacing={2} sx={{mt: 1}}>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth margin="normal" {...getErrorProps('country')}>
                            <InputLabel>Country</InputLabel>
                            <Select label="Country" name="country" value={formData.country} onChange={handleChange}>
                                {countries.map((c) => ( <MenuItem key={c.value} value={c.value}><Box sx={{ display: 'flex', alignItems: 'center' }}><Box component="span" sx={{ mr: 1.5 }}>{c.flag}</Box>{c.label}</Box></MenuItem>))}
                            </Select>
                            {formErrors.country && <FormHelperText>{formErrors.country}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                         <FormControl fullWidth margin="normal" disabled={!formData.country} {...getErrorProps('state')}>
                            <InputLabel>State</InputLabel>
                            <Select label="State" name="state" value={formData.state} onChange={handleChange}>
                                {states.map((s) => (<MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>))}
                            </Select>
                             {formErrors.state && <FormHelperText>{formErrors.state}</FormHelperText>}
                        </FormControl>
                    </Grid>
                 </Grid>
                <TextField margin="normal" required fullWidth label="PIN/ZIP Code" name="pinCode" value={formData.pinCode} onChange={handleChange} {...getErrorProps('pinCode')}/>
              </Grid>
            </Grid>

            <Accordion defaultExpanded className="section-accordion">
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <h6 className="h6-title" style={{ margin: 0 }}>Nature of Business</h6>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Business Type</TableCell>
                                <TableCell>Industry</TableCell>
                                <TableCell>Nature of Business</TableCell>
                                <TableCell>Code</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {formData.businesses.map((business) => (
                                <TableRow key={business.id}>
                                    <TableCell>{business.goodsServicesBoth}</TableCell>
                                    <TableCell>{business.industry}</TableCell>
                                    <TableCell>{business.natureOfBusiness}</TableCell>
                                    <TableCell>{business.organizationCode}</TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => handleDeleteBusiness(business.id)} size="small">
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Business Type</InputLabel>
                                        <Select name="goodsServicesBoth" value={newBusinessEntry.goodsServicesBoth} label="Business Type" onChange={handleNewBusinessChange}>
                                            <MenuItem value="Goods">Goods</MenuItem>
                                            <MenuItem value="Services">Services</MenuItem>
                                            <MenuItem value="Both">Both</MenuItem>
                                        </Select>
                                    </FormControl>
                                </TableCell>
                                <TableCell>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Industry</InputLabel>
                                        <Select name="industry" value={newBusinessEntry.industry} label="Industry" onChange={handleNewBusinessChange}>
                                            {industryOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </TableCell>
                                <TableCell>
                                     <FormControl fullWidth size="small" disabled={!newBusinessEntry.industry}>
                                        <InputLabel>Nature of Business</InputLabel>
                                        <Select name="natureOfBusiness" value={newBusinessEntry.natureOfBusiness} label="Nature of Business" onChange={handleNewBusinessChange}>
                                            {natureOfBusinessOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </TableCell>
                                <TableCell>
                                    <TextField fullWidth size="small" label="Code" name="organizationCode" value={newBusinessEntry.organizationCode} disabled InputProps={{ readOnly: true }} />
                                </TableCell>
                                <TableCell align="right">
                                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddBusiness} size="small">
                                        Add
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded className="section-accordion">
              <AccordionSummary expandIcon={<ExpandMoreIcon />}><h6 className="h6-title" style={{ margin: 0 }}>Compliance & Tax Information</h6></AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3} alignItems="flex-start">
                   <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={formData.gstRegistered} onChange={handleSwitchChange} name="gstRegistered" />} label="GST Registered" />{formData.gstRegistered && ( <> <TextField margin="dense" required fullWidth label="GST Number" name="gstNumber" value={formData.gstNumber} onChange={handleChange} {...getErrorProps('gstNumber')}/> <FormControl fullWidth margin="dense"> <InputLabel>GST Type</InputLabel> <Select label="GST Type" name="gstType" value={formData.gstType} onChange={handleChange}> {gstTypes.map((gst) => (<MenuItem key={gst.value} value={gst.value}>{gst.label}</MenuItem>))} </Select> </FormControl> <TextField margin="dense" fullWidth label="GST ISD Number" name="gstIsdNumber" value={formData.gstIsdNumber} onChange={handleChange}/> </>)}</Grid>
                   <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={formData.vatEnabled} onChange={handleSwitchChange} name="vatEnabled" />} label="VAT Enabled" />{formData.vatEnabled && (<TextField margin="dense" required fullWidth label="VAT Number" name="vatNumber" value={formData.vatNumber} onChange={handleChange} {...getErrorProps('vatNumber')}/>)}</Grid>
                   <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={formData.tdsTcsEnabled} onChange={handleSwitchChange} name="tdsTcsEnabled" />} label="TDS/TCS Enabled" />{formData.tdsTcsEnabled && (<Box sx={{ pt: 1 }}><TextField margin="dense" required fullWidth label="TAN Number" name="tanNumber" value={formData.tanNumber} onChange={handleChange} {...getErrorProps('tanNumber')}/><FormControl fullWidth margin="dense"><InputLabel>Since which financial year</InputLabel><Select label="Since which financial year" name="tdsTcsFinancialYear" value={formData.tdsTcsFinancialYear} onChange={handleChange}>{financialYears.map((year) => (<MenuItem key={year} value={year}>{year}</MenuItem>))}</Select></FormControl></Box>)}</Grid>
                   <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={formData.advanceTaxEnabled} onChange={handleSwitchChange} name="advanceTaxEnabled" />} label="Advance Tax Enabled" /></Grid>
                   <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={formData.professionTaxEnabled} onChange={handleSwitchChange} name="professionTaxEnabled" />} label="Profession Tax Enabled" />{formData.professionTaxEnabled && (<><TextField margin="dense" required fullWidth label="PTRC Number" name="ptrcNumber" value={formData.ptrcNumber} onChange={handleChange} {...getErrorProps('ptrcNumber')}/><TextField margin="dense" required fullWidth label="PTEC Number" name="ptecNumber" value={formData.ptecNumber} onChange={handleChange} {...getErrorProps('ptecNumber')}/></>)}</Grid>
                   <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={formData.esicEnabled} onChange={handleSwitchChange} name="esicEnabled" />} label="ESIC Enabled" />{formData.esicEnabled && (<TextField margin="dense" required fullWidth label="ESIC Number" name="esicNumber" value={formData.esicNumber} onChange={handleChange} {...getErrorProps('esicNumber')}/>)}</Grid>
                   <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={formData.pfEnabled} onChange={handleSwitchChange} name="pfEnabled" />} label="PF Enabled" />{formData.pfEnabled && (<TextField margin="dense" required fullWidth label="PF Number" name="pfNumber" value={formData.pfNumber} onChange={handleChange} {...getErrorProps('pfNumber')}/>)}</Grid>
                   <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={formData.iecRegistered} onChange={handleSwitchChange} name="iecRegistered" />} label="IEC Registered" />{formData.iecRegistered && (<TextField margin="dense" required fullWidth label="IEC Number" name="iecNumber" value={formData.iecNumber} onChange={handleChange} {...getErrorProps('iecNumber')}/>)}</Grid>
                   <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={formData.msmeEnabled} onChange={handleSwitchChange} name="msmeEnabled" />} label="MSME Registered" />{formData.msmeEnabled && (<TextField margin="dense" required fullWidth label="MSME Number" name="msmeNumber" value={formData.msmeNumber} onChange={handleChange} {...getErrorProps('msmeNumber')}/>)}</Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <div className="button-container">
              <Button type="submit" className="btn-save" disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : "Save All Information"}
              </Button>
            </div>
          </Paper>
        </div>
    </div>
  );
}

export default function App() {
  return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CompanyInformation />
      </LocalizationProvider>
  );
}