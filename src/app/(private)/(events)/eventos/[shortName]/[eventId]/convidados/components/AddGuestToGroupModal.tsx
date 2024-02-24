"use client";

import { IEventGuest, IEventGuestGroup } from "@/@types/event.type";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import eventService from "@/services/event";
import {
  Checkbox,
  DialogBody,
  DialogFooter,
  DialogHeader,
  List,
  ListItem,
  ListItemPrefix,
} from "@material-tailwind/react";
import { Modal, message } from "antd";
import { useCallback, useState } from "react";

interface AddGuestToGroupModalProps {
  open: boolean;
  handleCancel: () => void;
  guestGroup: IEventGuestGroup | undefined;
  eventId: string;
  shortName: string;
  guests: IEventGuest[];
}

export default function AddGuestToGroupModal({
  handleCancel,
  open,
  guestGroup,
  guests,
}: AddGuestToGroupModalProps) {
  const [searchedGuests, setSearchedGuests] = useState<IEventGuest[]>(guests);
  const [selectedGuests, setSelectedGuests] = useState<IEventGuest[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const onSearchGuest = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const searchText = e.target.value;

      if (searchText.length < 3) {
        if (searchText.length === 0) {
          setSearchedGuests(guests);
        }
        return;
      }

      setSearchedGuests(
        guests.filter((guest) => guest.name.includes(searchText))
      );
    },
    [guests]
  );

  const handleSelectGuest = useCallback(
    (guest: IEventGuest) => {
      const guestIndex = selectedGuests.findIndex((g) => g.id === guest.id);
      if (guestIndex === -1) {
        setSelectedGuests((prev) => [...prev, guest]);
        return;
      }
      const cloneSelectedGuests = [...selectedGuests];
      cloneSelectedGuests.splice(guestIndex, 1);
      setSelectedGuests(cloneSelectedGuests);
    },
    [selectedGuests]
  );

  const handleAddGuest = useCallback(() => {
    setIsLoading(true);
    try {
      message.success("Convidado adicionado com sucesso");
      eventService.addGuestToGroup(
        {
          eventGuestGroupId: guestGroup?.id as string,
        },
        { guestIds: selectedGuests.map((guest) => guest.id) }
      );
      handleCancel();
    } catch (error: any) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [guestGroup?.id, handleCancel, selectedGuests]);

  return (
    <Modal open={open} onCancel={handleCancel} footer="">
      <DialogHeader>Adicionar convidado ao grupo</DialogHeader>
      <DialogBody className="pt-0">
        <Input label="Encontrar convidado/grupo" onChange={onSearchGuest} />
        <div className="mt-5 h-[250px] max-h-[300px] overflow-y-auto">
          <List className="flex flex-wrap flex-row p-0">
            {searchedGuests.map((guest) => {
              const isAlreadyGroupGuest = guestGroup?.guestIds.includes(
                guest.id
              );
              return (
                <ListItem
                  key={guest.id}
                  className="p-0 w-full md:w-[250px] xl:w-[300px]"
                >
                  <label
                    htmlFor={guest.id}
                    className="flex w-full cursor-pointer items-center px-3 py-2"
                  >
                    <ListItemPrefix className="mr-3">
                      <Checkbox
                        id={guest.id}
                        crossOrigin=""
                        ripple={false}
                        className="hover:before:opacity-0"
                        color="blue"
                        containerProps={{
                          className: "p-0",
                        }}
                        onChange={() => handleSelectGuest(guest)}
                        disabled={isAlreadyGroupGuest}
                        defaultChecked={isAlreadyGroupGuest}
                      />
                    </ListItemPrefix>
                    <span className="text-sm text-gray-dark">{guest.name}</span>
                  </label>
                </ListItem>
              );
            })}
          </List>
        </div>
      </DialogBody>
      <DialogFooter className="flex flex-col">
        <Button
          className="self-start"
          type="button"
          onClick={handleAddGuest}
          isLoading={isLoading}
        >
          Adicionar
        </Button>
      </DialogFooter>
    </Modal>
  );
}
