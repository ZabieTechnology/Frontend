import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, IconButton, List, ListItem, ListItemText, Collapse,
    Dialog, DialogTitle, DialogContent, TextField, DialogActions, Paper,
    CircularProgress, Alert, ListSubheader
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Lock as LockIcon,
    LockOpen as LockOpenIcon,
    ExpandMore,
    ChevronRight,
} from '@mui/icons-material';
import axios from 'axios';

// --- API Helper ---
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';
const api = {
    getClassifications: () => axios.get(`${API_BASE_URL}/api/account-classifications`, { withCredentials: true }),
    // Add
    addNature: (name) => axios.post(`${API_BASE_URL}/api/account-classifications/nature`, { name }, { withCredentials: true }),
    addMainHead: (nature, name) => axios.post(`${API_BASE_URL}/api/account-classifications/main-head`, { nature, name }, { withCredentials: true }),
    addCategory: (nature, mainHead, name) => axios.post(`${API_BASE_URL}/api/account-classifications/category`, { nature, mainHead, name }, { withCredentials: true }),
    addOption: (nature, mainHead, category, name) => axios.post(`${API_BASE_URL}/api/account-classifications/option`, { nature, mainHead, category, name }, { withCredentials: true }),
    // Delete
    deleteNature: (name) => axios.delete(`${API_BASE_URL}/api/account-classifications/nature/${name}`, { withCredentials: true }),
    deleteMainHead: (nature, name) => axios.delete(`${API_BASE_URL}/api/account-classifications/main-head`, { data: { nature, name }, withCredentials: true }),
    deleteCategory: (nature, mainHead, name) => axios.delete(`${API_BASE_URL}/api/account-classifications/category`, { data: { nature, mainHead, name }, withCredentials: true }),
    deleteOption: (nature, mainHead, category, name) => axios.delete(`${API_BASE_URL}/api/account-classifications/option`, { data: { nature, mainHead, category, name }, withCredentials: true }),
    // Edit
    editNature: (oldName, newName) => axios.put(`${API_BASE_URL}/api/account-classifications/nature`, { oldName, newName }, { withCredentials: true }),
    editMainHead: (nature, oldName, newName) => axios.put(`${API_BASE_URL}/api/account-classifications/main-head`, { nature, oldName, newName }, { withCredentials: true }),
    editCategory: (nature, mainHead, oldName, newName) => axios.put(`${API_BASE_URL}/api/account-classifications/category`, { nature, mainHead, oldName, newName }, { withCredentials: true }),
    editOption: (nature, mainHead, category, oldName, newName) => axios.put(`${API_BASE_URL}/api/account-classifications/option`, { nature, mainHead, category, oldName, newName }, { withCredentials: true }),
    // Lock
    updateLockStatus: (level, context, isLocked) => axios.patch(`${API_BASE_URL}/api/account-classifications/lock`, { level, context, isLocked }, { withCredentials: true }),
};

