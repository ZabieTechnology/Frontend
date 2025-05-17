import React, { useState, useCallback } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'; // Import MUI components

// --- MUI Confirmation Dialog Component ---
// This component uses Material UI for a consistent look and feel.
const MuiConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose} // Allows closing by clicking outside or pressing Esc
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
    >
      <DialogTitle id="confirmation-dialog-title">
        {title || 'Confirm Action'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirmation-dialog-description">
          {/* Handle potential newline characters in the message for proper rendering */}
          {message.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        {/* Add color="error" for destructive actions */}
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// --- The Custom Hook ---

/**
 * A custom hook to manage a confirmation dialog using Material UI.
 *
 * @returns {Object} An object containing:
 * - `confirm`: A function to trigger the confirmation dialog.
 * It takes an options object: { title, message, onConfirmAction }.
 * - `ConfirmationDialog`: A React component to render the actual MUI modal.
 */
const useConfirmationDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState({
    title: 'Are you sure?',
    message: 'This action cannot be undone.',
    onConfirmAction: () => {}, // Function to call if confirmed
  });

  // Function to open the dialog with specific options
  const confirm = useCallback((confirmOptions) => {
    setOptions({
        title: confirmOptions.title || 'Are you sure?',
        message: confirmOptions.message || 'This action cannot be undone.',
        onConfirmAction: confirmOptions.onConfirmAction || (() => {}),
    });
    setIsOpen(true);
  }, []); // No dependencies needed

  // Function called when the user clicks "Confirm" in the modal
  const handleConfirm = useCallback(() => {
    options.onConfirmAction(); // Execute the action passed to confirm()
    setIsOpen(false); // Close the modal
  }, [options.onConfirmAction]); // Dependency

  // Function called when the user clicks "Cancel" or closes the modal
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // The component part of the hook that renders the MUI modal
  const ConfirmationDialog = useCallback(() => (
    <MuiConfirmationDialog
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={options.title}
      message={options.message}
    />
  ), [isOpen, handleClose, handleConfirm, options.title, options.message]); // Dependencies

  return { confirm, ConfirmationDialog };
};

export default useConfirmationDialog;
