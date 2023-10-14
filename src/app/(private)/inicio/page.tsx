import Link from "next/link";
import Image from "next/image";

import { Wrapper } from "@/components/common/Wrapper";

import TicketIcon from "@/assets/icons/ticket.svg?url";
import CalendarIcon from "@/assets/icons/calendar.svg?url";

import routes from "@/routes";

export default function Home() {
  return (
    <Wrapper className="mt-3">
      <div>
        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          <Link
            href={routes.private.raffle.list}
            className="mt-4 bg-white shadow-md p-4 w-36 flex flex-col items-center rounded-xl hover:shadow-lg transition-shadow duration-300"
          >
            <Image src={TicketIcon} alt="Ticket icon" className="w-8" />
            <span className="text-sm text-gray font-semibold">
              Minhas Rifas
            </span>
          </Link>
          <Link
            href={routes.private.events.list}
            className="mt-4 bg-white shadow-md p-4 w-36 flex flex-col items-center rounded-xl hover:shadow-lg transition-shadow duration-300"
          >
            <Image src={CalendarIcon} alt="Calendar icon" className="w-8" />
            <span className="text-sm text-gray font-semibold">
              Meus eventos
            </span>
          </Link>
        </div>
      </div>
    </Wrapper>
  );
}
