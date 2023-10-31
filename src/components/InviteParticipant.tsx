/* eslint-disable no-unused-vars */
import Image from "next/image";

import { Badge, Spinner } from "@material-tailwind/react";
import Button from "./common/Button";
import Input from "./common/Input";
import InvitesModal from "@/app/(private)/(raffle)/rifas/[shortName]/components/InvitesModal";

import CopyIcon from "@/assets/icons/copy.svg?url";
import MenuIcon from "@/assets/icons/profile.svg?url";
import { IUser } from "@/@types/user.type";
import { Timestamp } from "firebase/firestore";
import cx from "classix";

interface ItemProps {
  id: string;
  name: string;
  shortName: string;
  userId: string;
  inviteUri: string;
  inviteCode: string;
  sharedUsers: string[];
  participants: IUser[];
  updatedAt: Timestamp;
  createdAt: Timestamp;
  deletedAt: Timestamp;
  isDeleted: boolean;
}

interface InviteParticipantProps {
  item: any;
  invites: any[];
  isLoadingItem: boolean;
  isOpenInvitesModal: boolean;
  containerClassName?: string;
  handleCopyInviteLink(): void;
  handleOpenInvitesModal(): void;
  handleAcceptInviteRequest(invite: any): void;
  handleCancelInviteRequest(invite: any): void;
}

export function InviteParticipant({
  invites,
  isLoadingItem,
  handleCopyInviteLink,
  handleOpenInvitesModal,
  isOpenInvitesModal,
  handleAcceptInviteRequest,
  handleCancelInviteRequest,
  ...props
}: InviteParticipantProps) {
  const item = props.item as ItemProps;

  return (
    <div className={cx("w-full", props.containerClassName)}>
      <div className=" bg-white shadow-md md:w-[480px] lg:w-[400px] xl:w-[100%] p-6 h-60 xs:h-52">
        <div>
          <h3 className="text-lg text-gray-dark max-w-sm">
            Convide pessoas para gerenciar com você
          </h3>
        </div>
        <div className="mt-5 relative">
          <Input
            variant="outlined"
            defaultValue={item?.inviteUri}
            className="pr-14"
            disabled
          />
          <Button
            colorVariant="ghost"
            className="!absolute right-1 top-1 rounded"
            size="sm"
            onClick={handleCopyInviteLink}
          >
            <Image src={CopyIcon} alt="Copy Icon" className="w-5" />
          </Button>
        </div>
        <div className="mt-4">
          <Badge invisible={!invites.length} content={invites.length}>
            <Button
              colorVariant="ghost"
              size="sm"
              onClick={handleOpenInvitesModal}
            >
              Gerenciar convites
            </Button>
          </Badge>
        </div>
        <InvitesModal
          open={isOpenInvitesModal}
          handler={handleOpenInvitesModal}
          invites={invites}
          handleAcceptInviteRequest={handleAcceptInviteRequest}
          handleCancelInviteRequest={handleCancelInviteRequest}
        />
      </div>

      <div className=" mt-5 bg-white shadow-md md:w-[480px] lg:w-[400px] xl:w-[100%] p-6 h-auto">
        <div className="mb-5">
          <h3 className="text-lg text-gray-dark max-w-sm">Participantes</h3>
        </div>
        {isLoadingItem ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : item?.sharedUsers && !item.sharedUsers.length ? (
          <div>
            <span className="text-xs text-gray italic">
              Você ainda não possui participantes
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap justify-start gap-4">
            {!!item &&
              item.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex flex-col items-center gap-2 cursor-pointer select-none"
                >
                  <Image
                    priority
                    src={participant.profileImageUrl || MenuIcon}
                    alt="Profile image"
                    className="w-14 rounded-full bg-gray-light p-2"
                  />
                  <span className="text-sm text-gray font-semibold">
                    {participant.username}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
