import { useCallback } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogBody,
  DialogHeader,
  IconButton,
} from "@material-tailwind/react";
import { message } from "antd";

import CloseIcon from "@/assets/icons/close.svg?url";
import MenuIcon from "@/assets/icons/profile.svg?url";
import CheckWhiteIcon from "@/assets/icons/check-white.svg?url";
import CloseWhiteIcon from "@/assets/icons/close-white.svg?url";

import { IRaffleInvite } from "@/@types/raffle.type";
import raffleService from "@/services/raffle";

interface InvitesModalProps {
  open: boolean;
  handler: () => void;
  raffleInvites: IRaffleInvite[];
}

export default function InvitesModal({
  open,
  handler,
  raffleInvites,
}: InvitesModalProps) {
  const handleAcceptInviteRequest = useCallback(
    async (invite: IRaffleInvite) => {
      if (!invite) return;
      try {
        await raffleService.acceptRaffleInviteRequest({
          invitatedUserId: invite.userId,
          raffleId: invite.raffleId,
          inviteId: invite.id,
        });
        message.success("Convite aceito com sucesso");
        handler();
      } catch (error: any) {
        message.error(error.message);
      }
    },
    [handler]
  );

  const handleCancelInviteRequest = useCallback(
    async (invite: IRaffleInvite) => {
      try {
        await raffleService.cancelRaffleInviteRequest(invite.id);
        message.success("Convite recusado com sucesso");
        handler();
      } catch (error: any) {
        message.error(error.message);
      }
    },
    [handler]
  );

  return (
    <Dialog open={open} handler={handler}>
      <DialogHeader className="justify-between">
        <h1 className="text-xl font-semibold text-gray-dark">
          Gerenciar convites
        </h1>
        <IconButton
          color="blue-gray"
          size="sm"
          variant="text"
          onClick={handler}
        >
          <Image src={CloseIcon} alt="Close icon" />
        </IconButton>
      </DialogHeader>
      <DialogBody className="pt-0">
        <div className="flex flex-col gap-2">
          {!raffleInvites.length ? (
            <div>
              <span className="text-xs text-gray italic">
                Nenhuma solicitação de participação da rifa
              </span>
            </div>
          ) : (
            raffleInvites.map((invite) => (
              <div key={invite.id} className="flex items-center gap-3">
                <Image
                  priority
                  src={invite.user.profileImageUrl || MenuIcon}
                  alt="Profile image"
                  className="w-6 rounded-full"
                />
                <span className="text-md text-gray font-semibold">
                  {invite.user.username}
                </span>
                <div className="flex items-center gap-1">
                  <IconButton
                    className="rounded-full bg-danger"
                    size="sm"
                    onClick={() => handleCancelInviteRequest(invite)}
                  >
                    <Image src={CloseWhiteIcon} alt="Close white icon" />
                  </IconButton>
                  <IconButton
                    className="rounded-full bg-success"
                    size="sm"
                    onClick={() => handleAcceptInviteRequest(invite)}
                  >
                    <Image src={CheckWhiteIcon} alt="Check white icon" />
                  </IconButton>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogBody>
    </Dialog>
  );
}
