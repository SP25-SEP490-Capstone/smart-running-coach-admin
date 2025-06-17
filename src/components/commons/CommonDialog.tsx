import { Button, Dialog, DialogActions} from "@mui/material";
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import React from "react";
import "./CommonDialog.scss";
import CloseIcon from "@mui/icons-material/Close";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface CommonDialogProps {
  className?: string;
  title?: string;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  minHeight?: string;
  open: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  [key: string]: any;
}

export default function CommonDialog({
  className = "",
  title = "Dialog",
  maxWidth = "md",
  minHeight = "fit-content",
  open,
  onClose = () => {},
  children,
  footer,
  ...props
}: CommonDialogProps) {
  return (
    <Dialog
      className={`common-dialog ${className}`}
      open={open}
      fullWidth
      maxWidth={maxWidth}
      onClose={onClose}
      TransitionComponent={Transition as any}
      PaperProps={{ style: { minHeight } }}
      {...props}
    >
      <div className="dialog-titlebar">
        <div></div>
        <p>{title}</p>
        <div className="btn-titlebar">
          <Button className="btn-close" onClick={onClose}>
            <CloseIcon />
          </Button>
        </div>
      </div>
      <div className="dialog-content">{children}</div>
      <DialogActions>{footer}</DialogActions>
    </Dialog>
  );
}

