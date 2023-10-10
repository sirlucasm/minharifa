import Image from "next/image";
import {
  Dialog,
  DialogBody,
  DialogHeader,
  IconButton,
  Spinner,
} from "@material-tailwind/react";
import { message } from "antd";

import CloseIcon from "@/assets/icons/close.svg?url";
import MenuIcon from "@/assets/icons/profile.svg?url";
import CheckWhiteIcon from "@/assets/icons/check-white.svg?url";
import CloseWhiteIcon from "@/assets/icons/close-white.svg?url";

import { useCallback, useEffect, useState } from "react";
import { IRaffleInvite } from "@/@types/raffle.type";
import raffleService from "@/services/raffle";

interface InvitesModalProps {
  open: boolean;
  handler: () => void;
  raffleId: string | undefined;
}

export default function InvitesModal({
  open,
  handler,
  raffleId,
}: InvitesModalProps) {
  const [invites, setInvites] = useState<IRaffleInvite[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRaffleInvites = useCallback(async () => {
    if (!raffleId) return;
    setIsLoading(true);
    const response = await raffleService.getInviteRequestsAndUser(raffleId);

    setInvites(response);
    setIsLoading(false);
  }, [raffleId]);

  const handleAcceptInviteRequest = useCallback(
    async (invite: IRaffleInvite) => {
      if (!raffleId) return;
      try {
        await raffleService.acceptRaffleInviteRequest({
          invitatedUserId: invite.userId,
          raffleId: raffleId,
          inviteId: invite.id,
        });
        message.success("Convite aceito com sucesso");
        handler();
      } catch (error: any) {
        message.error(error.message);
      }
    },
    [raffleId, handler]
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

  useEffect(() => {
    fetchRaffleInvites();
  }, [fetchRaffleInvites]);

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
      <DialogBody>
        <div className="">
          <h3 className="text-sm text-gray font-semibold">
            Pedidos de participação
          </h3>

          {isLoading ? (
            <Spinner />
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              {invites.map((invite) => (
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
              ))}
            </div>
          )}
        </div>
      </DialogBody>
    </Dialog>
  );
}
