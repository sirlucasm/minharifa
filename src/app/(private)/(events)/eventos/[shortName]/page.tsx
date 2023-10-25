"use client";
import { useCallback, useEffect, useState, useMemo } from "react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { Wrapper } from "@/components/common/Wrapper";
import {
  Breadcrumbs,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  IconButton,
  List,
  ListItem,
  ListItemSuffix,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
  Progress,
  Spinner,
} from "@material-tailwind/react";
import Button from "@/components/common/Button";

import MenuDotHorizontalIcon from "@/assets/icons/menu-dot-horizontal.svg?url";
import PlusIcon from "@/assets/icons/plus.svg?url";
import PencilIcon from "@/assets/icons/pencil.svg?url";
import GroupPeopleIcon from "@/assets/icons/group-people.svg?url";

import routes from "@/routes";
import eventService from "@/services/event";
import useAuth from "@/hooks/useAuth";
import { IEvent, IEventBudget } from "@/@types/event.type";
import { message } from "antd";
import { convertNumberToCurrency } from "@/utils/currency";
import moment from "moment";
import {
  DocumentData,
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/configs/firebase";
import CreateOrEditEventBudgetModal from "./components/CreateOrEditEventBudgetModal";
import cx from "classix";
import { getStorage, setStorage } from "@/utils/storage";

interface ShowEventProps {
  params: {
    shortName: string;
  };
  searchParams: {
    cinvitation?: string;
  };
}

export default function ShowEvent({ params, searchParams }: ShowEventProps) {
  const { shortName } = params;

  if (searchParams.cinvitation)
    redirect(routes.private.event.requestInvite(shortName));

  const router = useRouter();
  const { currentUser } = useAuth();

  const [showConfirmEventDeleteDialog, setShowConfirmEventDeleteDialog] =
    useState(false);
  const [showCreateEventBudgetModal, setShowCreateEventBudgetModal] =
    useState(false);
  const [showMoneyProgress, setShowMoneyProgress] = useState(
    useMemo(() => {
      const moneyProgress = getStorage("show_money_progress");
      return moneyProgress !== undefined ? (moneyProgress as boolean) : true;
    }, [])
  );
  const [event, setEvent] = useState<IEvent | undefined>();
  const [eventBudgets, setEventBudgets] = useState<IEventBudget[]>([]);
  const [selectedEventBudget, setSelectedEventBudget] = useState<
    IEventBudget | undefined
  >();
  const [isLoadingEvent, setIsLoadingEvent] = useState(false);
  const [isLoadingDeleteEvent, setIsLoadingDeleteEvent] = useState(false);

  const budgetTotalValue = useMemo(
    () => eventBudgets.reduce((acc, curr) => curr.value + acc, 0),
    [eventBudgets]
  );

  const fetchEvent = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingEvent(true);
    try {
      const response = await eventService.get(shortName, currentUser.id);
      setEvent(response);
    } catch (error: any) {
      message.error(error.message);
      router.replace(routes.private.event.list);
    } finally {
      setIsLoadingEvent(false);
    }
  }, [currentUser, shortName, router]);

  const handleDeleteEvent = useCallback(async () => {
    if (!event) return;
    setIsLoadingDeleteEvent(true);
    try {
      await eventService.delete(event.id);
      message.success("A Rifa foi excluída com sucesso");
      router.replace(routes.private.event.list);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setIsLoadingDeleteEvent(false);
    }
  }, [event, router]);

  const handleOpenConfirmEventDeleteDialog = useCallback(() => {
    setShowConfirmEventDeleteDialog(!showConfirmEventDeleteDialog);
  }, [showConfirmEventDeleteDialog, setShowConfirmEventDeleteDialog]);

  const handleOpenCreateEventBudgetModal = useCallback(() => {
    setShowCreateEventBudgetModal(!showCreateEventBudgetModal);
  }, [showCreateEventBudgetModal, setShowCreateEventBudgetModal]);

  const handleHideMoneyProgress = useCallback(() => {
    setShowMoneyProgress((prev: boolean) => !prev);
    setStorage("show_money_progress", !showMoneyProgress);
  }, [showMoneyProgress]);

  useEffect(() => {
    if (!event) return;
    const eventBudgetsRef = collection(db, "eventBudgets");
    const q = query(
      eventBudgetsRef,
      where("eventId", "==", event.id),
      where("isDeleted", "==", false)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const budgets: DocumentData[] = [];
      snapshot.forEach(async (response) => budgets.push(response.data()));
      setEventBudgets(budgets as IEventBudget[]);
    });

    return () => unsub();
  }, [event]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return (
    <Wrapper className="mt-5 mb-10 w-full">
      <Breadcrumbs>
        <Link href={routes.private.home} className="opacity-60">
          Inicio
        </Link>
        <Link href={routes.private.event.list} className="opacity-60">
          Eventos
        </Link>
        <Link href={routes.private.event.show(shortName)}>{shortName}</Link>
      </Breadcrumbs>
      <div className="flex flex-col lg:flex-row gap-4">
        {isLoadingEvent || !event ? (
          <Spinner className="w-5" />
        ) : (
          <>
            <div className="w-full">
              <div className="mt-5 bg-white shadow-md md:w-[480px] lg:w-[100%] p-6 relative">
                <div>
                  <h3 className="text-xl font-semibold text-gray-dark">
                    {event?.name}
                  </h3>
                  <p className="text-sm text-gray italic">
                    /{event?.shortName}
                  </p>
                  <p className="text-sm text-gray my-2.5">
                    {event?.description}
                  </p>
                </div>
                <div className="flex flex-col">
                  {moment().isBetween(
                    moment(event?.startAt.toDate()),
                    moment(event?.endAt.toDate())
                  ) ? (
                    <span className="text-sm text-success">
                      Acontecendo agora
                    </span>
                  ) : (
                    <>
                      <span className="text-sm text-gray">
                        {moment(event?.startAt.toDate()).isBefore()
                          ? "Aconteceu em "
                          : "Começa "}
                        {moment(event?.startAt.toDate()).format("DD/MM/YYYY")}{" "}
                        às {moment(event?.startAt.toDate()).format("HH:mm")}
                      </span>
                      <span className="text-sm text-gray">
                        {moment(event?.startAt.toDate()).isBefore()
                          ? "Terminou em "
                          : "Termina "}
                        {moment(event?.endAt.toDate()).format("DD/MM/YYYY")} às{" "}
                        {moment(event?.endAt.toDate()).format("HH:mm")}
                      </span>
                    </>
                  )}
                </div>
                <Menu>
                  <MenuHandler>
                    <IconButton
                      className="!absolute right-2 top-3"
                      variant="text"
                    >
                      <Image
                        src={MenuDotHorizontalIcon}
                        alt="MenuDotHorizontal icon"
                        className="w-12"
                      />
                    </IconButton>
                  </MenuHandler>
                  <MenuList>
                    <Link
                      href={routes.private.event.edit(shortName)}
                      className="outline-none hover:!outline-none"
                    >
                      <MenuItem>Editar</MenuItem>
                    </Link>
                    <MenuItem
                      onClick={handleOpenConfirmEventDeleteDialog}
                      className="outline-none text-danger hover:!text-danger hover:!outline-none"
                    >
                      Excluir
                    </MenuItem>
                  </MenuList>
                </Menu>
              </div>

              <div className="mt-5 bg-white shadow-md md:w-[480px] lg:w-[100%] p-6 flex flex-col gap-2">
                <div className="flex flex-row items-center gap-2">
                  <h3 className="text-lg text-gray-dark max-w-sm">Orçamento</h3>
                  <IconButton
                    className=""
                    variant="text"
                    onClick={handleOpenCreateEventBudgetModal}
                  >
                    <Image src={PlusIcon} alt="Plus icon" className="w-12" />
                  </IconButton>
                </div>
                {!!eventBudgets.length && (
                  <List className="p-0">
                    {eventBudgets.map((budget) => (
                      <ListItem
                        ripple={false}
                        className="py-1 pr-1 pl-4"
                        key={budget.id}
                      >
                        <div className="flex flex-col">
                          <h3 className="text-gray font-semibold text-md">
                            {budget.name}
                          </h3>
                          <span
                            className={cx(
                              "text-gray text-sm",
                              !showMoneyProgress && "blur-[2.3px]"
                            )}
                          >
                            {convertNumberToCurrency(budget.value)}
                          </span>
                        </div>
                        <ListItemSuffix>
                          <IconButton
                            className=""
                            variant="text"
                            onClick={() => {
                              handleOpenCreateEventBudgetModal();
                              setSelectedEventBudget(budget);
                            }}
                          >
                            <Image
                              src={PencilIcon}
                              alt="Pencil icon"
                              className="w-12"
                            />
                          </IconButton>
                        </ListItemSuffix>
                      </ListItem>
                    ))}
                    <div
                      className="flex flex-col items-center xs:flex-row mt-5 gap-2 xs:gap-5"
                      onClick={handleHideMoneyProgress}
                    >
                      <div>
                        <h3
                          className={cx(
                            "text-md text-gray cursor-pointer",
                            !showMoneyProgress && "blur-[3px]"
                          )}
                        >
                          {convertNumberToCurrency(budgetTotalValue)}
                        </h3>
                      </div>
                      <Progress
                        value={
                          (100 * budgetTotalValue) / Number(event?.budgetValue)
                        }
                        size="lg"
                        className={cx(
                          "[&>div]:bg-primary",
                          !showMoneyProgress && "blur-[3px]"
                        )}
                      />
                      <div>
                        <h3
                          className={cx(
                            "text-md text-gray cursor-pointer",
                            !showMoneyProgress && "blur-[3px]"
                          )}
                        >
                          {convertNumberToCurrency(event?.budgetValue)}
                        </h3>
                      </div>
                    </div>
                  </List>
                )}
              </div>
            </div>

            <div className="mt-5 w-full">
              <div className=" bg-white shadow-md md:w-[480px] lg:w-[400px] xl:w-[100%] p-6">
                <div>
                  <h3 className="text-lg text-gray-dark max-w-sm">
                    Convidados
                  </h3>
                </div>
                <div className="mt-3 flex overflow-x-auto gap-2 p-3">
                  <Link
                    href={routes.private.eventGuests.create(
                      shortName,
                      event?.id || ""
                    )}
                    className="bg-white shadow-md p-2 w-32 flex flex-col items-center rounded-xl hover:shadow-lg transition-shadow duration-300"
                  >
                    <Image src={PlusIcon} alt="Plus icon" className="w-7" />
                    <span className="text-sm text-gray font-semibold text-center">
                      Adicionar
                    </span>
                  </Link>
                  <Link
                    href={routes.private.eventGuests.list(
                      shortName,
                      event?.id || ""
                    )}
                    className="bg-white shadow-md p-2 w-32 flex flex-col items-center rounded-xl hover:shadow-lg transition-shadow duration-300"
                  >
                    <Image
                      src={GroupPeopleIcon}
                      alt="Group People icon"
                      className="w-7"
                    />
                    <span className="text-sm text-gray font-semibold text-center">
                      Listar
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog
        open={showConfirmEventDeleteDialog}
        handler={handleOpenConfirmEventDeleteDialog}
      >
        <DialogHeader>Excluir evento</DialogHeader>
        <DialogBody>Tem certeza que deseja excluir este evento?</DialogBody>
        <DialogFooter className="space-x-2">
          <Button onClick={handleOpenConfirmEventDeleteDialog}>Não</Button>
          <Button
            colorVariant="outlined"
            isLoading={isLoadingDeleteEvent}
            onClick={handleDeleteEvent}
          >
            Sim
          </Button>
        </DialogFooter>
      </Dialog>
      <CreateOrEditEventBudgetModal
        open={showCreateEventBudgetModal}
        handler={handleOpenCreateEventBudgetModal}
        event={event}
        eventBudget={selectedEventBudget}
        setSelectedEventBudget={setSelectedEventBudget}
      />
    </Wrapper>
  );
}