// --- Main Component ---
function AccountClassificationSettings() {
    const [classifications, setClassifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [expandedItems, setExpandedItems] = useState({});
    const [dialogConfig, setDialogConfig] = useState({ open: false, mode: '', context: {}, title: '' });
    const [itemName, setItemName] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.getClassifications();
            const grouped = (response.data || []).reduce((acc, item) => {
                if (!acc[item.nature]) {
                    acc[item.nature] = { name: item.nature, isLocked: item.isLocked, mainHeads: {} };
                }
                if (item.mainHead && !acc[item.nature].mainHeads[item.mainHead]) {
                    acc[item.nature].mainHeads[item.mainHead] = { name: item.mainHead, isLocked: item.isLocked, categories: {} };
                }
                if (item.mainHead && item.category && !acc[item.nature].mainHeads[item.mainHead].categories[item.category]) {
                    acc[item.nature].mainHeads[item.mainHead].categories[item.category] = { name: item.category, isLocked: item.isLocked, enableOptions: item.enableOptions || [] };
                } else if (item.mainHead && item.category) {
                    acc[item.nature].mainHeads[item.mainHead].categories[item.category].enableOptions.push(...item.enableOptions);
                }
                return acc;
            }, {});

            const finalStructure = Object.values(grouped).map(nature => ({
                ...nature,
                mainHeads: Object.values(nature.mainHeads).map(mh => ({
                    ...mh,
                    categories: Object.values(mh.categories).map(cat => ({
                       ...cat,
                       enableOptions: [...new Set(cat.enableOptions)]
                    }))
                }))
            }));

            setClassifications(finalStructure);

        } catch (err) {
            setError(`Failed to load classifications: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggle = (id) => {
        setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleOpenDialog = (mode, context = {}, currentName = '') => {
        const titles = {
            add_nature: 'Add New Nature',
            add_mainHead: `Add Main Head to "${context.nature}"`,
            add_category: `Add Category to "${context.mainHead}"`,
            add_option: `Add Option to "${context.category}"`,
            edit_nature: `Edit Nature "${currentName}"`,
            edit_mainHead: `Edit Main Head "${currentName}"`,
            edit_category: `Edit Category "${currentName}"`,
            edit_option: `Edit Option "${currentName}"`,
        };
        setDialogConfig({ open: true, mode, context, title: titles[mode] });
        setItemName(currentName);
    };

    const handleCloseDialog = () => {
        setDialogConfig({ open: false, mode: '', context: {} });
        setItemName('');
        setError(null);
    };

    const handleSave = async () => {
        if (!itemName.trim()) {
            setError("Name cannot be empty.");
            return;
        }
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const { mode, context } = dialogConfig;
            const action = mode.split('_')[0];
            const level = mode.split('_')[1];

            if (action === 'add') {
                 switch (level) {
                    case 'nature': await api.addNature(itemName); break;
                    case 'mainHead': await api.addMainHead(context.nature, itemName); break;
                    case 'category': await api.addCategory(context.nature, context.mainHead, itemName); break;
                    case 'option': await api.addOption(context.nature, context.mainHead, context.category, itemName); break;
                    default: throw new Error("Invalid add mode");
                }
                setSuccess("Item added successfully!");
            } else if (action === 'edit') {
                 switch (level) {
                    case 'nature': await api.editNature(context.name, itemName); break;
                    case 'mainHead': await api.editMainHead(context.nature, context.name, itemName); break;
                    case 'category': await api.editCategory(context.nature, context.mainHead, context.name, itemName); break;
                    case 'option': await api.editOption(context.nature, context.mainHead, context.category, context.name, itemName); break;
                    default: throw new Error("Invalid edit mode");
                }
                setSuccess("Item updated successfully!");
            }

            handleCloseDialog();
            fetchData(); // Refresh data
        } catch (err) {
            setError(`Failed to save: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (mode, context) => {
        if (!window.confirm(`Are you sure you want to delete "${context.name}"? This action may be irreversible.`)) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
             switch (mode) {
                case 'nature': await api.deleteNature(context.name); break;
                case 'mainHead': await api.deleteMainHead(context.nature, context.name); break;
                case 'category': await api.deleteCategory(context.nature, context.mainHead, context.name); break;
                case 'option': await api.deleteOption(context.nature, context.mainHead, context.category, context.name); break;
                default: throw new Error("Invalid delete mode");
            }
            setSuccess("Item deleted successfully!");
            fetchData(); // Refresh data
        } catch(err) {
            setError(`Failed to delete: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    }

    const handleToggleLock = async (level, context, currentLockState) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await api.updateLockStatus(level, context, !currentLockState);
            setSuccess(`Item ${!currentLockState ? 'locked' : 'unlocked'} successfully!`);
            fetchData(); // Refresh data
        } catch(err) {
            setError(`Failed to update lock status: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };


    const renderItem = (item, level, context = {}, parentIsLocked = false) => {
        const id = Object.values(context).concat(item.name).join('/');
        const isExpanded = expandedItems[id];
        const hasChildren = (item.mainHeads && item.mainHeads.length > 0) || (item.categories && item.categories.length > 0) || (item.enableOptions && item.enableOptions.length > 0);
        const isLocked = item.isLocked || parentIsLocked;

        const childContext = { ...context, [level]: item.name };
        let children = null;
        let nextLevel = '';
        let addContext = {};

        if (level === 'nature') {
            children = item.mainHeads;
            nextLevel = 'mainHead';
            addContext = { mode: 'add_mainHead', context: { nature: item.name } };
        } else if (level === 'mainHead') {
            children = item.categories;
            nextLevel = 'category';
            addContext = { mode: 'add_category', context: { nature: context.nature, mainHead: item.name } };
        } else if (level === 'category') {
            children = item.enableOptions.map(name => ({name, isLocked: item.isLocked })); // Options inherit lock status from category
            nextLevel = 'option';
            addContext = { mode: 'add_option', context: { nature: context.nature, mainHead: context.mainHead, category: item.name } };
        }

        const currentFullContext = { ...context, name: item.name };

        return (
            <React.Fragment key={id}>
                <ListItem sx={{ pl: (level === 'nature' ? 2 : (level === 'mainHead' ? 4 : (level === 'category' ? 6 : 8))) }}>
                    <IconButton onClick={() => hasChildren && handleToggle(id)} size="small" sx={{ mr: 1 }} disabled={!hasChildren}>
                        {hasChildren ? (isExpanded ? <ExpandMore /> : <ChevronRight />) : <Box sx={{width: 28}} /> }
                    </IconButton>
                    <ListItemText primary={item.name} />

                    {level !== 'option' && (
                        <IconButton onClick={() => handleOpenDialog(addContext.mode, addContext.context)} size="small" color="primary" disabled={isLocked}>
                            <AddIcon />
                        </IconButton>
                    )}
                    <IconButton onClick={() => handleOpenDialog(`edit_${level}`, currentFullContext, item.name)} size="small" disabled={isLocked}>
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(level, currentFullContext)} size="small" color="error" disabled={isLocked}>
                        <DeleteIcon />
                    </IconButton>
                     {level !== 'option' && (
                        <IconButton onClick={() => handleToggleLock(level, currentFullContext, item.isLocked)} size="small" color={item.isLocked ? "secondary" : "default"} disabled={parentIsLocked}>
                            {item.isLocked ? <LockIcon /> : <LockOpenIcon />}
                        </IconButton>
                     )}
                </ListItem>
                {hasChildren && (
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {children.map(child => renderItem(child, nextLevel, childContext, isLocked))}
                        </List>
                    </Collapse>
                )}
            </React.Fragment>
        );
    };

    return (
        <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
            <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4">Account Classifications</Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog('add_nature')}
                    >
                        Add Nature
                    </Button>
                </Box>
                {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}
            </Paper>

            <Paper sx={{p: 1}}>
                {loading && !dialogConfig.open ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                ) : (
                    <List subheader={<ListSubheader component="div">Classification Hierarchy</ListSubheader>}>
                        {classifications.length > 0 ? (
                            classifications.map(nature => renderItem(nature, 'nature'))
                        ) : (
                            <ListItem><ListItemText primary="No classifications found. Start by adding a nature." align="center" /></ListItem>
                        )}
                    </List>
                )}
            </Paper>

            <Dialog open={dialogConfig.open} onClose={handleCloseDialog} fullWidth maxWidth="xs">
                <DialogTitle>{dialogConfig.title}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{mb:2}}>{error}</Alert>}
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default AccountClassificationSettings;
