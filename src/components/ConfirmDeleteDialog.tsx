import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
} from "@material-tailwind/react";
import Button from "./common/Button";

interface ConfirmDeleteDialogProps {
  open: boolean;
  handler: () => void;
  header?: string;
  body?: string;
  isLoadingRefuse?: boolean;
  isLoadingConfirm?: boolean;
  handleRefuse?(): void | Promise<void> | Promise<any>;
  handleDelete(): void | Promise<void> | Promise<any>;
}

export default function ConfirmDeleteDialog({
  open,
  handler,
  header,
  body,
  isLoadingRefuse,
  isLoadingConfirm,
  handleRefuse,
  handleDelete,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} handler={handler}>
      <DialogHeader>{header || "Excluir"}</DialogHeader>
      <DialogBody>{body || "Tem certeza que deseja excluir?"}</DialogBody>
      <DialogFooter className="space-x-2">
        <Button onClick={handleRefuse || handler} isLoading={isLoadingRefuse}>
          Não
        </Button>
        <Button
          colorVariant="outlined"
          isLoading={isLoadingConfirm}
          onClick={handleDelete}
        >
          Sim
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
